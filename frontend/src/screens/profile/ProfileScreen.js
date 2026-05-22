import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Tag from '../../components/Tag';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../api/users';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { isEmail, isNonEmpty } from '../../utils/validation';

export default function ProfileScreen() {
  const { user, signOut, refreshUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [startingLocation, setStartingLocation] = useState(user?.starting_location || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setStartingLocation(user?.starting_location || '');
  }, [user?.id, user?.name, user?.email, user?.starting_location]);

  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!isNonEmpty(name)) next.name = 'Required.';
    if (!isEmail(email)) next.email = 'Enter a valid email.';
    if (!isNonEmpty(startingLocation)) next.starting_location = 'Required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const patch = {};
      if (name.trim() !== user.name) patch.name = name.trim();
      if (email.trim() !== user.email) patch.email = email.trim();
      if (startingLocation.trim() !== (user.starting_location || '')) {
        patch.starting_location = startingLocation.trim();
      }
      if (Object.keys(patch).length === 0) {
        setEditing(false);
        return;
      }
      await updateUser(user.id, patch);
      await refreshUser();
      setEditing(false);
    } catch (e) {
      Alert.alert('Could not save', e?.message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onLogout = () => {
    Alert.alert('Sign out', 'You will need to sign back in next time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl tintColor={colors.primary} refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Profile</Text>
          <Pressable
            hitSlop={8}
            style={styles.iconBtn}
            onPress={() => setEditing((v) => !v)}
          >
            <Ionicons name={editing ? 'close' : 'create-outline'} size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Card style={styles.profileCard}>
          <Avatar name={user?.name} size={80} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.starting_location ? (
            <View style={{ marginTop: spacing.md }}>
              <Tag label={user.starting_location} tone="primary" />
            </View>
          ) : null}
        </Card>

        <Text style={styles.sectionLabel}>Account</Text>
        <Card>
          {editing ? (
            <View>
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                error={errors.name}
                autoCapitalize="words"
              />
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
              />
              <Input
                label="Starting location"
                value={startingLocation}
                onChangeText={setStartingLocation}
                error={errors.starting_location}
                autoCapitalize="words"
              />
              <Button title="Save changes" onPress={onSave} loading={submitting} />
            </View>
          ) : (
            <View>
              <InfoRow label="Name" value={user?.name} />
              <Divider />
              <InfoRow label="Email" value={user?.email} />
              <Divider />
              <InfoRow label="Starting location" value={user?.starting_location} />
              <Divider />
              <InfoRow label="User ID" value={`#${user?.id}`} />
            </View>
          )}
        </Card>

        <Text style={styles.sectionLabel}>Session</Text>
        <Card>
          <Pressable style={styles.logoutRow} onPress={onLogout}>
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            </View>
            <Text style={styles.logoutText}>Sign out</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

function Divider() {
  return <View style={infoStyles.divider} />;
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  label: { ...typography.bodySm, color: colors.textSecondary },
  value: { ...typography.body, color: colors.textPrimary, maxWidth: '60%' },
  divider: { height: 1, backgroundColor: colors.divider },
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
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  name: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.md },
  email: { ...typography.bodySm, color: colors.textSecondary, marginTop: 4 },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239,68,68,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    flex: 1,
    ...typography.body,
    color: colors.danger,
    fontWeight: '700',
  },
});
