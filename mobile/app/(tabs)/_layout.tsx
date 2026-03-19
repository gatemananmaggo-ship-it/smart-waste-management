import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Map, List } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Map size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'List View',
          tabBarIcon: ({ color }) => <List size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
