import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Image } from 'expo-image';
import { ImagePickerAsset } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { usePhotos } from '@/hooks/usePhotos';
import { theme } from '@/constants/theme';

export default function AddPhotoScreen() {
  const router = useRouter();
  const { baby } = useBaby();
  const { pickPhoto, uploadPhoto } = usePhotos();
  const [asset, setAsset] = useState<ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState('');
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handlePickPreview() {
    setPicking(true);
    try {
      const picked = await pickPhoto();
      if (picked) setAsset(picked);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Could not open photo library');
    } finally {
      setPicking(false);
    }
  }

  async function handleSave() {
    if (!asset) {
      Alert.alert('No photo selected', 'Choose a photo first.');
      return;
    }
    if (!baby) {
      Alert.alert(
        'No Baby Profile',
        'Please create a baby profile first in your settings.',
        [{ text: 'OK', onPress: () => router.push('/profile') }]
      );
      return;
    }

    setUploading(true);
    try {
      await uploadPhoto(asset.uri, asset.mimeType, caption.trim() || undefined);
      router.back();
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Add Photo" leftAction={() => router.back()} />

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.pickerArea}
          onPress={handlePickPreview}
          disabled={picking || uploading}
        >
          {asset ? (
            <Image source={{ uri: asset.uri }} style={styles.preview} contentFit="cover" />
          ) : (
            <View style={styles.pickerPlaceholder}>
              <MaterialCommunityIcons name="image-plus" size={40} color={theme.colors.teal} />
              <Text style={styles.pickerText}>
                {picking ? 'Opening library...' : 'Tap to choose a photo'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {asset && (
          <TouchableOpacity style={styles.changeButton} onPress={handlePickPreview} disabled={picking}>
            <Text style={styles.changeButtonText}>Choose a different photo</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Caption (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Add a caption..."
          placeholderTextColor={theme.colors.textSecondary}
          value={caption}
          onChangeText={setCaption}
        />

        <PrimaryButton
          title={uploading ? 'Uploading...' : 'Save Photo'}
          onPress={handleSave}
          loading={uploading}
          disabled={uploading || !asset}
          style={styles.saveButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  pickerArea: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.mint,
    marginBottom: theme.spacing.md,
  },
  pickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pickerText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.teal,
    fontWeight: '500' as const,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  changeButton: {
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
  },
  changeButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.teal,
    fontWeight: '600' as const,
  },
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  saveButton: {
    marginBottom: theme.spacing.xl,
  },
});
