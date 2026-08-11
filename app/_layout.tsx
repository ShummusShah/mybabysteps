import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/stores/useStore';
import { theme } from '@/constants/theme';

const queryClient = new QueryClient();

function RootLayout() {
  const { loading } = useAuth();
  const { initializeFromStorage } = useStore();

  useEffect(() => {
    initializeFromStorage();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayoutWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout />
    </QueryClientProvider>
  );
}
