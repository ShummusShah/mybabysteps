import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { useStore } from '@/stores/useStore';
import { moduleIcons, moduleLabels, moduleColors, QuickLogModuleType } from '@/lib/utils/moduleColors';

const routeMap: Record<string, string> = {
  feed: '/feed/add',
  sleep: '/sleep/add',
  nappy: '/nappy/add',
  pump: '/feed/add?type=pump',
  tummy: '/tummy/add',
  medicine: '/medicine/add',
  temperature: '/temperature/add',
  growth: '/insights/growth',
  milestone: '/milestones',
  photo: '/photos',
};

export default function QuickLogScreen() {
  const router = useRouter();
  const { quickLogModules } = useStore();

  const enabledModules = quickLogModules.filter((m) => m.enabled).sort((a, b) => a.order - b.order);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => safeBack(router, '/(tabs)')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Quick Log</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>What would you like to log?</Text>

        <View style={styles.grid}>
          {enabledModules.map((module: any) => {
            const type = module.type as QuickLogModuleType;
            const colors = moduleColors[type] || { bg: theme.colors.mint, accent: theme.colors.teal };

            return (
              <TouchableOpacity
                key={type}
                style={[styles.gridItem, { backgroundColor: colors.bg }]}
                onPress={() => router.push(routeMap[type] as any)}
              >
                <View style={styles.gridItemIcon}>
                  <MaterialCommunityIcons
                    name={moduleIcons[type] as any}
                    size={32}
                    color={colors.accent}
                  />
                </View>
                <Text style={styles.gridItemLabel}>{moduleLabels[type]}</Text>
              </TouchableOpacity>
            );
          })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.screenTitle.fontSize,
    fontWeight: theme.typography.screenTitle.fontWeight,
    color: theme.colors.text,
  },
  placeholder: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: theme.typography.sectionTitle.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemIcon: {
    marginBottom: theme.spacing.sm,
  },
  gridItemLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
