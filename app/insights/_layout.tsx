import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';

export default function InsightsDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="sleep" />
      <Stack.Screen name="growth" />
    </Stack>
  );
}
