import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { addVehicle, updateVehicle } from '../../api/vehicles';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { isNonEmpty, isYear } from '../../utils/validation';

export default function VehicleFormScreen({ route, navigation }) {
  const { user } = useAuth();
  const mode = route.params?.mode === 'edit' ? 'edit' : 'create';
  const vehicle = route.params?.vehicle || null;

  const [make, setMake] = useState(vehicle?.make || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle ? String(vehicle.year) : '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!isNonEmpty(make)) next.make = 'Required.';
    if (!isNonEmpty(model)) next.model = 'Required.';
    if (!isYear(year)) next.year = 'Year must be 4 digits.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'edit') {
        await updateVehicle(vehicle.id, { make: make.trim(), model: model.trim(), year });
      } else {
        await addVehicle(user.id, { make: make.trim(), model: model.trim(), year });
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e?.message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <Header title={mode === 'edit' ? 'Edit vehicle' : 'Add vehicle'} showBack />

      <View style={styles.intro}>
        <View style={styles.iconWrap}>
          <Ionicons name="car-sport" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.introTitle}>
            {mode === 'edit' ? 'Update your ride' : 'Add a new ride'}
          </Text>
          <Text style={styles.introSub}>
            Vehicles in your garage will show up next to your profile.
          </Text>
        </View>
      </View>

      <Input
        label="Make"
        value={make}
        onChangeText={setMake}
        placeholder="Tesla"
        autoCapitalize="words"
        error={errors.make}
      />
      <Input
        label="Model"
        value={model}
        onChangeText={setModel}
        placeholder="Model S"
        autoCapitalize="words"
        error={errors.model}
      />
      <Input
        label="Year"
        value={year}
        onChangeText={setYear}
        placeholder="2024"
        keyboardType="number-pad"
        error={errors.year}
      />

      <Button
        title={mode === 'edit' ? 'Save changes' : 'Add to garage'}
        onPress={onSubmit}
        loading={submitting}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(94,227,214,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: { ...typography.h3, color: colors.textPrimary },
  introSub: { ...typography.bodySm, color: colors.textSecondary, marginTop: 2 },
});
