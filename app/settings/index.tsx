import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useBaby } from '@/hooks/useBaby';
import { useStore } from '@/stores/useStore';
import { theme } from '@/constants/theme';

interface SettingsItem {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { baby } = useBaby();
  const { userPreferences } = useStore();

  const handleLogout = async () => {
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
  };

  const settingsItems: SettingsItem[] = [
    {
      icon: 'baby-face-outline',
      title: 'Baby Profile',
      subtitle: baby?.name || 'Not set',
      onPress: () => router.push('/settings/baby'),
      showArrow: true,
    },
    {
      icon: 'cog-outline',
      title: 'Preferences',
      subtitle: `${userPreferences.timeFormat} • ${userPreferences.weightUnit}`,
      onPress: () => router.push('/settings/preferences'),
      showArrow: true,
    },
    {
      icon: 'bell-outline',
      title: 'Notifications',
      subtitle: 'Manage alerts',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings coming soon'),
      showArrow: true,
    },
    {
      icon: 'download-outline',
      title: 'Export Data',
      subtitle: 'Download your data',
      onPress: () => Alert.alert('Coming Soon', 'Export feature coming soon'),
      showArrow: true,
    },
    {
      icon: 'information-outline',
      title: 'About',
      subtitle: 'Version 1.0.0',
      onPress: () => Alert.alert('About MyBabySteps', 'MyBabySteps Baby Tracking App\nVersion 1.0.0'),
      showArrow: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="account" size={32} color={theme.colors.teal} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.display_name || 'User'}</Text>
            <Text style={styles.userEmail}>{profile?.email}</Text>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingsItem,
                index !== settingsItems.length - 1 && styles.settingsItemBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.settingsItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.colors.teal + '20' }]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color={theme.colors.teal}
                  />
                </View>
                <View style={styles.settingsItemText}>
                  <Text style={styles.settingsItemTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              {item.showArrow && (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Section */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Log Out</Text>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.teal + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingsSection: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as const,
    color: theme.colors.text,
  },
  settingsItemSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B' + '10',
    borderRadius: theme.borderRadius.button,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  logoutText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: '#FF6B6B',
  },
});
