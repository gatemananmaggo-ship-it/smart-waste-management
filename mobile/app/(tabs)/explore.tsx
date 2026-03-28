import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Platform, RefreshControl, TouchableOpacity, Modal, Switch } from 'react-native';
import axios from 'axios';
import CONFIG from '../../constants/Config';
import { Trash2, AlertTriangle, CheckCircle, Scan, Navigation, LogOut, User, Phone } from 'lucide-react-native';
import { Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useHub } from '../../context/HubContext';
import { useAuth } from '../../context/AuthContext';
import { TextInput } from 'react-native';

interface Bin {
  _id?: string;
  hardwareId: string;
  location?: { latitude: number; longitude: number };
  fillLevel: number;
  status: string;
}

const API_URL = CONFIG.API_BINS;

export default function ListViewScreen() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { hubId, setHubId } = useHub();
  const { user, logout, token, updateUser } = useAuth();
  const [tempHubId, setTempHubId] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable !== false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  const fetchBins = async () => {
    if (!hubId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/hub/${hubId}`);
      setBins(response.data);
    } catch (err) {
      console.error("Error fetching bins:", err);
      setError('Could not connect to this Hub.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBins();
    const intervalId = setInterval(() => {
      if (hubId) fetchBins();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [hubId]);

  const handleConnect = () => {
    if (tempHubId.length === 8) {
      setHubId(tempHubId.toUpperCase());
    } else {
      Alert.alert("Invalid ID", "Please enter a valid 8-digit Hub ID.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout }
      ]
    );
  };

  const handleNavigate = (bin: Bin) => {
    if (!bin.location) {
        Alert.alert("Location Error", "This bin does not have location data.");
        return;
    }
    const { latitude, longitude } = bin.location;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = bin.hardwareId;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) {
        Linking.openURL(url);
    }
  };

  const handleUpdatePhone = async () => {
    if (!newPhone || newPhone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number.");
      return;
    }
    setIsUpdatingPhone(true);
    try {
      await axios.put(`${CONFIG.API_BASE_URL}/profile/update-phone`, 
        { phone: newPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await updateUser({ phone: newPhone });
      setShowPhoneModal(false);
      Alert.alert("Success", "Phone number updated successfully!");
    } catch (err: any) {
      console.error("Error updating phone:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update phone number.");
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const handleToggleAvailability = async (value: boolean) => {
    setIsUpdatingAvailability(true);
    try {
      await axios.put(`${CONFIG.API_BASE_URL}/profile/update-availability`, 
        { isAvailable: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsAvailable(value);
      await updateUser({ isAvailable: value });
      Alert.alert("Success", `SMS Alerts ${value ? 'enabled' : 'disabled'} successfully!`);
    } catch (err: any) {
      console.error("Error updating availability:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update availability.");
      setIsAvailable(!value); // Revert state on error
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const onRefresh = () => {
    if (!hubId) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    fetchBins();
  };

  const renderItem = ({ item }: { item: Bin }) => {
    const isFull = item.fillLevel >= 80;

    return (
      <View style={[styles.card, isFull ? styles.cardFull : styles.cardNormal]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Trash2 color={isFull ? '#ef4444' : '#22c55e'} size={24} />
            <Text style={styles.hardwareId}>{item.hardwareId}</Text>
          </View>
          {isFull ? (
            <View style={styles.statusBadgeFull}>
              <AlertTriangle color="#ef4444" size={16} />
              <Text style={styles.statusTextFull}>Needs Cleanup</Text>
            </View>
          ) : (
            <View style={styles.statusBadgeNormal}>
              <CheckCircle color="#22c55e" size={16} />
              <Text style={styles.statusTextNormal}>Healthy</Text>
            </View>
          )}
        </View>

        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Current Level:</Text>
          <Text style={[styles.levelValue, { color: isFull ? '#ef4444' : '#22c55e' }]}>
            {item.fillLevel}%
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${item.fillLevel}%`,
                backgroundColor: isFull ? '#ef4444' : (item.fillLevel >= 50 ? '#f59e0b' : '#22c55e')
              }
            ]}
          />
        </View>

        {isFull && (
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => handleNavigate(item)}
          >
            <Navigation color="#fff" size={18} />
            <Text style={styles.navButtonText}>Navigate to Bin</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && bins.length === 0 && hubId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Loading bins...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfoRow}>
          <View style={styles.userBadge}>
            <User size={14} color="#38bdf8" />
            <Text style={styles.userNameText}>{user?.username}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20, borderWidth: 1, borderColor: '#e0f2fe' }}>
              <Text style={{ fontSize: 10, color: '#0369a1', marginRight: 4, fontWeight: '600' }}>SMS</Text>
              <Switch
                value={isAvailable}
                onValueChange={handleToggleAvailability}
                disabled={isUpdatingAvailability}
                style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                trackColor={{ false: '#cbd5e1', true: '#34d399' }}
                thumbColor={isAvailable ? '#fff' : '#fff'}
              />
            </View>
            <TouchableOpacity onPress={() => setShowPhoneModal(true)} style={styles.phoneButton}>
              <Phone size={18} color="#38bdf8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerTitle}>Bin Status</Text>
        {hubId ? (
          <View style={styles.hubInfoRow}>
             <Text style={styles.headerSubtitle}>{bins.filter(b => b.fillLevel >= 80).length} bins need attention</Text>
             <TouchableOpacity onPress={() => setHubId(null)}>
                <Text style={styles.changeHubText}>Switch Hub</Text>
             </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.headerSubtitle}>Connect to a hub to see status</Text>
        )}
      </View>

      {!hubId ? (
        <View style={styles.center}>
          <View style={styles.hubContainer}>
            <Text style={styles.hubTitle}>Connect to Hub</Text>
            <Text style={styles.hubSub}>Enter the 8-digit Hub ID to see your bins</Text>
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
      ) : (
        <>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <FlatList
            data={bins.sort((a, b) => b.fillLevel - a.fillLevel)}
            keyExtractor={(item) => item._id || item.hardwareId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#38bdf8']} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No bins tracked yet.</Text>
              </View>
            }
          />

          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={() => router.push('/scan')}
          >
            <Scan color="#fff" size={24} />
            <Text style={styles.scanButtonText}>Scan QR</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Phone Update Modal */}
      <Modal
        visible={showPhoneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Phone Number</Text>
            <Text style={styles.modalSub}>Receive SMS alerts when bins are full</Text>
            
            <View style={styles.modalInputContainer}>
              <Phone size={20} color="#94a3b8" style={{ marginRight: 12 }} />
              <TextInput
                style={styles.modalInput}
                placeholder="9876543210"
                placeholderTextColor="#94a3b8"
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowPhoneModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleUpdatePhone}
                disabled={isUpdatingPhone}
              >
                {isUpdatingPhone ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
    fontWeight: '500',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    gap: 6,
  },
  userNameText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  phoneButton: {
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  hubInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  changeHubText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
  },
  cardNormal: {
    borderColor: '#e5e7eb',
  },
  cardFull: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hardwareId: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1f2937',
  },
  statusBadgeNormal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextNormal: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statusTextFull: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  levelValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 16,
  },
  scanButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  navButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hubContainer: {
    padding: 30,
    width: '90%',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '85%',
    padding: 24,
    borderRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#38bdf8',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
  }
});
