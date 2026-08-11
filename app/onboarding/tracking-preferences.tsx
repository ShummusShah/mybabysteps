import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Header } from '@/components/ui/Header';
import { useStore } from '@/stores/useStore';
import { theme, trackingCardStyles } from '@/constants/theme';

type TrackingModule = 'feeding' | 'sleep' | 'nappies' | 'pumping' | 'tummy_time' | 'medicine' | 'temperature' | 'growth' | 'milestones' | 'photos';

const TRACKING_MODULES: Array<{ id: TrackingModule; label: string; icon: string }> = [
  { id: 'feeding', label: 'Feeding', icon: 'bottle-soda' },
  { id: 'sleep', label: 'Sleep', icon: 'sleep' },
  { id: 'nappies', label: 'Nappies', icon: 'water' },
  { id: 'pumping', label: 'Pumping', icon: 'water-pump' },
  { id: 'tummy_time', label: 'Tummy Time', icon: 'baby-face' },
  { id: 'medicine', label: 'Medicine', icon: 'pill' },
  { id: 'temperature', label: 'Temperature', icon: 'thermometer' },
  { id: 'growth', label: 'Growth', icon: 'scale' },
  { id: 'milestones', label: 'Milestones', icon: 'star' },
  { id: 'photos', label: 'Photos', icon: 'camera' },
];

export default function TrackingPreferencesScreen() {
  const router = useRouter();
  const { setQuickLogModules } = useStore();
  const [enabledModules, setEnabledModules] = useState<Set<TrackingModule>>(
    new Set(TRACKING_MODULES.map((m) => m.id))
  );

  const handleToggleModule = (moduleId: TrackingModule) => {
    const updated = new Set(enabledModules);
    if (updated.has(moduleId)) {
      updated.delete(moduleId);
    } else {
      updated.add(moduleId);
    }
    setEnabledModules(updated);
  };

  const handleContinue = () => {
    const modules = TRACKING_MODULES.map((m, idx) => ({
      type: m.id as any,
      enabled: enabledModules.has(m.id),
      order: idx,
    }));
    setQuickLogModules(modules);
    router.push('/onboarding/complete');
  };

  return (
    <ScreenContainer>
      <Header leftAction={() => router.back()} title="What to Track" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Select what you'd like to track. You can change this anytime in settings.
        </Text>

        <View style={styles.modulesGrid}>
          {TRACKING_MODULES.map((module) => (
            <TouchableOpacity
              key={module.id}
              onPress={() => handleToggleModule(module.id)}
              style={[
                styles.moduleCard,
                enabledModules.has(module.id) && styles.moduleCardActive,
              ]}
            >
              <MaterialCommunityIcons
                name={module.icon as any}
                size={32}
                color={enabledModules.has(module.id) ? theme.colors.teal : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.moduleLabel,
                  enabledModules.has(module.id) && styles.moduleLabelActive,
                ]}
              >
                {module.label}
              </Text>
              <MaterialCommunityIcons
                name={
                  enabledModules.has(module.id) ? 'checkbox-marked-circle' : 'checkbox-blank-circle'
                }
                size={20}
                color={enabledModules.has(module.id) ? theme.colors.teal : theme.colors.border}
                style={styles.checkbox}
              />
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          title="Ready to Track"
          onPress={handleContinue}
          style={styles.submitButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  moduleCard: {
    width: '48%',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.card,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    position: 'relative',
  },
  moduleCardActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.teal,
  },
  moduleLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  moduleLabelActive: {
    color: theme.colors.text,
  },
  checkbox: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  submitButton: {
    marginBottom: theme.spacing.xl,
  },
});
