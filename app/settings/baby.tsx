import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBaby } from '@/hooks/useBaby';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';

export default function BabySettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { baby } = useBaby();
  const [name, setName] = useState(baby?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(baby?.date_of_birth?.split('T')[0] || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter baby name');
      return;
    }

    if (!dateOfBirth.trim()) {
      Alert.alert('Error', 'Please enter date of birth');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('babies')
        .update({
          name: name.trim(),
          date_of_birth: dateOfBirth,
        })
        .eq('id', baby?.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['baby'] });
      Alert.alert('Success', 'Baby profile updated');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update baby profile');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Baby Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Baby Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter baby name"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>

          {/* Date of Birth Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              editable={!isLoading}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={20} color={theme.colors.white} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.teal} />
          <Text style={styles.infoText}>
            Update your baby&apos;s information. This will be reflected throughout the app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  form: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.teal,
    borderRadius: theme.borderRadius.button,
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.white,
  },
  infoSection: {
    backgroundColor: theme.colors.teal + '10',
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.teal,
    fontWeight: '500' as const,
  },
});
