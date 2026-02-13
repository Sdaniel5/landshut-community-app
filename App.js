import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import FullMapScreen from './src/screens/FullMapScreen';
import FeedScreen from './src/screens/FeedScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FAQScreen from './src/screens/FAQScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';

import { setupNotifications } from './src/lib/notifications';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'FAQ') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Einstellungen') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Blitzer', headerShown: false }}
      />
      <Tab.Screen 
        name="Community" 
        component={FeedScreen}
        options={{ title: 'Community' }}
      />
      <Tab.Screen 
        name="FAQ" 
        component={FAQScreen}
        options={{ title: 'FAQ', headerShown: false }}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    setupNotifications();
  }, []);

  const navTheme = {
    dark: isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: 'modal',
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen 
          name="FullMap" 
          component={FullMapScreen}
          options={{
            headerShown: true,
            title: 'Karte',
            headerStyle: {
              backgroundColor: theme.colors.card,
            },
            headerTintColor: theme.colors.text,
          }}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
