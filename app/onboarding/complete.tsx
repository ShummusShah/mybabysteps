import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { theme } from '@/constants/theme';

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { baby } = useBaby();

  const handleStart = () => {
    router.replace('/');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>You're ready!</Text>
            {baby && (
              <Text style={styles.subtitle}>
                Welcome to MyBabySteps, {baby.name}!
              </Text>
            )}
          </View>

          <View style={styles.spacer} />

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Start Tracking"
              onPress={handleStart}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl * 2,
  },
  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.cardHeadline.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
});
