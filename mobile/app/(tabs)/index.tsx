import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import CONFIG from '../../constants/Config';
import { RefreshCw } from 'lucide-react-native';
import { TouchableOpacity, Linking, Alert } from 'react-native';
import { Polyline } from 'react-native-maps';
import { Navigation } from 'lucide-react-native';
import { useHub } from '../../context/HubContext';

interface Bin {
  _id?: string;
  hardwareId: string;
  location?: { latitude: number; longitude: number };
  fillLevel: number;
  status: string;
}

const API_URL = CONFIG.API_BINS;

// Add TextInput import
import { TextInput } from 'react-native';

export default function MapScreen() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [routeCoords, setRouteCoords] = useState<{latitude: number, longitude: number}[]>([]);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const { hubId, setHubId } = useHub();
  const [tempHubId, setTempHubId] = useState('');

  const fetchBins = async (targetHubId?: string) => {
    const activeHubId = targetHubId || hubId;
    if (!activeHubId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/hub/${activeHubId}`);
      setBins(response.data);
    } catch (err) {
      console.error("Error fetching bins:", err);
      setError('Could not connect to this Hub. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        setError('Location permission denied. Map might not show your position.');
        return;
      }
      
      // Get initial location
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Watch for location updates
      const locationWatcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
        (newLoc) => setUserLocation(newLoc)
      );

      // Start polling for bins if hubId is set
      const intervalId = setInterval(() => {
        if (hubId) fetchBins();
      }, 10000); // Poll every 10s

      if (hubId) fetchBins();
      
      return () => {
        locationWatcher.remove();
        clearInterval(intervalId);
      };
    })();
  }, [hubId]);

  const handleConnect = () => {
    if (tempHubId.length === 8) {
      setHubId(tempHubId.toUpperCase());
    } else {
      Alert.alert("Invalid ID", "Please enter a valid 8-digit Hub ID.");
    }
  };

  const handleNavigate = async (bin: Bin) => {
    if (!userLocation || !bin.location) {
        Alert.alert("Location Error", "Could not determine your location or bin location.");
        return;
    }

    const { latitude, longitude } = bin.location;
    
    // 1. Show route on map using OSRM
    try {
        const url = `https://router.project-osrm.org/route/v1/walking/${userLocation.coords.longitude},${userLocation.coords.latitude};${longitude},${latitude}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((coord: any) => ({
                latitude: coord[1],
                longitude: coord[0]
            }));
            setRouteCoords(coords);
            setSelectedBin(bin);
        }
    } catch (err) {
        console.error("Pathfinding error:", err);
        // Fallback: Just draw a straight line if OSRM fails
        setRouteCoords([
            { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
            { latitude, longitude }
        ]);
    }

    // 2. Open native map app
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = bin.hardwareId;
    const navUrl = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (navUrl) {
        Linking.openURL(navUrl);
    }
  };

  const getMarkerColor = (level: number) => {
    if (level >= 80) return 'red';
    if (level >= 50) return 'orange';
    return 'green';
  };

  // Default region (Center somewhere generic or based on first bin)
  const initialRegion = {
    latitude: 28.7041,
    longitude: 77.1025,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (!hubId) {
    return (
      <View style={styles.center}>
        <View style={styles.hubContainer}>
          <Text style={styles.hubTitle}>Connect to Hub</Text>
          <Text style={styles.hubSub}>Enter your 8-digit Hub ID to see your bins</Text>
          <TextInput
            style={styles.hubInput}
            placeholder="A7B9C2D4"
            placeholderTextColor="#94a3b8"
            value={tempHubId}
            onChangeText={setTempHubId}
            maxLength={8}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Text style={styles.connectButtonText}>Connect Hub</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && bins.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading bin locations...</Text>
        </View>
      ) : (
        <MapView 
          style={styles.map} 
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {bins.map((bin, index) => {
            const lat = Number(bin.location?.latitude);
            const lng = Number(bin.location?.longitude);
            const hasLocation = !isNaN(lat) && !isNaN(lng);
            
            if (index === 0) console.log(`Rendering bin: ${bin.hardwareId}, location:`, { lat, lng });
            
            return hasLocation ? (
              <Marker
                key={bin._id || `bin-${index}`}
                coordinate={{ latitude: lat, longitude: lng }}
                pinColor={getMarkerColor(bin.fillLevel)}
                title={bin.hardwareId}
                description={`Level: ${bin.fillLevel}%`}
                tracksViewChanges={Platform.OS === 'ios' ? true : undefined}
              >
                <Callout onPress={() => handleNavigate(bin)}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{bin.hardwareId}</Text>
                    <Text>Level: {bin.fillLevel}%</Text>
                    <Text style={{ color: bin.fillLevel >= 80 ? 'red' : 'green', marginBottom: 8 }}>
                      Status: {bin.fillLevel >= 80 ? 'Needs Cleanup' : 'OK'}
                    </Text>
                    {bin.fillLevel >= 80 && (
                      <View style={styles.navButton}>
                        <Navigation color="#fff" size={16} />
                        <Text style={styles.navButtonText}>Navigate</Text>
                      </View>
                    )}
                  </View>
                </Callout>
              </Marker>
            ) : null;
          })}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#007AFF"
              strokeWidth={4}
            />
          )}
        </MapView>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={() => fetchBins()}>
        <RefreshCw color="#fff" size={20} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.disconnectButton} onPress={() => setHubId(null)}>
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>SWITCH HUB</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callout: {
    padding: 10,
    minWidth: 120,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorBanner: {
    position: 'absolute',
    top: 50, // Avoid safe area
    left: 10,
    right: 10,
    backgroundColor: '#ffcccc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#cc0000',
    textAlign: 'center',
    fontSize: 12,
  },
  navButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 4,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hubContainer: {
    padding: 30,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  hubTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  hubSub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  hubInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  connectButton: {
    backgroundColor: '#007AFF',
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  }
});
