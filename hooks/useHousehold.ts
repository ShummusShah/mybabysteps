import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { useBaby } from './useBaby';
import { useAuth } from './useAuth';

export interface HouseholdMemberWithProfile {
  id: string;
  household_id: string;
  user_id: string;
  role: 'owner' | 'parent' | 'caregiver' | 'viewer';
  display_label?: string;
  created_at: string;
  profile: {
    email: string;
    display_name?: string;
  } | null;
}

export interface HouseholdInvite {
  id: string;
  household_id: string;
  invited_by: string;
  email: string;
  role: 'parent' | 'caregiver' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at?: string;
}

export function useHousehold() {
  const { baby } = useBaby();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const householdId = baby?.household_id;
  const currentUserId = session?.user?.id;

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['household-members', householdId],
    queryFn: async () => {
      if (!householdId) return [];

      const { data, error } = await supabase
        .from('household_members')
        .select('*, profile:profiles(email, display_name)')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as HouseholdMemberWithProfile[];
    },
    enabled: !!householdId,
  });

  const { data: sentInvites = [], isLoading: sentInvitesLoading } = useQuery({
    queryKey: ['household-invites-sent', householdId],
    queryFn: async () => {
      if (!householdId) return [];

      const { data, error } = await supabase
        .from('household_invites')
        .select('*')
        .eq('household_id', householdId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as HouseholdInvite[];
    },
    enabled: !!householdId,
  });

  const { data: receivedInvites = [], isLoading: receivedInvitesLoading } = useQuery({
    queryKey: ['household-invites-received'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) return [];

      const { data, error } = await supabase
        .from('household_invites')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as HouseholdInvite[];
    },
  });

  const currentUserRole = members.find((m) => m.user_id === currentUserId)?.role;

  const inviteCaregiver = async (email: string, role: 'parent' | 'caregiver' | 'viewer') => {
    if (!householdId) throw new Error('No household found');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const normalizedEmail = email.trim().toLowerCase();

    const alreadyMember = members.some((m) => m.profile?.email?.toLowerCase() === normalizedEmail);
    if (alreadyMember) throw new Error('This person is already part of your household');

    const alreadyInvited = sentInvites.some((i) => i.email.toLowerCase() === normalizedEmail);
    if (alreadyInvited) throw new Error('An invite is already pending for this email');

    const { error } = await supabase.from('household_invites').insert({
      household_id: householdId,
      invited_by: user.id,
      email: normalizedEmail,
      role,
      status: 'pending',
    });

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['household-invites-sent', householdId] });
  };

  const cancelInvite = async (inviteId: string) => {
    const { error } = await supabase.from('household_invites').delete().eq('id', inviteId);
    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['household-invites-sent', householdId] });
  };

  const acceptInvite = async (invite: HouseholdInvite) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error: memberError } = await supabase.from('household_members').insert({
      household_id: invite.household_id,
      user_id: user.id,
      role: invite.role,
    });

    if (memberError) throw memberError;

    const { error: inviteError } = await supabase
      .from('household_invites')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', invite.id);

    if (inviteError) throw inviteError;

    queryClient.invalidateQueries({ queryKey: ['household-invites-received'] });
    queryClient.invalidateQueries({ queryKey: ['babies'] });
  };

  const declineInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from('household_invites')
      .update({ status: 'declined', responded_at: new Date().toISOString() })
      .eq('id', inviteId);

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['household-invites-received'] });
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from('household_members').delete().eq('id', memberId);
    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['household-members', householdId] });
  };

  return {
    members,
    sentInvites,
    receivedInvites,
    currentUserRole,
    isLoading: membersLoading || sentInvitesLoading || receivedInvitesLoading,
    inviteCaregiver,
    cancelInvite,
    acceptInvite,
    declineInvite,
    removeMember,
  };
}
