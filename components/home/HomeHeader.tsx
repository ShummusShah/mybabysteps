import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { StorageImage } from '@/components/ui/StorageImage';

interface HomeHeaderProps {
  parentName: string;
  babyName: string;
  babyAge: string;
  babyAvatarUrl?: string | null;
}

export function HomeHeader({ parentName, babyName, babyAge, babyAvatarUrl }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarPlaceholder}>
        {babyAvatarUrl ? (
          <StorageImage path={babyAvatarUrl} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <MaterialCommunityIcons name="baby-face-outline" size={20} color={theme.colors.teal} />
        )}
      </View>
      <View style={styles.textContent}>
        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.parentName}>{parentName} 👋</Text>
        <Text style={styles.babyAge}>{babyName} is {babyAge}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400' as const,
    marginBottom: 2,
  },
  parentName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  babyAge: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400' as const,
    marginTop: 4,
  },
});
