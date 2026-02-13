import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { NEON_COLORS } from '../constants/neonColors';

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
      // Modern Tech Background (darker, richer)
      background: isDark ? '#0A0E17' : '#F8F9FA',
      card: isDark ? '#141824' : '#FFFFFF',
      cardElevated: isDark ? '#1A1F2E' : '#FFFFFF',
      cardHover: isDark ? '#1F2535' : '#F0F2F5',

      // Premium Text colors
      text: isDark ? '#FFFFFF' : '#1A1D29',
      textSecondary: isDark ? '#A0AEC0' : '#4A5568',
      textTertiary: isDark ? '#718096' : '#718096',
      textMuted: isDark ? '#4A5568' : '#A0AEC0',

      // Sleek Borders
      border: isDark ? '#2D3748' : '#E2E8F0',
      borderLight: isDark ? '#1F2735' : '#EDF2F7',
      borderAccent: isDark ? '#4A5568' : '#CBD5E0',

      // Modern Primary (Teal/Turquoise - travel app inspired)
      primary: '#14B8A6', // Teal-500
      primaryDark: '#0D9488', // Teal-600
      primaryLight: '#5EEAD4', // Teal-300
      primaryGlow: 'rgba(20, 184, 166, 0.3)',

      // Secondary accent (Cyan for variety)
      secondary: '#06B6D4', // Cyan-500
      secondaryLight: '#22D3EE',

      // Status colors (more vibrant)
      success: '#10B981',
      successGlow: 'rgba(16, 185, 129, 0.2)',
      warning: '#F59E0B',
      warningGlow: 'rgba(245, 158, 11, 0.2)',
      error: '#EF4444',
      errorGlow: 'rgba(239, 68, 68, 0.2)',
      info: '#3B82F6',

      // Enhanced Glassmorphism (Premium feel)
      glassBackground: isDark ? 'rgba(20, 24, 36, 0.92)' : 'rgba(255, 255, 255, 0.85)',
      glassBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
      glassHighlight: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',

      // Modern Overlays
      overlay: 'rgba(0, 0, 0, 0.6)',
      overlayLight: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
      overlayHeavy: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.4)',

      // Modern gradients (travel app inspired)
      gradientPrimary: isDark
        ? ['#14B8A6', '#0D9488']
        : ['#5EEAD4', '#14B8A6'],
      gradientTeal: ['#14B8A6', '#06B6D4'], // Teal to Cyan
      gradientSuccess: ['#10B981', '#059669'],
      gradientWarning: ['#F59E0B', '#D97706'],
      gradientSky: ['#0EA5E9', '#0284C7'], // Sky blue gradient
    },

    // Neon accent system
    neon: {
      blitzer: NEON_COLORS.blitzer,
      zivilstreife: NEON_COLORS.zivilstreife,
      accent: NEON_COLORS.accent,
      neutral: NEON_COLORS.neutral,
    },
    
    // Enhanced Glassmorphism styles
    glass: {
      background: isDark ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.7)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      blurIntensity: 100, // Increased from 80
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

    // Modern Typography System
    typography: {
      // Display (Hero text)
      displayLarge: {
        fontSize: 40,
        fontWeight: '700',
        lineHeight: 48,
        letterSpacing: -0.5,
      },
      display: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
        letterSpacing: -0.25,
      },

      // Headings
      h1: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
      },
      h2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
      },
      h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
      },
      h4: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 26,
      },

      // Body text
      bodyLarge: {
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 26,
      },
      body: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
      },
      bodySmall: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 20,
      },

      // Labels & Captions
      label: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        letterSpacing: 0.1,
      },
      caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 18,
      },
      overline: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 16,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      },

      // Special
      button: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.2,
      },
    },

    // Modern Spacing System (8px base)
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 40,
      xxxl: 48,
    },

    // Border Radius System
    radius: {
      none: 0,
      sm: 6,
      md: 12,
      lg: 16,
      xl: 24,
      full: 9999,
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
