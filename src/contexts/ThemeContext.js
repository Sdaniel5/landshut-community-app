import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    isDark,
    colors: {
      // Background colors
      background: isDark ? '#121212' : '#FFFFFF',
      card: isDark ? '#1E1E1E' : '#F5F5F5',
      cardElevated: isDark ? '#2A2A2A' : '#FFFFFF',
      
      // Text colors
      text: isDark ? '#FFFFFF' : '#000000',
      textSecondary: isDark ? '#B0B0B0' : '#666666',
      textTertiary: isDark ? '#888888' : '#999999',
      
      // Border colors
      border: isDark ? '#272727' : '#E0E0E0',
      borderLight: isDark ? '#1A1A1A' : '#F0F0F0',
      
      // Primary colors
      primary: '#2196F3',
      primaryDark: '#1976D2',
      primaryLight: '#64B5F6',
      
      // Status colors
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      
      // Glassmorphism
      glassBackground: isDark ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      glassBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      
      // Overlay
      overlay: 'rgba(0, 0, 0, 0.5)',
      overlayLight: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    
    // Glassmorphism styles
    glass: {
      background: isDark ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
    },
    
    // Shadow styles
    shadow: {
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    
    shadowLight: {
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
