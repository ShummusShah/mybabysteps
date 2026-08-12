import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useHousehold, HouseholdInvite } from '@/hooks/useHousehold';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  parent: 'Parent · Can log & edit',
  caregiver: 'Caregiver · Can log & edit',
  viewer: 'Viewer · Can view only',
};

const ROLE_INVITE_LABELS: Record<string, string> = {
  owner: 'Owner',
  parent: 'Parent',
  caregiver: 'Caregiver',
  viewer: 'Viewer',
};

const AVATAR_COLORS: Record<string, string> = {
  owner: theme.colors.mint,
  parent: theme.colors.lavender,
  caregiver: theme.colors.peach,
  viewer: theme.colors.yellow,
};

export default function CaregiversScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const {
    members,
    sentInvites,
    receivedInvites,
    currentUserRole,
    isLoading,
    acceptInvite,
    declineInvite,
    cancelInvite,
    removeMember,
  } = useHousehold();

  const [busyId, setBusyId] = useState<string | null>(null);
  const canManage = currentUserRole === 'owner';

  async function handleAccept(invite: HouseholdInvite) {
    setBusyId(invite.id);
    try {
      await acceptInvite(invite);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to accept invite');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(invite: HouseholdInvite) {
    setBusyId(invite.id);
    try {
      await declineInvite(invite.id);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to decline invite');
    } finally {
      setBusyId(null);
    }
  }

  function handleCancelInvite(invite: HouseholdInvite) {
    Alert.alert('Cancel Invite?', `Withdraw the invite to ${invite.email}?`, [
      { text: 'Back', style: 'cancel' },
      {
        text: 'Cancel Invite',
        style: 'destructive',
        onPress: async () => {
          setBusyId(invite.id);
          try {
            await cancelInvite(invite.id);
          } catch (error) {
            Alert.alert('Error', (error as any)?.message || 'Failed to cancel invite');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  }

  function handleRemoveMember(memberId: string, label: string) {
    Alert.alert('Remove Member?', `${label} will lose access to this baby's data.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setBusyId(memberId);
          try {
            await removeMember(memberId);
          } catch (error) {
            Alert.alert('Error', (error as any)?.message || 'Failed to remove member');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <Header title="Caregivers" leftLabel="‹" leftAction={() => safeBack(router, '/(tabs)/profile')} />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Invites addressed to me */}
          {receivedInvites.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Invitations for you</Text>
              {receivedInvites.map((invite) => (
                <View key={invite.id} style={styles.receivedInviteCard}>
                  <Text style={styles.inviteText}>
                    You&apos;ve been invited as a{' '}
                    <Text style={styles.inviteRole}>{ROLE_INVITE_LABELS[invite.role]}</Text>
                  </Text>
                  <View style={styles.inviteActions}>
                    <TouchableOpacity
                      style={[styles.pillButton, styles.declineButton]}
                      onPress={() => handleDecline(invite)}
                      disabled={busyId === invite.id}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pillButton, styles.acceptButton]}
                      onPress={() => handleAccept(invite)}
                      disabled={busyId === invite.id}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Members */}
          <View style={styles.section}>
            {members.map((member) => {
              const isMe = member.user_id === session?.user?.id;
              const removable = canManage && !isMe;
              const CardComponent = removable ? TouchableOpacity : View;
              return (
                <CardComponent
                  key={member.id}
                  style={styles.memberCard}
                  {...(removable
                    ? {
                        onPress: () =>
                          handleRemoveMember(
                            member.id,
                            member.profile?.display_name || member.profile?.email || 'This member'
                          ),
                        disabled: busyId === member.id,
                        activeOpacity: 0.7,
                      }
                    : {})}
                >
                  <View
                    style={[
                      styles.memberAvatar,
                      { backgroundColor: AVATAR_COLORS[member.role] || theme.colors.mint },
                    ]}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.profile?.display_name || member.profile?.email || 'Unknown'}
                    </Text>
                    <Text style={styles.memberRole}>{ROLE_LABELS[member.role]}</Text>
                  </View>
                  {isMe && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youBadgeText}>You</Text>
                    </View>
                  )}
                </CardComponent>
              );
            })}
          </View>

          {/* Pending outgoing invites */}
          {sentInvites.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending invites</Text>
              {sentInvites.map((invite) => (
                <TouchableOpacity
                  key={invite.id}
                  style={styles.pendingCard}
                  onPress={() => handleCancelInvite(invite)}
                  disabled={busyId === invite.id}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pendingEmail}>{invite.email}</Text>
                  <Text style={styles.pendingStatus}>Pending</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <PrimaryButton
            title="Invite Caregiver"
            onPress={() => router.push('/caregivers/invite')}
            style={styles.inviteButton}
          />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.metadata.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  receivedInviteCard: {
    backgroundColor: theme.colors.mint,
    borderRadius: theme.borderRadius.input,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  inviteText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  inviteRole: {
    fontWeight: '700' as const,
    color: theme.colors.teal,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  pillButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: theme.colors.teal,
  },
  acceptButtonText: {
    color: theme.colors.white,
    fontWeight: '600' as const,
    fontSize: theme.typography.bodySmall.fontSize,
  },
  declineButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  declineButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: '600' as const,
    fontSize: theme.typography.bodySmall.fontSize,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  memberRole: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  youBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 14,
    backgroundColor: theme.colors.mint,
  },
  youBadgeText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
  pendingCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  pendingEmail: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  pendingStatus: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.orange,
    marginTop: 2,
  },
  inviteButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});
