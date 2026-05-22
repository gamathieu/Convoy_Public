import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Tag from '../../components/Tag';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import { listUserDrives } from '../../api/drives';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { formatDateTime } from '../../utils/format';
import { convoyLabel } from '../../utils/display';

export default function DrivesScreen({ navigation }) {
  const { user } = useAuth();
  const drives = useApi(() => listUserDrives(user.id), [user?.id], { immediate: false });

  useFocusEffect(
    useCallback(() => {
      drives.refresh().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])
  );

  const data = drives.data?.drives || [];

  return (
    <Screen padded={false}>
      <View style={styles.headerPad}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Drives</Text>
            <Text style={styles.subtitle}>Every drive you're part of, in one place.</Text>
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={() => navigation.navigate('Tabs', { screen: 'Convoys' })}
            hitSlop={8}
          >
            <Ionicons name="add" size={22} color="#06181B" />
          </Pressable>
        </View>
      </View>

      {drives.loading ? (
        <LoadingView />
      ) : drives.error && !drives.data ? (
        <ErrorView message={drives.error} onRetry={drives.refresh} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={data}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <EmptyState
              icon="navigate-outline"
              title="No drives yet"
              message="Open a convoy to plan a new drive with your crew."
              actionLabel="Browse convoys"
              onAction={() => navigation.navigate('Tabs', { screen: 'Convoys' })}
            />
          }
          renderItem={({ item }) => (
            <Card
              style={styles.itemCard}
              onPress={() => navigation.navigate('DriveDetail', { driveId: item.id })}
            >
              <View style={styles.itemTopRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                <Tag label={convoyLabel({ id: item.convoy_id, name: item.convoy_name })} />
              </View>
              <View style={styles.routeRow}>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <Text style={styles.itemRoute} numberOfLines={1}>
                  {item.starting_location} → {item.destination}
                </Text>
              </View>
              <View style={styles.dateRow}>
                <Ionicons name="time-outline" size={14} color={colors.primary} />
                <Text style={styles.itemDate}>{formatDateTime(item.date_time)}</Text>
              </View>
            </Card>
          )}
          refreshControl={
            <RefreshControl
              tintColor={colors.primary}
              refreshing={drives.refreshing}
              onRefresh={drives.refresh}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerPad: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'] + 40,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemTitle: {
    flex: 1,
    ...typography.h3,
    color: colors.textPrimary,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  itemRoute: {
    ...typography.bodySm,
    color: colors.textSecondary,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  itemDate: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
  },
});
