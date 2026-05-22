import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

import { colors, spacing, typography } from '../styles/theme';

export default function LoadingView({ label, fullScreen = false }) {
  return (
    <View style={[styles.wrap, fullScreen && styles.fullScreen]}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  label: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
