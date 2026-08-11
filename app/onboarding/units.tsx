import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Header } from '@/components/ui/Header';
import { useStore } from '@/stores/useStore';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Unit = 'kg' | 'lb' | 'ml' | 'fl_oz' | 'celsius' | 'fahrenheit';

export default function UnitsScreen() {
  const router = useRouter();
  const { userPreferences, setUserPreferences } = useStore();

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(
    (userPreferences.weightUnit as any) || 'kg'
  );
  const [milkUnit, setMilkUnit] = useState<'ml' | 'fl_oz'>(
    (userPreferences.milkUnit as any) || 'ml'
  );
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>(
    (userPreferences.temperatureUnit as any) || 'celsius'
  );

  const handleContinue = () => {
    setUserPreferences({
      weightUnit,
      milkUnit,
      temperatureUnit,
    });
    router.push('/onboarding/tracking-preferences');
  };

  return (
    <ScreenContainer scrollable>
      <Header leftAction={() => safeBack(router, '/onboarding/baby-details')} title="Preferences" />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight</Text>
          <View style={styles.optionsContainer}>
            {(['kg', 'lb'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                onPress={() => setWeightUnit(unit)}
                style={[
                  styles.option,
                  weightUnit === unit && styles.optionActive,
                ]}
              >
                <View style={styles.optionContent}>
                  <MaterialCommunityIcons
                    name={weightUnit === unit ? 'radiobox-marked' : 'radiobox-blank'}
                    size={24}
                    color={weightUnit === unit ? theme.colors.teal : theme.colors.border}
                  />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{unit === 'kg' ? 'Kilograms' : 'Pounds'}</Text>
                    <Text style={styles.optionSub}>{unit === 'kg' ? 'kg' : 'lb'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milk Volume</Text>
          <View style={styles.optionsContainer}>
            {(['ml', 'fl_oz'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                onPress={() => setMilkUnit(unit)}
                style={[
                  styles.option,
                  milkUnit === unit && styles.optionActive,
                ]}
              >
                <View style={styles.optionContent}>
                  <MaterialCommunityIcons
                    name={milkUnit === unit ? 'radiobox-marked' : 'radiobox-blank'}
                    size={24}
                    color={milkUnit === unit ? theme.colors.teal : theme.colors.border}
                  />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>
                      {unit === 'ml' ? 'Millilitres' : 'Fluid Ounces'}
                    </Text>
                    <Text style={styles.optionSub}>{unit === 'ml' ? 'ml' : 'fl oz'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperature</Text>
          <View style={styles.optionsContainer}>
            {(['celsius', 'fahrenheit'] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                onPress={() => setTemperatureUnit(unit)}
                style={[
                  styles.option,
                  temperatureUnit === unit && styles.optionActive,
                ]}
              >
                <View style={styles.optionContent}>
                  <MaterialCommunityIcons
                    name={temperatureUnit === unit ? 'radiobox-marked' : 'radiobox-blank'}
                    size={24}
                    color={temperatureUnit === unit ? theme.colors.teal : theme.colors.border}
                  />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>
                      {unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}
                    </Text>
                    <Text style={styles.optionSub}>{unit === 'celsius' ? '°C' : '°F'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          style={styles.submitButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: theme.typography.sectionTitle.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  option: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    backgroundColor: theme.colors.white,
  },
  optionActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.teal,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  optionSub: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  submitButton: {
    marginTop: theme.spacing.xxl,
  },
});
