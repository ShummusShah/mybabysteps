import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { formatDate } from '@/lib/utils/dateUtils';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';

const babyDetailsSchema = z.object({
  name: z.string().min(1, 'Baby name is required'),
  dateOfBirth: z.date(),
  sex: z.enum(['male', 'female', 'prefer_not_to_say']),
});

type BabyDetailsFormData = z.infer<typeof babyDetailsSchema>;

export default function BabyDetailsScreen() {
  const router = useRouter();
  const { createBaby, updateBaby } = useBaby();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedSex, setSelectedSex] = useState<'male' | 'female' | 'prefer_not_to_say' | null>(
    null
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BabyDetailsFormData>({
    resolver: zodResolver(babyDetailsSchema),
    defaultValues: {
      dateOfBirth: new Date(),
      sex: 'prefer_not_to_say',
    },
  });

  const dateOfBirth = watch('dateOfBirth');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setValue('dateOfBirth', selectedDate);
    }
  };

  async function onSubmit(data: BabyDetailsFormData) {
    setLoading(true);
    try {
      const { data: baby, error } = await createBaby({
        name: data.name,
        date_of_birth: data.dateOfBirth.toISOString().split('T')[0],
        sex: data.sex as any,
      });

      if (error) {
        const errorMessage = (error as any)?.message || JSON.stringify(error);
        Alert.alert('Error', `Failed to create baby profile: ${errorMessage}`);
        return;
      }

      if (baby && avatarUri) {
        try {
          const response = await fetch(avatarUri);
          const arrayBuffer = await response.arrayBuffer();
          const fileExt = avatarUri.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `${baby.id}/avatar-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, arrayBuffer, { contentType: `image/${fileExt}` });

          if (!uploadError) {
            await updateBaby(baby.id, { avatar_url: fileName });
          }
        } catch {
          // A failed avatar upload shouldn't block onboarding — the baby
          // profile itself was created successfully and a photo can be
          // added later from the baby profile settings screen.
        }
      }

      router.push('/onboarding/tracking-preferences');
    } catch (error) {
      Alert.alert('Error', `An unexpected error occurred: ${(error as any)?.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => safeBack(router, '/auth/welcome')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Tell us about your baby</Text>
        <Text style={styles.subtitle}>You can change these details later.</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="plus" size={32} color={theme.colors.teal} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Baby's name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.errorInput]}
                placeholder="e.g. Leo"
                placeholderTextColor={theme.colors.textSecondary}
                value={value || ''}
                onChangeText={onChange}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field: { onChange } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Date of birth</Text>
              <TouchableOpacity
                style={[styles.dateInput, errors.dateOfBirth && styles.errorInput]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateInputText}>{formatDate(dateOfBirth)}</Text>
              </TouchableOpacity>
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
              )}
            </View>
          )}
        />

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Sex</Text>
          <View style={styles.sexButtonsContainer}>
            {(['male', 'female', 'prefer_not_to_say'] as const).map((sex) => (
              <TouchableOpacity
                key={sex}
                onPress={() => {
                  setSelectedSex(sex);
                  setValue('sex', sex);
                }}
                style={[
                  styles.sexButton,
                  selectedSex === sex && styles.sexButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.sexButtonText,
                    selectedSex === sex && styles.sexButtonTextActive,
                  ]}
                >
                  {sex === 'male' ? 'Boy' : sex === 'female' ? 'Girl' : 'Prefer not to say'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PrimaryButton
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  form: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  field: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
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
    minHeight: 48,
  },
  dateInput: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  errorInput: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.metadata.fontSize,
    marginTop: theme.spacing.xs,
  },
  sexButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sexButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  sexButtonActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.teal,
  },
  sexButtonText: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
  sexButtonTextActive: {
    color: theme.colors.teal,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
});
