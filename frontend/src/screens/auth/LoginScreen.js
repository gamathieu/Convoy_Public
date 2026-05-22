import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { isEmail, isNonEmpty } from '../../utils/validation';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!isEmail(email)) next.email = 'Enter a valid email.';
    if (!isNonEmpty(password)) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
    } catch (e) {
      Alert.alert('Sign in failed', e?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="car-sport" size={22} color="#06181B" />
        </View>
        <Text style={styles.brand}>Convoy</Text>
      </View>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>
        Sign in to manage your garage, plan drives and roll out with your convoy.
      </Text>

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@convoy.app"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={errors.password}
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
        />

        <Button title="Sign in" onPress={onSubmit} loading={submitting} />

        <Pressable style={styles.footerRow} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerText}>
            New here? <Text style={styles.footerLink}>Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing['3xl'],
    marginBottom: spacing['3xl'],
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    ...typography.h2,
    color: colors.textPrimary,
    letterSpacing: 0.5,
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
  form: {
    marginTop: spacing.md,
  },
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
