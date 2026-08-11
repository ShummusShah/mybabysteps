import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { formatDate } from '@/lib/utils/dateUtils';
import { Milestone } from '@/types';

export default function MilestoneDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [deleting, setDeleting] = useState(false);

  const { data: milestone, isLoading: loading } = useQuery({
    queryKey: ['milestone', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Milestone;
    },
    enabled: !!id,
  });

  function deleteMilestone() {
    Alert.alert('Delete Milestone?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            const { error } = await supabase.from('milestones').delete().eq('id', id);
            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['milestones'] });
            router.back();
          } catch (error) {
            Alert.alert('Error', (error as any)?.message || 'Failed to delete');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Milestone" leftAction={() => router.back()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      </ScreenContainer>
    );
  }

  if (!milestone) {
    return (
      <ScreenContainer>
        <Header title="Milestone" leftAction={() => router.back()} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Milestone not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Milestone" leftAction={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="star" size={32} color={theme.colors.yellowAccent} />
          </View>
          <Text style={styles.heroTitle}>{milestone.title}</Text>
          {milestone.achieved_at && (
            <Text style={styles.heroDate}>{formatDate(milestone.achieved_at)}</Text>
          )}
        </View>

        {milestone.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="note-outline" size={20} color={theme.colors.teal} />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <Text style={styles.value}>{milestone.notes}</Text>
          </View>
        )}

        <PrimaryButton
          title={deleting ? 'Deleting...' : 'Delete Milestone'}
          onPress={deleteMilestone}
          variant="danger"
          loading={deleting}
          disabled={deleting}
          style={styles.deleteButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
    textAlign: 'center',
  },
  heroDate: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  value: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '500' as const,
    color: theme.colors.text,
  },
  deleteButton: {
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
  },
});
