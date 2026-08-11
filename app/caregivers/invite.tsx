import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useHousehold } from '@/hooks/useHousehold';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';

type InviteRole = 'parent' | 'caregiver' | 'viewer';

const ROLE_OPTIONS: { value: InviteRole; label: string; description: string }[] = [
  { value: 'parent', label: 'Parent', description: 'Full access, can invite others' },
  { value: 'caregiver', label: 'Caregiver', description: 'Can log and view activity' },
  { value: 'viewer', label: 'Viewer', description: 'Can only view activity' },
];

export default function InviteCaregiverScreen() {
  const router = useRouter();
  const { inviteCaregiver } = useHousehold();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('caregiver');
  const [loading, setLoading] = useState(false);

  async function handleInvite() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await inviteCaregiver(trimmedEmail, role);
      Alert.alert(
        'Invite Sent',
        `${trimmedEmail} will see this invite when they open MyBabySteps and check Caregivers.`,
        [{ text: 'Done', onPress: () => safeBack(router, '/caregivers') }]
      );
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Invite Caregiver" leftAction={() => safeBack(router, '/caregivers')} />

      <View style={styles.content}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="name@example.com"
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Role</Text>
        <View style={styles.roleList}>
          {ROLE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.roleCard, role === option.value && styles.roleCardActive]}
              onPress={() => setRole(option.value)}
            >
              <View style={styles.roleInfo}>
                <Text style={[styles.roleLabel, role === option.value && styles.roleLabelActive]}>
                  {option.label}
                </Text>
                <Text style={styles.roleDescription}>{option.description}</Text>
              </View>
              {role === option.value && (
                <MaterialCommunityIcons name="check-circle" size={22} color={theme.colors.teal} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.teal} />
          <Text style={styles.infoText}>
            There&apos;s no email notification yet — the invite appears automatically when they log
            into MyBabySteps with this email and open the Caregivers screen.
          </Text>
        </View>

        <PrimaryButton
          title={loading ? 'Sending...' : 'Send Invite'}
          onPress={handleInvite}
          loading={loading}
          disabled={loading || !email.trim()}
          style={styles.sendButton}
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
  roleList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    padding: theme.spacing.md,
  },
  roleCardActive: {
    borderColor: theme.colors.teal,
    backgroundColor: theme.colors.mint,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  roleLabelActive: {
    color: theme.colors.teal,
  },
  roleDescription: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.mint,
    borderRadius: theme.borderRadius.input,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.teal,
  },
  sendButton: {
    marginBottom: theme.spacing.xl,
  },
});
