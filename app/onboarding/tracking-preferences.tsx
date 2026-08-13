import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useStore } from '@/stores/useStore';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { moduleIcons, moduleLabels, moduleColors, QuickLogModuleType } from '@/lib/utils/moduleColors';

const MODULE_ORDER: QuickLogModuleType[] = [
  'feed',
  'sleep',
  'nappy',
  'pump',
  'tummy',
  'medicine',
  'temperature',
  'growth',
  'milestone',
  'photo',
];

export default function TrackingPreferencesScreen() {
  const router = useRouter();
  const { setQuickLogModules } = useStore();
  const [enabledModules, setEnabledModules] = useState<Set<QuickLogModuleType>>(
    new Set(MODULE_ORDER)
  );

  const handleToggleModule = (type: QuickLogModuleType) => {
    const updated = new Set(enabledModules);
    if (updated.has(type)) {
      updated.delete(type);
    } else {
      updated.add(type);
    }
    setEnabledModules(updated);
  };

  const handleStart = () => {
    const modules = MODULE_ORDER.map((type, idx) => ({
      type,
      enabled: enabledModules.has(type),
      order: idx,
    }));
    setQuickLogModules(modules);
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => safeBack(router, '/onboarding/baby-details')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>What would you like to track?</Text>
        <Text style={styles.subtitle}>Choose what appears in Quick Log.</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {MODULE_ORDER.map((type, index) => {
            const enabled = enabledModules.has(type);
            const colors = moduleColors[type];

            return (
              <TouchableOpacity
                key={type}
                style={[styles.row, index === MODULE_ORDER.length - 1 && styles.rowLast]}
                onPress={() => handleToggleModule(type)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.bg }]}>
                  <MaterialCommunityIcons name={moduleIcons[type] as any} size={20} color={colors.accent} />
                </View>
                <Text style={styles.rowLabel}>{moduleLabels[type]}</Text>
                <MaterialCommunityIcons
                  name="check"
                  size={22}
                  color={enabled ? theme.colors.teal : theme.colors.border}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton
          title="Start Tracking"
          onPress={handleStart}
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  list: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  submitButton: {
    marginBottom: theme.spacing.xl,
  },
});
