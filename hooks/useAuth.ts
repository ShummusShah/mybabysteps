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
        .eq('id', userId);

      let profileData = data?.[0];

      // If profile doesn't exist, create it from auth user
      if (!profileData || (error && error.code === 'PGRST116')) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          await supabase.from('profiles').insert({
            id: userId,
            email: authUser.email,
            display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User',
          });

          // Fetch the newly created profile
          const { data: newProfileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          profileData = newProfileData;
        }
      }

      if (profileData) {
        setProfile(profileData);
      }

      // Check if user has a baby
      let { data: householdMembers } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', userId);

      // A user with no household of their own may have been invited as a
      // caregiver to an existing baby's household. Auto-accept any pending
      // invites for their email so they land straight in the app instead of
      // being sent through baby-creation onboarding.
      if ((!householdMembers || householdMembers.length === 0) && profileData?.email) {
        const { data: pendingInvites } = await supabase
          .from('household_invites')
          .select('*')
          .eq('email', profileData.email)
          .eq('status', 'pending');

        if (pendingInvites && pendingInvites.length > 0) {
          for (const invite of pendingInvites) {
            const { error: memberInsertError } = await supabase.from('household_members').insert({
              household_id: invite.household_id,
              user_id: userId,
              role: invite.role,
            });

            if (!memberInsertError) {
              await supabase
                .from('household_invites')
                .update({ status: 'accepted', responded_at: new Date().toISOString() })
                .eq('id', invite.id);
            }
          }

          const { data: refreshedMembers } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', userId);

          householdMembers = refreshedMembers;
        }
      }

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
          router.replace('/onboarding/baby-details' as any);
        }
      } else if (!inOnboardingGroup && !hasBaby) {
        // User signed in with no baby, need onboarding
        router.replace('/onboarding/baby-details' as any);
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

      if (!data.session) {
        // signUp() returns no error and no session both for a genuine new
        // signup pending email confirmation AND for an already-registered
        // email (Supabase no-ops silently rather than leaking which emails
        // exist). `data.user.identities` would distinguish the two, but
        // this project's client response doesn't include it, so both cases
        // are treated the same: show "check your email". A duplicate-email
        // signup just won't receive a new email, and can use "Back to Log
        // In" on that screen instead. Profile/household creation waits
        // until the user confirms and logs in (fetchProfile/createBaby
        // self-heal at that point).
        return { data, error: null, needsConfirmation: true };
      }

      // Profile is self-healed by fetchProfile() on the auth state change
      // this triggers, and the household is created by useBaby.createBaby()
      // once the user actually adds their baby during onboarding — both
      // run against this fresh, genuinely authenticated session.
      return { data, error: null, needsConfirmation: false };
    } catch (error) {
      return { data: null, error, needsConfirmation: false };
    }
  }

  async function resendConfirmationEmail(email: string) {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
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
    resendConfirmationEmail,
    signInWithEmail,
    signOut,
    resetPassword,
  };
}
