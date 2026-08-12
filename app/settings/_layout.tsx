import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="baby" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
