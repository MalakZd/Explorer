import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  theme: {
    bg: string;
    glass: string;
    text: string;
    sub: string;
    accent: string;
    danger: string;
    cardBg: string;
    inputBg: string;
    border: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    // Charger le mode depuis AsyncStorage au démarrage
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('darkMode');
        if (savedMode !== null) {
          setDarkModeState(JSON.parse(savedMode));
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    AsyncStorage.setItem('darkMode', JSON.stringify(value));
  };

  const theme = {
    bg: darkMode ? '#0E0F14' : '#E8ECF4',
    glass: darkMode ? 'rgba(30,32,40,0.85)' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#1A1A2E',
    sub: darkMode ? '#A1A7B3' : '#7A7A7A',
    accent: '#246BFD',
    danger: '#FF4B4B',
    cardBg: darkMode ? 'rgba(30,32,40,0.6)' : '#FFFFFF',
    inputBg: darkMode ? 'rgba(40,42,50,0.8)' : '#F7F8F9',
    border: darkMode ? 'rgba(255,255,255,0.1)' : '#E8ECF4',
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
