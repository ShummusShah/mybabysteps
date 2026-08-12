import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { formatTime } from '@/lib/utils/dateUtils';

export default function MedicineDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: medicineLog } = useQuery({
    queryKey: ['medicine', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  async function handleDelete() {
    Alert.alert('Delete Medicine Log', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          setLoading(true);
          try {
            const { error } = await supabase
              .from('medicine_logs')
              .delete()
              .eq('id', id);

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['medicine_logs'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
            queryClient.invalidateQueries({ queryKey: ['log-entries'] });

            Alert.alert('Success', 'Medicine log deleted', [
              {
                text: 'OK',
                onPress: () => safeBack(router, '/(tabs)'),
              },
            ]);
          } catch (error) {
            Alert.alert('Error', (error as any)?.message || 'Failed to delete');
          } finally {
            setLoading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  }

  if (!medicineLog) {
    return (
      <ScreenContainer>
        <Header title="Medicine Log" leftAction={() => safeBack(router, '/(tabs)')} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const logTime = new Date(medicineLog.logged_at);

  return (
    <ScreenContainer scrollable>
      <Header title="Medicine Log" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="pill"
              size={32}
              color={theme.colors.teal}
            />
            <View style={styles.headerText}>
              <Text style={styles.medicineName}>{medicineLog.name}</Text>
              <Text style={styles.timestamp}>{formatTime(logTime)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detail}>
            <Text style={styles.label}>Dosage</Text>
            <Text style={styles.value}>{medicineLog.dosage}</Text>
          </View>

          {medicineLog.notes && (
            <>
              <View style={styles.detail}>
                <Text style={styles.label}>Notes</Text>
                <Text style={styles.value}>{medicineLog.notes}</Text>
              </View>
            </>
          )}

          <View style={styles.detail}>
            <Text style={styles.label}>Logged At</Text>
            <Text style={styles.value}>{logTime.toLocaleString()}</Text>
          </View>
        </View>

        <PrimaryButton
          title="Delete Log"
          onPress={handleDelete}
          loading={loading}
          disabled={loading}
          variant="danger"
          style={styles.deleteButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerText: {
    marginLeft: theme.spacing.lg,
    flex: 1,
  },
  medicineName: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  detail: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  value: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    marginBottom: theme.spacing.xl,
  },
});
