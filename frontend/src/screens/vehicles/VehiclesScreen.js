import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
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
import { listVehicles, deleteVehicle } from '../../api/vehicles';
import { colors, radii, spacing, typography } from '../../styles/theme';

export default function VehiclesScreen({ navigation }) {
  const { user } = useAuth();
  const vehicles = useApi(() => listVehicles(user.id), [user?.id], { immediate: false });

  useFocusEffect(
    useCallback(() => {
      vehicles.refresh().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])
  );

  const onDelete = (vehicle) => {
    Alert.alert(
      'Remove vehicle?',
      `${vehicle.year} ${vehicle.make} ${vehicle.model} will be removed from your garage.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(vehicle.id, user.id, user.id);
              await vehicles.refresh();
            } catch (e) {
              Alert.alert('Could not remove', e?.message || 'Try again.');
            }
          },
        },
      ]
    );
  };

  const data = vehicles.data?.garage || [];

  return (
    <Screen padded={false}>
      <View style={styles.headerPad}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>My Garage</Text>
            <Text style={styles.subtitle}>The cars you ride with.</Text>
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={() => navigation.navigate('VehicleForm', { mode: 'create' })}
            hitSlop={8}
          >
            <Ionicons name="add" size={22} color="#06181B" />
          </Pressable>
        </View>
      </View>

      {vehicles.loading ? (
        <LoadingView />
      ) : vehicles.error && !vehicles.data ? (
        <ErrorView message={vehicles.error} onRetry={vehicles.refresh} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={data}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <EmptyState
              icon="car-sport-outline"
              title="Garage is empty"
              message="Add your first ride to get started."
              actionLabel="Add a vehicle"
              onAction={() => navigation.navigate('VehicleForm', { mode: 'create' })}
            />
          }
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() => navigation.navigate('VehicleForm', { mode: 'edit', vehicle: item })}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="car-sport" size={26} color={colors.primary} />
              </View>
              <Tag label={String(item.year)} tone="primary" style={styles.year} />
              <Text style={styles.make} numberOfLines={1}>{item.make}</Text>
              <Text style={styles.model} numberOfLines={1}>{item.model}</Text>
              <Pressable onPress={() => onDelete(item)} style={styles.trash} hitSlop={10}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </Pressable>
            </Card>
          )}
          refreshControl={
            <RefreshControl
              tintColor={colors.primary}
              refreshing={vehicles.refreshing}
              onRefresh={vehicles.refresh}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const CARD_GAP = 12;

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
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
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
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  card: {
    flex: 1,
    minHeight: 170,
    paddingVertical: spacing.lg,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(94,227,214,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  year: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  make: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  model: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trash: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.10)',
  },
});
