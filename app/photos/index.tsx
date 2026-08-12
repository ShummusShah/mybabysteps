import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { usePhotos } from '@/hooks/usePhotos';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { formatDate } from '@/lib/utils/dateUtils';
import { PhotoLog } from '@/types';

const GRID_GAP = 4;
const NUM_COLUMNS = 3;
const screenWidth = Dimensions.get('window').width;
const tileSize = (screenWidth - theme.spacing.lg * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function PhotosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { photos, isLoading, deletePhoto } = usePhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoLog | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleDelete(photo: PhotoLog) {
    Alert.alert('Delete Photo?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deletePhoto(photo);
            setSelectedPhoto(null);
          } catch (error) {
            Alert.alert('Error', (error as any)?.message || 'Failed to delete photo');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <Header
        title="Photos"
        subtitle={`${photos.length} photo${photos.length === 1 ? '' : 's'}`}
        leftAction={() => safeBack(router, '/(tabs)')}
        rightAction={() => router.push('/photos/add')}
        rightLabel="Add"
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {photos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="camera-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No photos yet</Text>
              <Text style={styles.emptySubtitle}>Start building your baby&apos;s photo gallery.</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => router.push('/photos/add')}>
                <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
                <Text style={styles.addButtonText}>Add Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {photos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.tile}
                  onPress={() => setSelectedPhoto(photo)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: photo.photo_url }}
                    style={styles.tileImage}
                    contentFit="cover"
                    transition={150}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Full-size viewer */}
      <Modal visible={!!selectedPhoto} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={[styles.modalClose, { top: insets.top + theme.spacing.md }]}
            onPress={() => setSelectedPhoto(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="close" size={28} color={theme.colors.white} />
          </TouchableOpacity>

          {selectedPhoto && (
            <>
              <Image
                source={{ uri: selectedPhoto.photo_url }}
                style={styles.modalImage}
                contentFit="contain"
              />
              <View style={styles.modalFooter}>
                {selectedPhoto.caption && (
                  <Text style={styles.modalCaption}>{selectedPhoto.caption}</Text>
                )}
                <Text style={styles.modalDate}>{formatDate(selectedPhoto.logged_at)}</Text>
                <PrimaryButton
                  title={deleting ? 'Deleting...' : 'Delete Photo'}
                  onPress={() => handleDelete(selectedPhoto)}
                  variant="danger"
                  loading={deleting}
                  disabled={deleting}
                  style={styles.modalDeleteButton}
                />
              </View>
            </>
          )}
        </View>
      </Modal>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingBottom: theme.spacing.xl,
  },
  tile: {
    width: tileSize,
    height: tileSize,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.colors.lightGray,
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
  },
  modalClose: {
    position: 'absolute',
    right: theme.spacing.lg,
    zIndex: 1,
  },
  modalImage: {
    width: '100%',
    height: '65%',
  },
  modalFooter: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  modalCaption: {
    fontSize: theme.typography.cardHeadline.fontSize,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  modalDate: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.gray,
    marginBottom: theme.spacing.lg,
  },
  modalDeleteButton: {
    marginBottom: theme.spacing.xl,
  },
});
