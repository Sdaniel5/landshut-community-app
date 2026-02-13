import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';

// Revolutionary Spatial Layout
import SpatialLayout from './src/components/templates/SpatialLayout';

// Screens (modals only)
import AuthScreen from './src/screens/AuthScreen';

import { setupNotifications } from './src/lib/notifications';

const Stack = createStackNavigator();

// Removed: TabNavigator replaced by SpatialLayout with Bubble navigation

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
        {/* Revolutionary Spatial Bubble Navigation */}
        <Stack.Screen name="Main" component={SpatialLayout} />

        {/* Auth Modal */}
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
