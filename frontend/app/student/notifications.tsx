import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bell, Calendar, Clock, FileText, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import * as Linking from 'expo-linking';

// Define the notification interface
interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  notificationId?: string;
  data?: {
    type?: string;
    fileUrl?: string;
    semester?: string;
    examType?: string;
    batchYear?: string;
    timestamp?: string;
    documentId?: string;
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Get current user ID from auth
  useEffect(() => {
    const getCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
      } else {
        // Try to get from AsyncStorage as fallback
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.error('No user ID found');
          Alert.alert('Error', 'Please log in again');
          router.push('/login');
        }
      }
    };

    getCurrentUser();
  }, []);

  // Fetch notifications when userId is available
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, filter]);

  // Fetch notifications from Firestore
  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Query the user-notifications collection
      const notificationsRef = collection(db, 'user-notifications');
      let q;
      
      // Apply filter
      if (filter === 'unread') {
        q = query(
          notificationsRef,
          where('userId', '==', userId),
          where('read', '==', false),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          notificationsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const notificationList: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notificationList.push({
          id: doc.id,
          title: data.title || '',
          body: data.body || '',
          read: data.read || false,
          createdAt: data.createdAt || '',
          notificationId: data.notificationId || '',
          data: data.data || {}
        });
      });
      
      setNotifications(notificationList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications().finally(() => {
      setRefreshing(false);
    });
  }, [userId, filter]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    
    try {
      // Update in Firestore
      await updateDoc(doc(db, 'user-notifications', notificationId), {
        read: true
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  // Handle notification action based on type
  const handleNotificationAction = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Different actions based on notification type
    if (notification.data?.type === 'semester_timetable' && notification.data.fileUrl) {
      try {
        // Open the timetable PDF
        await Linking.openURL(notification.data.fileUrl);
      } catch (error) {
        console.error('Error opening timetable:', error);
        Alert.alert('Error', 'Could not open the timetable file.');
      }
    } else if (notification.data?.type === 'exam_schedule' && notification.data.fileUrl) {
      try {
        // Open the exam schedule PDF
        await Linking.openURL(notification.data.fileUrl);
      } catch (error) {
        console.error('Error opening exam schedule:', error);
        Alert.alert('Error', 'Could not open the exam schedule file.');
      }
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'semester_timetable':
        return <Calendar size={20} color="#5BC0BE" />;
      case 'exam_schedule':
        return <FileText size={20} color="#9333EA" />;
      default:
        return <Bell size={20} color="#FFFFFF" />;
    }
  };

  // Go back to previous screen
  const handleGoBack = () => {
    router.replace('./dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={["#231942", "#5E548E", "#9F86C0"]}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilter(filter === 'all' ? 'unread' : 'all')}
        >
          <Text style={styles.filterButtonText}>
            {filter === 'all' ? 'All' : 'Unread'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Notifications List */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E0B1CB']}
            tintColor="#E0B1CB"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E0B1CB" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={60} color="#E0B1CB" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              {filter === 'all' 
                ? "You don't have any notifications at the moment. Check back later!"
                : "You don't have any unread notifications."}
            </Text>
          </View>
        ) : (
          <>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification
                ]}
                onPress={() => handleNotificationAction(notification)}
              >
                <View style={styles.notificationIconContainer}>
                  {getNotificationIcon(notification.data?.type || '')}
                </View>
                
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  
                  <Text style={styles.notificationBody}>{notification.body}</Text>
                  
                  <View style={styles.notificationMeta}>
                    <Clock size={14} color="#9BA1D0" style={styles.metaIcon} />
                    <Text style={styles.notificationTime}>
                      {formatDate(notification.createdAt)}
                    </Text>
                    
                    {notification.data?.fileUrl && (
                      <View style={styles.linkButton}>
                        <ExternalLink size={14} color="#E0B1CB" />
                        <Text style={styles.linkButtonText}>View</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#231942',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(94, 84, 142, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(224, 177, 203, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(224, 177, 203, 0.3)',
  },
  filterButtonText: {
    color: '#E0B1CB',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  notificationItem: {
    marginBottom: 14,
    backgroundColor: 'rgba(94, 84, 142, 0.2)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadNotification: {
    borderLeftColor: '#E0B1CB',
    backgroundColor: 'rgba(94, 84, 142, 0.3)',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(94, 84, 142, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0B1CB',
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
    lineHeight: 20,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9BA1D0',
    flex: 1,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(224, 177, 203, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  linkButtonText: {
    fontSize: 12,
    color: '#E0B1CB',
    marginLeft: 4,
    fontWeight: '500',
  },
});