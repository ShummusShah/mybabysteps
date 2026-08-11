import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { Baby } from '@/types';
import { useStore } from '@/stores/useStore';

export function useBaby() {
  const { currentBabyId, setCurrentBabyId } = useStore();
  const queryClient = useQueryClient();

  const { data: baby, isLoading } = useQuery({
    queryKey: ['baby', currentBabyId],
    queryFn: async () => {
      if (!currentBabyId) return null;

      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .eq('id', currentBabyId)
        .single();

      if (error) throw error;
      return data as Baby;
    },
    enabled: !!currentBabyId,
  });

  const { data: babies = [] } = useQuery({
    queryKey: ['babies'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data: householdMembers } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id);

      if (!householdMembers || householdMembers.length === 0) return [];

      const householdIds = householdMembers.map((m) => m.household_id);

      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .in('household_id', householdIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Baby[];
    },
  });

  useEffect(() => {
    if (babies.length > 0 && !currentBabyId) {
      setCurrentBabyId(babies[0].id);
    }
  }, [babies, currentBabyId, setCurrentBabyId]);

  const createBaby = async (
    babyData: Omit<Baby, 'id' | 'household_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No user logged in');

      console.log('Creating baby for user:', user.id);
      let householdId: string;

      // Check if user has a household
      const { data: householdMembers, error: memberError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error fetching household members:', memberError);
      }

      if (householdMembers && householdMembers.length > 0) {
        householdId = householdMembers[0].household_id;
        console.log('Found existing household:', householdId);
      } else {
        console.log('No household found, creating one...');

        // Ensure profile exists before creating household - use upsert to handle existing accounts
        const displayNameFromEmail = user.email?.split('@')[0] || 'User';
        console.log('Creating or updating profile for user:', user.id);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              email: user.email,
              display_name: displayNameFromEmail,
            },
            { onConflict: 'id' }
          )
          .select()
          .single();

        if (profileError) {
          console.error('Profile upsert error:', profileError);
          throw profileError;
        }

        const displayName = profileData?.display_name || displayNameFromEmail;
        const householdName = `${displayName}'s Household`;

        console.log('Creating household with name:', householdName);

        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .insert({
            name: householdName,
            owner_user_id: user.id,
          })
          .select()
          .single();

        if (householdError) {
          console.error('Household creation error:', householdError);
          throw householdError;
        }

        console.log('Created household:', householdData.id);

        // Add user to household
        const { error: memberInsertError } = await supabase
          .from('household_members')
          .insert({
            household_id: householdData.id,
            user_id: user.id,
            role: 'admin',
          });

        if (memberInsertError) {
          console.error('Household member insertion error:', memberInsertError);
          throw memberInsertError;
        }

        householdId = householdData.id;
      }

      console.log('Creating baby with household:', householdId, 'data:', babyData);

      const { data, error } = await supabase
        .from('babies')
        .insert({
          household_id: householdId,
          ...babyData,
        })
        .select()
        .single();

      if (error) {
        console.error('Baby insertion error:', error);
        throw error;
      }

      console.log('Baby created successfully:', data.id);

      queryClient.invalidateQueries({ queryKey: ['babies'] });
      setCurrentBabyId(data.id);

      return { data, error: null };
    } catch (error) {
      console.error('createBaby error:', error);
      return { data: null, error };
    }
  };

  const updateBaby = async (babyId: string, updates: Partial<Baby>) => {
    try {
      const { data, error } = await supabase
        .from('babies')
        .update(updates)
        .eq('id', babyId)
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['baby', babyId] });
      queryClient.invalidateQueries({ queryKey: ['babies'] });

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    baby,
    babies,
    isLoading,
    createBaby,
    updateBaby,
  };
}
