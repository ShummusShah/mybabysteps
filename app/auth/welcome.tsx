import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.brand}>MyBabySteps</Text>

        <Text style={styles.headline}>Every little moment,{'\n'}all in one place.</Text>

        <Text style={styles.subtitle}>
          Track feeds, sleep, nappies, growth and memories without the clutter.
        </Text>

        <View style={styles.hero}>
          <MaterialCommunityIcons name="heart-outline" size={56} color={theme.colors.teal} />
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Get Started"
            onPress={() => router.push('/auth/signup')}
            style={styles.button}
          />

          <TouchableOpacity onPress={() => router.push('/auth/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.teal,
    marginBottom: theme.spacing.lg,
  },
  headline: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: theme.colors.text,
    lineHeight: 40,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  hero: {
    flex: 1,
    minHeight: 220,
    backgroundColor: theme.colors.mint,
    borderRadius: theme.borderRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    height: theme.spacing.xl,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  loginLinkText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
});
