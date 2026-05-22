import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { createDrive } from '../../api/drives';
import { getConvoy } from '../../api/convoys';
import useApi from '../../hooks/useApi';
import { colors, radii, spacing, typography } from '../../styles/theme';
import { isNonEmpty } from '../../utils/validation';
import { convoyLabel } from '../../utils/display';

export default function CreateDriveScreen({ route, navigation }) {
  const { convoyId } = route.params;
  const { user } = useAuth();
  const convoyMeta = useApi(() => getConvoy(convoyId), [convoyId], { immediate: false });

  useFocusEffect(
    useCallback(() => {
      convoyMeta.refresh().catch(() => {});
    }, [convoyId])
  );

  const [name, setName] = useState('');
  const [startingLocation, setStartingLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!isNonEmpty(name)) next.name = 'Name your drive.';
    if (!isNonEmpty(startingLocation)) next.starting_location = 'Required.';
    if (!isNonEmpty(destination)) next.destination = 'Required.';
    if (!isNonEmpty(dateTime)) next.date_time = 'Required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await createDrive(convoyId, {
        name: name.trim(),
        starting_location: startingLocation.trim(),
        destination: destination.trim(),
        date_time: dateTime.trim(),
        creator_id: user.id,
      });
      const newId = res?.drive_id;
      if (newId) {
        navigation.replace('DriveDetail', { driveId: newId });
      } else {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Could not create drive', e?.message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <Header
        title="Plan a drive"
        subtitle={convoyLabel(convoyMeta.data?.convoy ?? { id: convoyId })}
        showBack
      />

      <View style={styles.intro}>
        <View style={styles.iconWrap}>
          <Ionicons name="navigate" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.introTitle}>Set the route</Text>
          <Text style={styles.introSub}>
            Pick a name, a route, and a time. Members of your convoy can then join.
          </Text>
        </View>
      </View>

      <Input
        label="Drive name"
        value={name}
        onChangeText={setName}
        placeholder="Sunday canyon run"
        error={errors.name}
        autoCapitalize="sentences"
      />
      <Input
        label="Starting location"
        value={startingLocation}
        onChangeText={setStartingLocation}
        placeholder="Montreal, QC"
        error={errors.starting_location}
        autoCapitalize="words"
        leftIcon={<Ionicons name="flag-outline" size={18} color={colors.textSecondary} />}
      />
      <Input
        label="Destination"
        value={destination}
        onChangeText={setDestination}
        placeholder="Mont-Tremblant, QC"
        error={errors.destination}
        autoCapitalize="words"
        leftIcon={<Ionicons name="location-outline" size={18} color={colors.textSecondary} />}
      />
      <Input
        label="When"
        value={dateTime}
        onChangeText={setDateTime}
        placeholder="2026-06-12 09:00"
        helperText="Format: YYYY-MM-DD HH:MM"
        error={errors.date_time}
        leftIcon={<Ionicons name="time-outline" size={18} color={colors.textSecondary} />}
      />

      <Button title="Create drive" onPress={onSubmit} loading={submitting} />
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
