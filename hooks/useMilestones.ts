import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { Milestone } from '@/types';
import { useBaby } from './useBaby';

export function useMilestones() {
  const { baby } = useBaby();
  const queryClient = useQueryClient();

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones', baby?.id],
    queryFn: async () => {
      if (!baby) return [];

      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('baby_id', baby.id)
        .order('achieved_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Milestone[];
    },
    enabled: !!baby,
  });

  const createMilestone = async (input: {
    title: string;
    notes?: string;
    achieved?: boolean;
    achievedAt?: string;
    isCustom?: boolean;
  }) => {
    if (!baby) throw new Error('No baby selected');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const achieved = input.achieved ?? true;

    const { data, error } = await supabase
      .from('milestones')
      .insert({
        baby_id: baby.id,
        created_by: user.id,
        title: input.title,
        is_custom: input.isCustom ?? true,
        achieved,
        achieved_at: achieved ? input.achievedAt || new Date().toISOString() : null,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['milestones', baby.id] });
    queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
    return data as Milestone;
  };

  const deleteMilestone = async (id: string) => {
    const { error } = await supabase.from('milestones').delete().eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['milestones', baby?.id] });
    queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
  };

  const achievedCount = milestones.filter((m) => m.achieved).length;

  return {
    milestones,
    achievedCount,
    isLoading,
    createMilestone,
    deleteMilestone,
  };
}
