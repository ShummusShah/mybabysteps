import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="baby-details" />
      <Stack.Screen name="tracking-preferences" />
    </Stack>
  );
}
