import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './MainTabs';
import ConvoyDetailScreen from '../screens/convoys/ConvoyDetailScreen';
import CreateConvoyScreen from '../screens/convoys/CreateConvoyScreen';
import DriveDetailScreen from '../screens/drives/DriveDetailScreen';
import CreateDriveScreen from '../screens/drives/CreateDriveScreen';
import VehicleFormScreen from '../screens/vehicles/VehicleFormScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B0F14' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="ConvoyDetail" component={ConvoyDetailScreen} />
      <Stack.Screen name="CreateConvoy" component={CreateConvoyScreen} />
      <Stack.Screen name="DriveDetail" component={DriveDetailScreen} />
      <Stack.Screen name="CreateDrive" component={CreateDriveScreen} />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} />
    </Stack.Navigator>
  );
}
