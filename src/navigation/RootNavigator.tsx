import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import { getColors, scaledFont, baseFontSizes } from '@/theme/theme';

import { StartScreen } from '@/screens/StartScreen';
import { ContactsScreen } from '@/screens/ContactsScreen';
import { ContactEditScreen } from '@/screens/ContactEditScreen';
import { AlarmScreen } from '@/screens/AlarmScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { TemplatesListScreen } from '@/screens/TemplatesListScreen';
import { TemplateEditScreen } from '@/screens/TemplateEditScreen';

export type RootStackParamList = {
  Tabs: undefined;
  ContactEdit: { contactId?: string };
  TemplatesList: undefined;
  TemplateEdit: { templateId?: string };
};

export type TabParamList = {
  Start: undefined;
  Kontakty: undefined;
  Alarm: undefined;
  Ustawienia: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  const { highContrast, fontScale } = useSettingsStore((s) => s.settings);
  const c = getColors(highContrast);

  const tabLabel = (label: string, focused: boolean) => (
    <Text
      style={{
        fontSize: scaledFont(baseFontSizes.small, fontScale),
        fontWeight: focused ? '700' : '500',
        color: focused ? c.primary : c.textSecondary,
      }}
    >
      {label}
    </Text>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.text,
        headerTitleStyle: {
          fontSize: scaledFont(baseFontSizes.title, fontScale),
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: c.background,
          borderTopColor: c.border,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Start"
        component={StartScreen}
        options={{ tabBarLabel: ({ focused }) => tabLabel('Start', focused) }}
      />
      <Tab.Screen
        name="Kontakty"
        component={ContactsScreen}
        options={{ tabBarLabel: ({ focused }) => tabLabel('Kontakty', focused) }}
      />
      <Tab.Screen
        name="Alarm"
        component={AlarmScreen}
        options={{ tabBarLabel: ({ focused }) => tabLabel('Alarm', focused) }}
      />
      <Tab.Screen
        name="Ustawienia"
        component={SettingsScreen}
        options={{ tabBarLabel: ({ focused }) => tabLabel('Ustawienia', focused) }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const highContrast = useSettingsStore((s) => s.settings.highContrast);
  const c = getColors(highContrast);

  const navTheme = {
    ...(highContrast ? DarkTheme : DefaultTheme),
    colors: {
      ...(highContrast ? DarkTheme.colors : DefaultTheme.colors),
      background: c.background,
      card: c.background,
      text: c.text,
      border: c.border,
      primary: c.primary,
    },
  };

  const headerStyle = {
    backgroundColor: c.background,
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle,
          headerTintColor: c.text,
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContactEdit"
          component={ContactEditScreen}
          options={({ route }) => ({
            title: route.params?.contactId ? 'Edytuj kontakt' : 'Dodaj kontakt',
          })}
        />
        <Stack.Screen
          name="TemplatesList"
          component={TemplatesListScreen}
          options={{ title: 'Szablony alarmów' }}
        />
        <Stack.Screen
          name="TemplateEdit"
          component={TemplateEditScreen}
          options={({ route }) => ({
            title: route.params?.templateId ? 'Edytuj szablon' : 'Dodaj szablon',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}