import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/auth/supabase';
import { Profile } from '@/types';

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [hasBaby, setHasBaby] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  const isSignedIn = !!session;
  const inAuthGroup = segments[0] === 'auth';
  const inOnboardingGroup = segments[0] === 'onboarding';

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      try {
        const {
          data: { session: authSession },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setSession(authSession);

          if (authSession?.user) {
            await fetchProfile(authSession.user.id);
          }
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      if (mounted) {
        setSession(authSession);

        if (authSession?.user) {
          await fetchProfile(authSession.user.id);
        } else {
          setProfile(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Check if user has a baby
      const { data: householdMembers } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', userId);

      if (householdMembers && householdMembers.length > 0) {
        const householdIds = householdMembers.map((m) => m.household_id);
        const { data: babies } = await supabase
          .from('babies')
          .select('id')
          .in('household_id', householdIds);

        setHasBaby((babies && babies.length > 0) || false);
      } else {
        setHasBaby(false);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setHasBaby(false);
    }
  }

  useEffect(() => {
    if (loading) return;

    if (isSignedIn) {
      if (inAuthGroup) {
        // User signed in but still in auth group, redirect out
        if (hasBaby) {
          router.replace('/' as any);
        } else {
          router.replace('/onboarding' as any);
        }
      } else if (!inOnboardingGroup && !hasBaby) {
        // User signed in with no baby, need onboarding
        router.replace('/onboarding' as any);
      }
    } else if (!isSignedIn && !inAuthGroup) {
      // User not signed in, go to auth
      router.replace('/auth' as any);
    }
  }, [isSignedIn, loading, inAuthGroup, inOnboardingGroup, hasBaby]);

  async function signUpWithEmail(email: string, password: string, displayName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          display_name: displayName,
        });
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  return {
    session,
    profile,
    loading,
    isSignedIn,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    resetPassword,
  };
}
