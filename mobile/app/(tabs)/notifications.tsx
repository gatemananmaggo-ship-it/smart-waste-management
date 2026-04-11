import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import axios from 'axios';
import CONFIG from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCircle, Circle, Trash2, Clock, AlertTriangle } from 'lucide-react-native';

interface Notification {
  _id: string;
  binId: string;
  message: string;
  status: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, logout } = useAuth();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await axios.get(CONFIG.API_NOTIFICATIONS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (err: any) {
      console.error("Error fetching notifications:", err.message);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`${CONFIG.API_NOTIFICATIONS}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`${CONFIG.API_NOTIFICATIONS}/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={[styles.card, !item.isRead && styles.unreadCard]}>
      <View style={styles.cardIcon}>
        {item.status === 'Full' || item.status === 'High Level' ? (
          <AlertTriangle color={item.isRead ? "#94a3b8" : "#ef4444"} size={24} />
        ) : (
          <Bell color={item.isRead ? "#94a3b8" : "#38bdf8"} size={24} />
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.statusText, !item.isRead && styles.unreadText]}>
            {item.status}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#94a3b8" />
            <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <Text style={[styles.message, !item.isRead && styles.unreadMessage]}>
          {item.message}
        </Text>
        {!item.isRead && (
          <TouchableOpacity 
            style={styles.markReadButton} 
            onPress={() => markAsRead(item._id)}
          >
            <CheckCircle size={14} color="#38bdf8" />
            <Text style={styles.markReadText}>Mark as read</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.some(n => !n.isRead) && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchNotifications();
          }} colors={['#38bdf8']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color="#e2e8f0" />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  markAllText: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
  },
  cardIcon: {
    marginRight: 16,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadText: {
    color: '#0369a1',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  message: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  unreadMessage: {
    color: '#1e293b',
    fontWeight: '500',
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  markReadText: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '600',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  }
});
