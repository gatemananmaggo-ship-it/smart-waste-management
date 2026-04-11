import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import CONFIG from '../constants/Config';
import axios from 'axios';

/**
 * Custom hook to track worker's location and report it to the backend.
 * Only runs if the user is authenticated and has the 'worker' role.
 */
export const useLocationTracker = () => {
  const { user, token, logout } = useAuth();
  const lastSentLocation = useRef<{ latitude: number, longitude: number } | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    // Only track location for workers
    if (!user || user.role !== 'worker' || !token) {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      return;
    }

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission denied');
          return;
        }

        // Watch for location changes
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 300000, // 5 minutes
            distanceInterval: 500, // 500 meters
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            sendLocationUpdate(latitude, longitude);
          }
        );
      } catch (error) {
        console.error('Error starting location tracking:', error);
      }
    };

    const sendLocationUpdate = async (latitude: number, longitude: number) => {
      try {
        // Simple check to avoid redundant updates if distance is very minimal
        // (already handled by distanceInterval, but extra safety)
        if (lastSentLocation.current) {
          const dLat = Math.abs(lastSentLocation.current.latitude - latitude);
          const dLon = Math.abs(lastSentLocation.current.longitude - longitude);
          if (dLat < 0.0001 && dLon < 0.0001) return;
        }

        console.log(`[LocationTracker] Sending update: ${latitude}, ${longitude}`);
        
        await axios.patch(`${CONFIG.API_BASE_URL}/workers/location`, 
          { latitude, longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        lastSentLocation.current = { latitude, longitude };
      } catch (error: any) {
        console.error('Failed to report location to server:', error.message);
        if (error.response?.status === 401) {
          logout();
        }
      }
    };

    startTracking();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [user, token]);
};
