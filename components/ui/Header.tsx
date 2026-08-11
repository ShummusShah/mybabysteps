import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: () => void;
  leftLabel?: string;
  rightAction?: () => void;
  rightLabel?: string;
  centerTitle?: boolean;
  style?: ViewStyle;
}

export function Header({
  title,
  subtitle,
  leftAction,
  leftLabel,
  rightAction,
  rightLabel,
  centerTitle = false,
  style,
}: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {leftAction ? (
          <TouchableOpacity onPress={leftAction} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.actionText}>{leftLabel || 'Back'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}

        <View style={[styles.titleContainer, centerTitle && styles.centered]}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightAction ? (
          <TouchableOpacity onPress={rightAction} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.actionText}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.screenTitle.fontSize,
    fontWeight: theme.typography.screenTitle.fontWeight,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  actionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.teal,
    fontWeight: '600' as const,
  },
  spacer: {
    width: 50,
  },
});
