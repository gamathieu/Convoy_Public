import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { createConvoy } from '../../api/convoys';
import { colors, radii, spacing, typography } from '../../styles/theme';

export default function CreateConvoyScreen({ navigation }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return Alert.alert('Name required', 'Give your convoy a name your crew will recognize.');
    }
    setSubmitting(true);
    try {
      const res = await createConvoy(user.id, { name: trimmed });
      const newId = res?.convoy?.id;
      if (newId) {
        navigation.replace('ConvoyDetail', { convoyId: newId });
      } else {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Could not create convoy', e?.message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <Header title="New convoy" showBack />

      <Card>
        <View style={styles.icon}>
          <Ionicons name="people" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>Start a new convoy</Text>
        <Text style={styles.subtitle}>
          You'll be the leader. Pick a name your friends will recognize when they join.
        </Text>

        <Input
          label="Convoy name"
          value={name}
          onChangeText={setName}
          placeholder="Weekend crew, Night riders…"
          autoCapitalize="words"
          leftIcon={<Ionicons name="text-outline" size={18} color={colors.textSecondary} />}
        />

        <View style={styles.actions}>
          <Button title="Create convoy" onPress={onCreate} loading={submitting} />
        </View>
      </Card>

      <View style={styles.helpBox}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.helpText}>
          Friends can still join with the convoy ID until name-based search is added on the server.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(94,227,214,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  actions: {
    marginTop: spacing.md,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});
