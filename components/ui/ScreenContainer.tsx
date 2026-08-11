import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { theme } from '@/constants/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  scrollable = false,
  padding = true,
  style,
}: ScreenContainerProps) {
  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      bounces={false}
      style={[styles.scroll, padding && styles.padding]}
    >
      {children}
    </ScrollView>
  ) : (
    <>{children}</>
  );

  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.flex, padding && !scrollable && styles.padding]}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: theme.spacing.lg,
  },
  scroll: {
    flexGrow: 1,
  },
});
