// Loads home dashboard lists in one coordinated refresh (stable ordering, single focus fetch).

import { useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import useApi from './useApi';
import { listUserConvoys } from '../api/convoys';
import { listUserDrives } from '../api/drives';
import { listVehicles } from '../api/vehicles';

const emptyConvoys = { convoys: [] };
const emptyDrives = { drives: [] };
const emptyGarage = { garage: [] };

function byDriveDate(a, b) {
  return new Date(a.date_time).getTime() - new Date(b.date_time).getTime();
}

export default function useDashboardData(userId) {
  const convoys = useApi(
    () => (userId ? listUserConvoys(userId) : Promise.resolve(emptyConvoys)),
    [userId],
    { immediate: false }
  );
  const drives = useApi(
    () => (userId ? listUserDrives(userId) : Promise.resolve(emptyDrives)),
    [userId],
    { immediate: false }
  );
  const vehicles = useApi(
    () => (userId ? listVehicles(userId) : Promise.resolve(emptyGarage)),
    [userId],
    { immediate: false }
  );

  const refreshAll = useCallback(() => {
    if (!userId) return Promise.resolve();
    return Promise.all([convoys.refresh(), drives.refresh(), vehicles.refresh()]);
  }, [userId, convoys.refresh, drives.refresh, vehicles.refresh]);

  useFocusEffect(
    useCallback(() => {
      refreshAll().catch(() => {});
    }, [refreshAll])
  );

  const upcomingDrives = useMemo(() => {
    const list = drives.data?.drives || [];
    return [...list].sort(byDriveDate).slice(0, 3);
  }, [drives.data]);

  const myConvoys = useMemo(() => {
    const list = convoys.data?.convoys || [];
    return list.slice(0, 3);
  }, [convoys.data]);

  const garage = vehicles.data?.garage || [];

  const refreshing = convoys.refreshing || drives.refreshing || vehicles.refreshing;

  return {
    convoys,
    drives,
    vehicles,
    upcomingDrives,
    myConvoys,
    garage,
    refreshing,
    refreshAll,
  };
}
