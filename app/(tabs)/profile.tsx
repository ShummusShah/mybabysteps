import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useBaby } from '@/hooks/useBaby';
import { theme } from '@/constants/theme';
import { formatBabyAge } from '@/lib/utils/dateUtils';
import { StorageImage } from '@/components/ui/StorageImage';

const PRIVACY_POLICY_URL = 'https://claude.ai/code/artifact/5e6c7cdb-1497-4c4b-8180-260a46c5dda7';
const TERMS_OF_SERVICE_URL = 'https://claude.ai/code/artifact/b1fc8214-9bdf-4f3f-951b-10ec12c7e4d2';

interface MenuRow {
  label: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { baby } = useBaby();

  async function handleSignOut() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/welcome');
        },
      },
    ]);
  }

  const menuRows: MenuRow[] = [
    { label: 'Baby profile', onPress: () => router.push('/settings/baby') },
    { label: 'Caregivers', onPress: () => router.push('/caregivers') },
    { label: 'Preferences', onPress: () => router.push('/settings/preferences') },
    { label: 'Reminders', onPress: () => router.push('/reminders') },
    { label: 'Subscription', onPress: () => Alert.alert('Coming Soon', 'Subscription management coming soon.') },
    { label: 'Privacy Policy', onPress: () => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL) },
    { label: 'Terms of Service', onPress: () => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL) },
    { label: 'Help & Support', onPress: () => Alert.alert('Help & Support', 'Contact us at support@mybabysteps.app') },
    {
      label: 'About MyBabySteps',
      onPress: () => Alert.alert('About MyBabySteps', 'MyBabySteps Baby Tracking App\nVersion 1.0.0'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.babyCard}>
          <View style={styles.babyAvatar}>
            {baby?.avatar_url && (
              <StorageImage path={baby.avatar_url} style={styles.babyAvatarImage} contentFit="cover" />
            )}
          </View>
          <View style={styles.babyInfo}>
            <Text style={styles.babyName}>{baby?.name || 'Baby'}</Text>
            <Text style={styles.babyAge}>{baby ? formatBabyAge(baby.date_of_birth) : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings/baby')}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuCard}>
          {menuRows.map((row, index) => (
            <TouchableOpacity
              key={row.label}
              style={[styles.menuRow, index !== menuRows.length - 1 && styles.menuRowBorder]}
              onPress={row.onPress}
            >
              <Text style={styles.menuLabel}>{row.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: theme.typography.screenTitle.fontSize,
    fontWeight: theme.typography.screenTitle.fontWeight,
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  babyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.peach,
    overflow: 'hidden',
  },
  babyAvatarImage: {
    width: '100%',
    height: '100%',
  },
  babyInfo: {
    flex: 1,
  },
  babyName: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  babyAge: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  editLink: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
  menuCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.small,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 60,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuLabel: {
    fontSize: theme.typography.bodyLarge.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  signOutText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.error,
  },
});
