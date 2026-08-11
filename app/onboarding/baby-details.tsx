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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Header } from '@/components/ui/Header';
import { useStore } from '@/stores/useStore';
import { useBaby } from '@/hooks/useBaby';
import { formatDate } from '@/lib/utils/dateUtils';
import { theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const babyDetailsSchema = z.object({
  name: z.string().min(1, 'Baby name is required'),
  dateOfBirth: z.date(),
  sex: z.enum(['male', 'female', 'prefer_not_to_say']),
});

type BabyDetailsFormData = z.infer<typeof babyDetailsSchema>;

export default function BabyDetailsScreen() {
  const router = useRouter();
  const { createBaby } = useBaby();
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
        avatar_url: avatarUri || undefined,
      });

      if (error) {
        Alert.alert('Error', 'Failed to create baby profile');
        return;
      }

      router.push('/onboarding/units');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header leftAction={() => router.back()} title="Baby Details" />

      <View style={styles.form}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="baby-face" size={40} color={theme.colors.teal} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to add photo</Text>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Baby's Name</Text>
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
              <Text style={styles.label}>Date of Birth</Text>
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
                  {sex === 'male' ? 'Boy' : sex === 'female' ? 'Girl' : "Prefer not to say"}
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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
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
  avatarHint: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
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
    gap: theme.spacing.md,
  },
  sexButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    alignItems: 'center',
  },
  sexButtonActive: {
    backgroundColor: theme.colors.teal,
    borderColor: theme.colors.teal,
  },
  sexButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  sexButtonTextActive: {
    color: theme.colors.white,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
  },
});
