import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';

import HomeScreen from '../screens/home/HomeScreen';
import ConvoysScreen from '../screens/convoys/ConvoysScreen';
import DrivesScreen from '../screens/drives/DrivesScreen';
import VehiclesScreen from '../screens/vehicles/VehiclesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Convoys: { active: 'people', inactive: 'people-outline' },
  Drives: { active: 'navigate', inactive: 'navigate-outline' },
  Garage: { active: 'car-sport', inactive: 'car-sport-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
        tabBarIcon: ({ focused, color, size }) => {
          const set = ICONS[route.name] || ICONS.Home;
          return (
            <Ionicons
              name={focused ? set.active : set.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Convoys" component={ConvoysScreen} />
      <Tab.Screen name="Drives" component={DrivesScreen} />
      <Tab.Screen name="Garage" component={VehiclesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
