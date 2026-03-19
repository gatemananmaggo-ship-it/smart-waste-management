import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../constants/Config';

interface User {
  id: string;
  username: string;
  email: string;
  hubId?: string;
  area?: string;
  city?: string;
  state?: string;
  place?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_BASE_URL = CONFIG.API_BASE_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load stored token on app start
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    try {
      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (e) {
      console.error('Failed to save auth data', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('hubId'); // Also clear hub on logout
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to clear auth data', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
