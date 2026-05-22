import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '../styles/theme';

// tone: 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger'
export default function Tag({ label, tone = 'neutral', style }) {
  const palette = TONES[tone] || TONES.neutral;
  return (
    <View style={[styles.base, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <Text style={[styles.label, { color: palette.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const TONES = {
  neutral: {
    bg: colors.surfaceElevated,
    border: colors.border,
    text: colors.textSecondary,
  },
  primary: {
    bg: 'rgba(94,227,214,0.12)',
    border: 'rgba(94,227,214,0.35)',
    text: colors.primary,
  },
  accent: {
    bg: 'rgba(255,106,61,0.12)',
    border: 'rgba(255,106,61,0.35)',
    text: colors.accent,
  },
  success: {
    bg: 'rgba(74,222,128,0.12)',
    border: 'rgba(74,222,128,0.35)',
    text: colors.success,
  },
  warning: {
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    text: colors.warning,
  },
  danger: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.35)',
    text: colors.danger,
  },
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.caption,
  },
});
