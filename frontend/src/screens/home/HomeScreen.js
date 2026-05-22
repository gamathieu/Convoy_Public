import React from 'react';
import { View, Text, StyleSheet, Pressable, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Tag from '../../components/Tag';
import SectionHeader from '../../components/SectionHeader';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { useAuth } from '../../context/AuthContext';
import useDashboardData from '../../hooks/useDashboardData';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { formatDateTime } from '../../utils/format';
import { convoyLabel } from '../../utils/display';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const {
    convoys,
    drives,
    upcomingDrives,
    myConvoys,
    garage,
    refreshing,
    refreshAll,
  } = useDashboardData(user?.id);

  return (
    <Screen padded={false} scroll={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            onRefresh={() => refreshAll().catch(() => {})}
          />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Hello,</Text>
            <Text style={styles.name}>{user?.name || 'Driver'}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Tabs', { screen: 'Profile' })}>
            <Avatar name={user?.name} size={48} />
          </Pressable>
        </View>

        <Card style={styles.heroCard} padded={false}>
          <LinearGradient
            colors={['rgba(94,227,214,0.18)', 'rgba(94,227,214,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroInner}>
            <Tag label="Your dashboard" tone="primary" />
            <Text style={styles.heroTitle}>Plan your next drive</Text>
            <Text style={styles.heroSubtitle}>
              Create a convoy, invite your crew, and hit the road together.
            </Text>
            <View style={styles.heroActions}>
              <Pressable
                style={styles.heroBtn}
                onPress={() => navigation.navigate('CreateConvoy')}
              >
                <Ionicons name="add" size={18} color="#06181B" />
                <Text style={styles.heroBtnText}>New convoy</Text>
              </Pressable>
              <Pressable
                style={[styles.heroBtn, styles.heroBtnSecondary]}
                onPress={() => navigation.navigate('Tabs', { screen: 'Drives' })}
              >
                <Ionicons name="navigate-outline" size={18} color={colors.textPrimary} />
                <Text style={[styles.heroBtnText, styles.heroBtnTextSecondary]}>
                  My drives
                </Text>
              </Pressable>
            </View>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <StatCard label="Convoys" value={convoys.data?.convoys?.length ?? 0} icon="people" />
          <StatCard label="Drives" value={drives.data?.drives?.length ?? 0} icon="navigate" />
          <StatCard label="Garage" value={garage.length} icon="car-sport" />
        </View>

        <SectionHeader
          title="Upcoming drives"
          actionLabel="See all"
          onAction={() => navigation.navigate('Tabs', { screen: 'Drives' })}
        />
        {drives.loading && !drives.data ? (
          <LoadingView />
        ) : upcomingDrives.length === 0 ? (
          <EmptyState
            icon="navigate-outline"
            title="No drives yet"
            message="Join a convoy and plan your first drive."
          />
        ) : (
          upcomingDrives.map((d) => (
            <Card
              key={d.id}
              style={styles.driveCard}
              onPress={() => navigation.navigate('DriveDetail', { driveId: d.id })}
            >
              <View style={styles.driveTopRow}>
                <Text style={styles.driveName} numberOfLines={1}>
                  {d.name}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
              <Text style={styles.driveRoute} numberOfLines={1}>
                {d.starting_location} → {d.destination}
              </Text>
              <Text style={styles.driveDate}>{formatDateTime(d.date_time)}</Text>
            </Card>
          ))
        )}

        <SectionHeader
          title="Your convoys"
          actionLabel="See all"
          onAction={() => navigation.navigate('Tabs', { screen: 'Convoys' })}
        />
        {convoys.loading && !convoys.data ? (
          <LoadingView />
        ) : myConvoys.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No convoys yet"
            message="Start a new convoy to begin planning drives with your crew."
            actionLabel="Create a convoy"
            onAction={() => navigation.navigate('CreateConvoy')}
          />
        ) : (
          myConvoys.map((c) => (
            <Card
              key={c.id}
              style={styles.convoyCard}
              onPress={() => navigation.navigate('ConvoyDetail', { convoyId: c.id })}
            >
              <View style={styles.convoyRow}>
                <View style={styles.convoyIcon}>
                  <Ionicons name="people" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.convoyTitle}>{convoyLabel(c)}</Text>
                  <Text style={styles.convoySub}>
                    {c.member_count} {c.member_count === 1 ? 'member' : 'members'}
                  </Text>
                </View>
                {c.is_leader ? <Tag label="Leader" tone="accent" /> : null}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <View style={statStyles.wrap}>
      <View style={statStyles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(94,227,214,0.12)',
    marginBottom: spacing.sm,
  },
  value: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['5xl'] + 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  hello: {
    ...typography.body,
    color: colors.textSecondary,
  },
  name: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  heroCard: {
    overflow: 'hidden',
  },
  heroInner: {
    padding: spacing.xl,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  heroSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  heroBtnSecondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroBtnText: {
    ...typography.button,
    color: '#06181B',
    fontSize: 14,
  },
  heroBtnTextSecondary: {
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  driveCard: {
    marginBottom: spacing.md,
  },
  driveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driveName: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  driveRoute: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 6,
  },
  driveDate: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  convoyCard: {
    marginBottom: spacing.md,
  },
  convoyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  convoyIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(94,227,214,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  convoyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  convoySub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
