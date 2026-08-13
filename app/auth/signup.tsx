import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as WebBrowser from 'expo-web-browser';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Header } from '@/components/ui/Header';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';

const PRIVACY_POLICY_URL = 'https://claude.ai/code/artifact/5e6c7cdb-1497-4c4b-8180-260a46c5dda7';
const TERMS_OF_SERVICE_URL = 'https://claude.ai/code/artifact/b1fc8214-9bdf-4f3f-951b-10ec12c7e4d2';

const signupSchema = z
  .object({
    displayName: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const { signUpWithEmail, resendConfirmationEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    setLoading(true);
    try {
      const { error, needsConfirmation } = await signUpWithEmail(
        data.email,
        data.password,
        data.displayName
      );

      if (error) {
        Alert.alert('Error', (error as any)?.message || 'Failed to create account');
        return;
      }

      if (needsConfirmation) {
        setPendingEmail(data.email);
        return;
      }

      router.replace('/onboarding/baby-details' as any);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!pendingEmail) return;
    setResending(true);
    try {
      const { success, error } = await resendConfirmationEmail(pendingEmail);
      if (!success) {
        Alert.alert('Error', (error as any)?.message || 'Failed to resend email');
        return;
      }
      Alert.alert('Sent', 'Confirmation email resent.');
    } finally {
      setResending(false);
    }
  }

  if (pendingEmail) {
    return (
      <ScreenContainer>
        <Header leftAction={() => safeBack(router, '/auth/welcome')} />
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✉️</Text>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successText}>
            We&apos;ve sent a confirmation link to {pendingEmail}. Follow the link to activate
            your account, then come back and log in.
          </Text>
          <PrimaryButton
            title="Resend Email"
            onPress={handleResend}
            loading={resending}
            style={styles.button}
          />
          <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.loginLink}>
            <Text style={styles.footerLink}>Back to Log In</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <Header leftAction={() => safeBack(router, '/auth/welcome')} title="Create Account" />

      <View style={styles.form}>
        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={[styles.input, errors.displayName && styles.errorInput]}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textSecondary}
                value={value}
                onChangeText={onChange}
              />
              {errors.displayName && (
                <Text style={styles.errorText}>{errors.displayName.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.errorInput]}
                placeholder="your@email.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.errorInput]}
                placeholder="At least 6 characters"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.errorInput]}
                placeholder="Confirm password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}
            </View>
          )}
        />

        <PrimaryButton
          title="Create Account"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitButton}
        />

        <Text style={styles.consentText}>
          By creating an account, you agree to our{' '}
          <Text style={styles.consentLink} onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL)}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.consentLink} onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}>
            Privacy Policy
          </Text>
          .
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingVertical: theme.spacing.xl,
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
  errorInput: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.metadata.fontSize,
    marginTop: theme.spacing.xs,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
  },
  consentText: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 18,
  },
  consentLink: {
    color: theme.colors.teal,
    fontWeight: '600' as const,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },
  footerLink: {
    color: theme.colors.teal,
    fontWeight: '600' as const,
    fontSize: theme.typography.body.fontSize,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.typography.screenTitle.fontSize,
    fontWeight: theme.typography.screenTitle.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  successText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
});
