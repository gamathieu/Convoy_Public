import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../styles/theme';
import { isEmail, isNonEmpty } from '../../utils/validation';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startingLocation, setStartingLocation] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!isNonEmpty(name)) next.name = 'Name is required.';
    if (!isEmail(email)) next.email = 'Enter a valid email.';
    if (!password || password.length < 6) next.password = 'At least 6 characters.';
    if (!isNonEmpty(startingLocation)) next.starting_location = 'Required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        starting_location: startingLocation.trim(),
      });
    } catch (e) {
      Alert.alert('Could not create account', e?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <Pressable style={styles.backRow} onPress={() => navigation.goBack()} hitSlop={10}>
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        Join the convoy. Build your garage, plan drives, and connect with riders near you.
      </Text>

      <View style={styles.form}>
        <Input
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Alex Carter"
          autoCapitalize="words"
          error={errors.name}
          leftIcon={<Ionicons name="person-outline" size={18} color={colors.textSecondary} />}
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@convoy.app"
          keyboardType="email-address"
          error={errors.email}
          leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Choose a strong password"
          secureTextEntry
          error={errors.password}
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
        />
        <Input
          label="Starting location"
          value={startingLocation}
          onChangeText={setStartingLocation}
          placeholder="Montreal, QC"
          autoCapitalize="words"
          error={errors.starting_location}
          leftIcon={<Ionicons name="location-outline" size={18} color={colors.textSecondary} />}
        />

        <Button title="Create account" onPress={onSubmit} loading={submitting} />

        <Pressable style={styles.footerRow} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>
            Already a member? <Text style={styles.footerLink}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  backText: {
    ...typography.bodySm,
    color: colors.textPrimary,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
    lineHeight: 22,
  },
  form: {},
  footerRow: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
