import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { formatDate } from '@/lib/utils/dateUtils';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const STORAGE_BUCKET = 'photos';

export default function BabySettingsScreen() {
  const router = useRouter();
  const { baby, updateBaby } = useBaby();
  const [name, setName] = useState(baby?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    baby?.date_of_birth ? new Date(baby.date_of_birth) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthWeight, setBirthWeight] = useState(baby?.birth_weight != null ? String(baby.birth_weight) : '');
  const [birthLength, setBirthLength] = useState(baby?.birth_length != null ? String(baby.birth_length) : '');
  const [avatarUrl, setAvatarUrl] = useState(baby?.avatar_url || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  async function handleEditPhoto() {
    if (!baby) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Photo library access is required to change the photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setIsUploadingPhoto(true);
    try {
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${baby.id}/avatar-${Date.now()}.${fileExt}`;
      const contentType = asset.mimeType || `image/${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, arrayBuffer, { contentType });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      const { error } = await updateBaby(baby.id, { avatar_url: publicUrl });
      if (error) throw error;
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to update photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleSave() {
    if (!baby) return;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter baby name');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updateBaby(baby.id, {
        name: name.trim(),
        date_of_birth: dateOfBirth.toISOString().split('T')[0],
        birth_weight: birthWeight.trim() ? parseFloat(birthWeight) : undefined,
        birth_length: birthLength.trim() ? parseFloat(birthLength) : undefined,
      });

      if (error) throw error;

      Alert.alert('Success', 'Baby profile updated', [
        { text: 'OK', onPress: () => safeBack(router, '/settings') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update baby profile');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Baby Profile" leftLabel="‹" leftAction={() => safeBack(router, '/settings')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handleEditPhoto} disabled={isUploadingPhoto} style={styles.photoCircle}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.photoImage} contentFit="cover" />
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditPhoto} disabled={isUploadingPhoto}>
            <Text style={styles.editPhotoLink}>
              {isUploadingPhoto ? 'Uploading...' : 'Edit photo'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          editable={!isLoading}
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Date of birth</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.inputText}>{formatDate(dateOfBirth)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (selected) setDateOfBirth(selected);
            }}
          />
        )}

        <Text style={styles.label}>Birth weight</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputRowField}
            value={birthWeight}
            onChangeText={setBirthWeight}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={theme.colors.textSecondary}
          />
          <Text style={styles.inputSuffix}>kg</Text>
        </View>

        <Text style={styles.label}>Birth length</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputRowField}
            value={birthLength}
            onChangeText={setBirthLength}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textSecondary}
          />
          <Text style={styles.inputSuffix}>cm</Text>
        </View>

        <PrimaryButton
          title={isLoading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.peach,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  editPhotoLink: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
  label: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.input,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.input,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    minHeight: 48,
    gap: theme.spacing.sm,
  },
  inputRowField: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    padding: 0,
  },
  inputSuffix: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});
