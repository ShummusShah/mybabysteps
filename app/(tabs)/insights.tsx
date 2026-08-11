import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import { theme } from '@/constants/theme';

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Insights" centerTitle />
      <View style={styles.content}>
        <Text style={styles.placeholder}>Insights Screen - Coming Soon</Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  placeholder: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
});
