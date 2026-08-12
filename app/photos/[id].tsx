import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { usePhotos } from '@/hooks/usePhotos';

export default function PhotoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { deletePhoto } = usePhotos();
  const [loading, setLoading] = useState(false);

  const { data: photo } = useQuery({
    queryKey: ['photo', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*, creator:profiles(display_name, email)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  async function handleDelete() {
    if (!photo) return;

    Alert.alert('Delete Photo', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          setLoading(true);
          try {
            await deletePhoto(photo);

            Alert.alert('Success', 'Photo deleted', [
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

  if (!photo) {
    return (
      <ScreenContainer>
        <Header title="Photo" leftAction={() => safeBack(router, '/(tabs)')} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const loggedAt = new Date(photo.logged_at);

  return (
    <ScreenContainer scrollable>
      <Header title="Photo" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: photo.photo_url }} style={styles.image} contentFit="cover" />

        <View style={styles.card}>
          {photo.caption && (
            <View style={styles.detail}>
              <Text style={styles.label}>Caption</Text>
              <Text style={styles.value}>{photo.caption}</Text>
            </View>
          )}

          <View style={styles.detail}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{loggedAt.toLocaleString()}</Text>
          </View>

          <View style={styles.detail}>
            <Text style={styles.label}>Logged by</Text>
            <Text style={styles.value}>
              {photo.creator?.display_name || photo.creator?.email || 'Unknown'}
            </Text>
          </View>
        </View>

        <PrimaryButton
          title="Delete Photo"
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
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.card,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.border,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
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
