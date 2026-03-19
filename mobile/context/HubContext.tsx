import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HubContextType {
  hubId: string | null;
  setHubId: (id: string | null) => Promise<void>;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export function HubProvider({ children }: { children: React.ReactNode }) {
  const [hubId, setHubIdState] = useState<string | null>(null);

  useEffect(() => {
    // Load stored hubId on app start
    const loadHubId = async () => {
      try {
        const storedHubId = await AsyncStorage.getItem('hubId');
        if (storedHubId) {
          setHubIdState(storedHubId);
        }
      } catch (e) {
        console.error('Failed to load hubId', e);
      }
    };
    loadHubId();
  }, []);

  const setHubId = async (id: string | null) => {
    try {
      if (id) {
        await AsyncStorage.setItem('hubId', id);
      } else {
        await AsyncStorage.removeItem('hubId');
      }
      setHubIdState(id);
    } catch (e) {
      console.error('Failed to save hubId', e);
    }
  };

  return (
    <HubContext.Provider value={{ hubId, setHubId }}>
      {children}
    </HubContext.Provider>
  );
}

export function useHub() {
  const context = useContext(HubContext);
  if (context === undefined) {
    throw new Error('useHub must be used within a HubProvider');
  }
  return context;
}
