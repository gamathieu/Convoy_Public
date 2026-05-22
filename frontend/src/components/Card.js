import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { colors, radii, spacing, shadows } from '../styles/theme';

export default function Card({ children, onPress, style, elevated = true, padded = true }) {
  const content = (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        elevated && shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.xl,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
});
