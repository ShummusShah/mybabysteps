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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { useHousehold, HouseholdInvite } from '@/hooks/useHousehold';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  parent: 'Parent',
  caregiver: 'Caregiver',
  viewer: 'Viewer',
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
      <Header
        title="Caregivers"
        leftAction={() => safeBack(router, '/(tabs)/profile')}
        rightAction={() => router.push('/caregivers/invite')}
        rightLabel="Invite"
      />

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
                <View key={invite.id} style={styles.inviteCard}>
                  <View style={styles.inviteInfo}>
                    <Text style={styles.inviteText}>
                      You&apos;ve been invited as a <Text style={styles.inviteRole}>{ROLE_LABELS[invite.role]}</Text>
                    </Text>
                  </View>
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
            <Text style={styles.sectionTitle}>Household Members</Text>
            {members.map((member) => {
              const isMe = member.user_id === session?.user?.id;
              return (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <MaterialCommunityIcons name="account" size={22} color={theme.colors.teal} />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.profile?.display_name || member.profile?.email || 'Unknown'}
                      {isMe && ' (You)'}
                    </Text>
                    <Text style={styles.memberRole}>{ROLE_LABELS[member.role]}</Text>
                  </View>
                  {canManage && !isMe && (
                    <TouchableOpacity
                      onPress={() =>
                        handleRemoveMember(
                          member.id,
                          member.profile?.display_name || member.profile?.email || 'This member'
                        )
                      }
                      disabled={busyId === member.id}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialCommunityIcons name="close-circle-outline" size={22} color={theme.colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Pending outgoing invites */}
          {sentInvites.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Invites</Text>
              {sentInvites.map((invite) => (
                <View key={invite.id} style={styles.pendingCard}>
                  <View style={styles.pendingIcon}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{invite.email}</Text>
                    <Text style={styles.memberRole}>{ROLE_LABELS[invite.role]} · Pending</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCancelInvite(invite)}
                    disabled={busyId === invite.id}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialCommunityIcons name="close" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  inviteCard: {
    backgroundColor: theme.colors.mint,
    borderRadius: theme.borderRadius.input,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  inviteInfo: {
    marginBottom: theme.spacing.md,
  },
  inviteText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
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
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  memberRole: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
