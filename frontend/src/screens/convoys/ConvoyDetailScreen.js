import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Tag from '../../components/Tag';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import { getConvoy, joinConvoy } from '../../api/convoys';
import { listConvoyDrives } from '../../api/drives';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { formatDateTime, formatDateShort } from '../../utils/format';
import { convoyLabel, memberId } from '../../utils/display';
import useUserNames from '../../hooks/useUserNames';

export default function ConvoyDetailScreen({ route, navigation }) {
  const { convoyId } = route.params;
  const { user } = useAuth();

  const convoy = useApi(() => getConvoy(convoyId), [convoyId], { immediate: false });
  const drives = useApi(() => listConvoyDrives(convoyId), [convoyId], { immediate: false });
  const c = convoy.data?.convoy;
  const memberIds = useMemo(() => (c?.members || []).map(memberId), [c?.members]);
  const { labelFor } = useUserNames(memberIds);
  const title = convoyLabel(c);

  useFocusEffect(
    useCallback(() => {
      convoy.refresh().catch(() => {});
      drives.refresh().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [convoyId])
  );

  const refreshing = convoy.refreshing || drives.refreshing;
  const onRefresh = () => {
    convoy.refresh().catch(() => {});
    drives.refresh().catch(() => {});
  };

  if (convoy.loading) {
    return (
      <Screen>
        <Header title="Convoy" showBack />
        <LoadingView />
      </Screen>
    );
  }

  if (convoy.error && !convoy.data) {
    return (
      <Screen>
        <Header title="Convoy" showBack />
        <ErrorView message={convoy.error} onRetry={convoy.refresh} />
      </Screen>
    );
  }

  const isMember = memberIds.includes(user.id);
  const isLeader = c?.leader_id === user.id;

  const onJoin = async () => {
    try {
      await joinConvoy(convoyId, user.id);
      await convoy.refresh();
      Alert.alert('Joined', 'You are now part of this convoy.');
    } catch (e) {
      Alert.alert('Could not join', e?.message || 'Try again.');
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <Header title={title} showBack />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl tintColor={colors.primary} refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card>
          <View style={styles.topRow}>
            <View style={styles.bigIcon}>
              <Ionicons name="people" size={26} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bigTitle}>{title}</Text>
              <Text style={styles.bigSub}>Created {formatDateShort(c?.created_at)}</Text>
            </View>
            {isLeader ? <Tag label="You lead" tone="accent" /> : isMember ? <Tag label="Member" tone="primary" /> : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Stat label="Members" value={c?.members?.length || 0} />
            <Stat label="Drives" value={drives.data?.drives?.length ?? 0} />
            <Stat label="Leader" value={labelFor(c?.leader_id)} />
          </View>

          {!isMember ? (
            <View style={{ marginTop: spacing.lg }}>
              <Button title="Join convoy" onPress={onJoin} />
            </View>
          ) : null}
        </Card>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Drives</Text>
          {isMember ? (
            <Pressable
              hitSlop={8}
              style={styles.smallBtn}
              onPress={() => navigation.navigate('CreateDrive', { convoyId })}
            >
              <Ionicons name="add" size={16} color="#06181B" />
              <Text style={styles.smallBtnText}>New drive</Text>
            </Pressable>
          ) : null}
        </View>

        {drives.loading ? (
          <LoadingView />
        ) : (drives.data?.drives || []).length === 0 ? (
          <EmptyState
            icon="navigate-outline"
            title="No drives planned"
            message={isMember ? 'Plan the next adventure for this convoy.' : 'This convoy has no drives yet.'}
            actionLabel={isMember ? 'Plan a drive' : undefined}
            onAction={isMember ? () => navigation.navigate('CreateDrive', { convoyId }) : undefined}
          />
        ) : (
          drives.data.drives.map((d) => (
            <Card
              key={d.id}
              style={styles.driveCard}
              onPress={() => navigation.navigate('DriveDetail', { driveId: d.id })}
            >
              <View style={styles.driveTopRow}>
                <Text style={styles.driveName} numberOfLines={1}>{d.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
              <Text style={styles.driveRoute} numberOfLines={1}>
                {d.starting_location}  →  {d.destination}
              </Text>
              <Text style={styles.driveDate}>{formatDateTime(d.date_time)}</Text>
            </Card>
          ))
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Members</Text>
        </View>

        <Card>
          {(c?.members || []).map((m, i) => {
            const id = memberId(m);
            return (
            <View key={id}>
              <View style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Ionicons name="person" size={18} color={colors.textSecondary} />
                </View>
                <Text style={styles.memberText}>{labelFor(m)}</Text>
                {id === c?.leader_id ? <Tag label="Leader" tone="accent" /> : null}
              </View>
              {i < c.members.length - 1 ? <View style={styles.divider} /> : null}
            </View>
            );
          })}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }) {
  return (
    <View style={statStyles.wrap}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  value: { ...typography.h2, color: colors.textPrimary },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'] + 40,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bigIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(94,227,214,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigTitle: { ...typography.h2, color: colors.textPrimary },
  bigSub: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  smallBtnText: {
    ...typography.caption,
    color: '#06181B',
    fontWeight: '700',
  },
  driveCard: {
    marginBottom: spacing.md,
  },
  driveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driveName: { ...typography.h3, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  driveRoute: { ...typography.bodySm, color: colors.textSecondary, marginTop: 6 },
  driveDate: { ...typography.caption, color: colors.primary, marginTop: spacing.sm, textTransform: 'uppercase' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberText: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
});
