import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { useMilestones } from '@/hooks/useMilestones';
import { theme } from '@/constants/theme';
import { formatDate } from '@/lib/utils/dateUtils';

export default function MilestonesScreen() {
  const router = useRouter();
  const { milestones, achievedCount, isLoading } = useMilestones();

  return (
    <ScreenContainer>
      <Header
        title="Milestones"
        subtitle={`${achievedCount} achieved`}
        leftAction={() => router.back()}
        rightAction={() => router.push('/milestones/add')}
        rightLabel="Add"
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {milestones.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="star-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No milestones yet</Text>
              <Text style={styles.emptySubtitle}>
                Log your baby&apos;s first smile, first word, first steps and more.
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/milestones/add')}
              >
                <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
                <Text style={styles.addButtonText}>Add Milestone</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.list}>
              {milestones.map((milestone) => (
                <TouchableOpacity
                  key={milestone.id}
                  style={styles.milestoneCard}
                  onPress={() => router.push(`/milestones/${milestone.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.milestoneIcon}>
                    <MaterialCommunityIcons name="star" size={22} color={theme.colors.yellowAccent} />
                  </View>
                  <View style={styles.milestoneInfo}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    {milestone.achieved_at && (
                      <Text style={styles.milestoneDate}>{formatDate(milestone.achieved_at)}</Text>
                    )}
                    {milestone.notes && (
                      <Text style={styles.milestoneNotes} numberOfLines={1}>
                        {milestone.notes}
                      </Text>
                    )}
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
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
    paddingTop: theme.spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.teal,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.button,
    gap: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
  },
  list: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  milestoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  milestoneDate: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  milestoneNotes: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
