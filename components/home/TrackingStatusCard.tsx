import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TrackingStatusCardProps {
  type: 'feeding' | 'sleep' | 'nappy';
  title: string;
  subtitle: string;
  todayText: string;
  icon: string;
  backgroundColor: string;
  accentColor: string;
  onPress?: () => void;
  onIconPress?: () => void;
}

export function TrackingStatusCard({
  type,
  title,
  subtitle,
  todayText,
  icon,
  backgroundColor,
  accentColor,
  onPress,
  onIconPress,
}: TrackingStatusCardProps) {
  const iconLetter = type === 'feeding' ? 'F' : type === 'sleep' ? 'S' : 'N';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <TouchableOpacity
        style={[styles.iconCircle, { backgroundColor: 'white' }]}
        onPress={onIconPress}
        disabled={!onIconPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.iconLetter, { color: accentColor }]}>{iconLetter}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.todayText}>{todayText}</Text>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={20} color={accentColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 100,
    gap: 16,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconLetter: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#77808F',
    marginBottom: 4,
  },
  todayText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#172033',
  },
});
