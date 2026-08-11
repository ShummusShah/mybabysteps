import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { formatTime } from '@/lib/utils/dateUtils';
import { useQueryClient } from '@tanstack/react-query';

type NappyType = 'wet' | 'dirty' | 'both' | 'dry';
type NappyColour = 'yellow' | 'brown' | 'green' | 'black' | 'other' | null;
type NappyConsistency = 'loose' | 'soft' | 'formed' | 'hard' | 'other' | null;

export default function NappyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadNappy();
  }, [id]);

  async function loadNappy() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('nappy_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLog(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load nappy details');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function deleteNappy() {
    Alert.alert('Delete Nappy?', 'This cannot be undone.', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          setDeleting(true);
          try {
            const { error } = await supabase
              .from('nappy_logs')
              .delete()
              .eq('id', id);

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['nappy'] });

            Alert.alert('Deleted', 'Nappy log removed', [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]);
          } catch (error) {
            Alert.alert('Error', (error as any)?.message || 'Failed to delete');
          } finally {
            setDeleting(false);
          }
        },
        style: 'destructive',
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Nappy Details" leftAction={() => router.back()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      </ScreenContainer>
    );
  }

  if (!log) {
    return (
      <ScreenContainer>
        <Header title="Nappy Details" leftAction={() => router.back()} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Nappy log not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const typeLabels: Record<NappyType, { label: string; emoji: string }> = {
    wet: { label: 'Wet', emoji: '💧' },
    dirty: { label: 'Dirty', emoji: '💩' },
    both: { label: 'Wet & Dirty', emoji: '⚠️' },
    dry: { label: 'Dry', emoji: '✅' },
  };

  const colourLabels: Record<string, { label: string; emoji: string }> = {
    yellow: { label: 'Yellow', emoji: '💛' },
    brown: { label: 'Brown', emoji: '🟤' },
    green: { label: 'Green', emoji: '💚' },
    black: { label: 'Black', emoji: '🖤' },
    other: { label: 'Other', emoji: '❓' },
  };

  const consistencyLabels: Record<string, { label: string; emoji: string }> = {
    loose: { label: 'Loose', emoji: '💧' },
    soft: { label: 'Soft', emoji: '☁️' },
    formed: { label: 'Formed', emoji: '🍌' },
    hard: { label: 'Hard', emoji: '🪨' },
    other: { label: 'Other', emoji: '❓' },
  };

  const loggedTime = new Date(log.logged_at);

  return (
    <ScreenContainer scrollable>
      <Header title="Nappy Details" leftAction={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="water-circle"
              size={20}
              color={theme.colors.teal}
            />
            <Text style={styles.sectionTitle}>Type</Text>
          </View>
          <Text style={styles.largeValue}>
            {typeLabels[log.type as NappyType].emoji} {typeLabels[log.type as NappyType].label}
          </Text>
        </View>

        {/* Colour */}
        {log.colour && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="palette"
                size={20}
                color={theme.colors.teal}
              />
              <Text style={styles.sectionTitle}>Colour</Text>
            </View>
            <Text style={styles.value}>
              {colourLabels[log.colour]?.emoji} {colourLabels[log.colour]?.label}
            </Text>
          </View>
        )}

        {/* Consistency */}
        {log.consistency && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="texture-box"
                size={20}
                color={theme.colors.teal}
              />
              <Text style={styles.sectionTitle}>Consistency</Text>
            </View>
            <Text style={styles.value}>
              {consistencyLabels[log.consistency]?.emoji} {consistencyLabels[log.consistency]?.label}
            </Text>
          </View>
        )}

        {/* Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="clock"
              size={20}
              color={theme.colors.teal}
            />
            <Text style={styles.sectionTitle}>Logged</Text>
          </View>
          <Text style={styles.value}>{formatTime(loggedTime)}</Text>
        </View>

        {/* Notes */}
        {log.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="note-outline"
                size={20}
                color={theme.colors.teal}
              />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <Text style={styles.value}>{log.notes}</Text>
          </View>
        )}

        {/* Delete Button */}
        <PrimaryButton
          title={deleting ? 'Deleting...' : 'Delete Nappy Log'}
          onPress={deleteNappy}
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
  largeValue: {
    fontSize: theme.typography.largeStats.fontSize,
    fontWeight: theme.typography.largeStats.fontWeight,
    color: theme.colors.teal,
  },
  value: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
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
