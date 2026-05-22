import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radii, typography } from '../styles/theme';
import { initialsFromName } from '../utils/format';

export default function Avatar({ name, size = 44, style }) {
  const dim = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.wrap, dim, style]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />
      <Text style={[styles.label, { fontSize: size * 0.4 }]}>
        {initialsFromName(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    ...typography.button,
    color: '#06181B',
  },
});
