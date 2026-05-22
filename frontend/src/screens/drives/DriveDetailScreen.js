import React, { useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import Tag from '../../components/Tag';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import { getDrive, joinDrive } from '../../api/drives';
import { getConvoy } from '../../api/convoys';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { formatDateTime } from '../../utils/format';
import { convoyLabel } from '../../utils/display';

export default function DriveDetailScreen({ route, navigation }) {
  const { driveId } = route.params;
  const { user } = useAuth();
  const drive = useApi(() => getDrive(driveId), [driveId], { immediate: false });
  const convoyId = drive.data?.convoy_id;
  const convoyMeta = useApi(
    () => (convoyId ? getConvoy(convoyId) : Promise.resolve(null)),
    [convoyId],
    { immediate: false }
  );

  useFocusEffect(
    useCallback(() => {
      drive.refresh().catch(() => {});
      if (convoyId) convoyMeta.refresh().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [driveId, convoyId])
  );

  if (drive.loading) {
    return (
      <Screen>
        <Header title="Drive" showBack />
        <LoadingView />
      </Screen>
    );
  }

  if (drive.error && !drive.data) {
    return (
      <Screen>
        <Header title="Drive" showBack />
        <ErrorView message={drive.error} onRetry={drive.refresh} />
      </Screen>
    );
  }

  const d = drive.data;
  const convoyName = convoyLabel(convoyMeta.data?.convoy ?? { id: d?.convoy_id });
  const isMember = (d?.members || []).some((m) => m.id === user.id);

  const onJoin = async () => {
    try {
      await joinDrive(driveId, user.id);
      await drive.refresh();
      Alert.alert('Joined', 'You are in for this drive.');
    } catch (e) {
      Alert.alert('Could not join', e?.message || 'Try again.');
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <Header title={d?.name || 'Drive'} showBack />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl tintColor={colors.primary} refreshing={drive.refreshing} onRefresh={drive.refresh} />
        }
      >
        <Card>
          <View style={styles.topRow}>
            <View style={styles.bigIcon}>
              <Ionicons name="navigate" size={26} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bigTitle} numberOfLines={2}>{d?.name}</Text>
              <Text style={styles.bigSub}>{convoyName}</Text>
            </View>
            {isMember ? <Tag label="Joined" tone="primary" /> : null}
          </View>

          <View style={styles.divider} />

          <RouteRow icon="flag-outline" label="From" value={d?.starting_location} />
          <RouteRow icon="location-outline" label="To" value={d?.destination} />
          <RouteRow icon="time-outline" label="When" value={formatDateTime(d?.date_time)} accent />

          {!isMember ? (
            <View style={{ marginTop: spacing.lg }}>
              <Button title="Join this drive" onPress={onJoin} />
            </View>
          ) : null}
        </Card>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Riders</Text>
          <Text style={styles.sectionCount}>{d?.members?.length || 0}</Text>
        </View>

        <Card>
          {(d?.members || []).map((m, i) => (
            <View key={m.id}>
              <View style={styles.memberRow}>
                <Avatar name={m.name} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberMail}>{m.email}</Text>
                </View>
                {m.id === user.id ? <Tag label="You" tone="accent" /> : null}
              </View>
              {i < d.members.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function RouteRow({ icon, label, value, accent }) {
  return (
    <View style={routeStyles.row}>
      <View style={[routeStyles.iconWrap, accent && routeStyles.iconWrapAccent]}>
        <Ionicons name={icon} size={16} color={accent ? colors.primary : colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={routeStyles.label}>{label}</Text>
        <Text style={[routeStyles.value, accent && routeStyles.valueAccent]} numberOfLines={2}>
          {value || '—'}
        </Text>
      </View>
    </View>
  );
}

const routeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapAccent: {
    backgroundColor: 'rgba(94,227,214,0.12)',
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: 2,
  },
  valueAccent: {
    color: colors.primary,
    fontWeight: '700',
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
    marginBottom: spacing.sm,
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
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  sectionCount: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  memberMail: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
