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
  }, [babies, currentBabyId]);

  const createBaby = async (
    babyData: Omit<Baby, 'id' | 'household_id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No user logged in');

      const { data: householdMembers } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single();

      if (!householdMembers) throw new Error('No household found');

      const { data, error } = await supabase
        .from('babies')
        .insert({
          household_id: householdMembers.household_id,
          ...babyData,
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['babies'] });
      setCurrentBabyId(data.id);

      return { data, error: null };
    } catch (error) {
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
