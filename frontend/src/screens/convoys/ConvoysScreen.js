import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Tag from '../../components/Tag';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import { listUserConvoys, joinConvoy } from '../../api/convoys';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { convoyLabel } from '../../utils/display';

export default function ConvoysScreen({ navigation }) {
  const { user } = useAuth();
  const convoys = useApi(() => listUserConvoys(user.id), [user?.id], { immediate: false });
  const [joinId, setJoinId] = useState('');
  const [joining, setJoining] = useState(false);

  useFocusEffect(
    useCallback(() => {
      convoys.refresh().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])
  );

  const onJoin = async () => {
    const id = Number(joinId);
    if (!Number.isInteger(id) || id <= 0) {
      return Alert.alert('Invalid ID', 'Enter a valid convoy ID.');
    }
    setJoining(true);
    try {
      await joinConvoy(id, user.id);
      setJoinId('');
      await convoys.refresh();
      navigation.navigate('ConvoyDetail', { convoyId: id });
    } catch (e) {
      Alert.alert('Could not join', e?.message || 'Try again.');
    } finally {
      setJoining(false);
    }
  };

  const data = convoys.data?.convoys || [];

  return (
    <Screen padded={false}>
      <View style={styles.headerPad}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Convoys</Text>
            <Text style={styles.subtitle}>Your crews and the rides you lead.</Text>
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={() => navigation.navigate('CreateConvoy')}
            hitSlop={8}
          >
            <Ionicons name="add" size={22} color="#06181B" />
          </Pressable>
        </View>

        <Card style={styles.joinCard}>
          <Text style={styles.joinLabel}>Join a convoy</Text>
          <View style={styles.joinRow}>
            <View style={{ flex: 1 }}>
              <Input
                value={joinId}
                onChangeText={setJoinId}
                placeholder="Convoy ID"
                keyboardType="number-pad"
                style={{ marginBottom: 0 }}
              />
            </View>
            <Button
              title="Join"
              onPress={onJoin}
              loading={joining}
              fullWidth={false}
              size="md"
            />
          </View>
        </Card>
      </View>

      {convoys.loading ? (
        <LoadingView />
      ) : convoys.error && !convoys.data ? (
        <ErrorView message={convoys.error} onRetry={convoys.refresh} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={data}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No convoys yet"
              message="Create your first convoy or join one with an ID."
              actionLabel="Create a convoy"
              onAction={() => navigation.navigate('CreateConvoy')}
            />
          }
          renderItem={({ item }) => (
            <Card
              style={styles.itemCard}
              onPress={() => navigation.navigate('ConvoyDetail', { convoyId: item.id })}
            >
              <View style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <Ionicons name="people" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{convoyLabel(item)}</Text>
                  <Text style={styles.itemSub}>
                    {item.member_count} {item.member_count === 1 ? 'member' : 'members'}
                  </Text>
                </View>
                {item.is_leader ? <Tag label="Leader" tone="accent" /> : <Tag label="Member" />}
              </View>
            </Card>
          )}
          refreshControl={
            <RefreshControl
              tintColor={colors.primary}
              refreshing={convoys.refreshing}
              onRefresh={convoys.refresh}
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
    marginBottom: spacing.lg,
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
  joinCard: {
    marginBottom: spacing.lg,
  },
  joinLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'] + 40,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(94,227,214,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  itemSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
