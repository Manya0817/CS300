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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bell, Calendar, Clock, FileText, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, orderBy, updateDoc, doc, deleteDoc, FieldValue, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import * as Linking from 'expo-linking';

const { width } = Dimensions.get('window');

// Define the notification interface
interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data: {
    type: string;
    fileUrl?: string;
    semester?: string;
    examType?: string;
    batchYear?: string;
    timestamp: string;
    documentId?: string;
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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
  }, [userId]);

  // Fetch notifications from Firestore
  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Query the user-notifications collection
      const notificationsRef = collection(db, 'user-notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
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
  }, [userId]);

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
      
      // We should also update the main notification document to track who has read it
      // This would typically involve a server function, but for simplicity we'll do it directly here
      const userNotificationsRef = collection(db, 'user-notifications');
      const q = query(
        userNotificationsRef,
        where('id', '==', notificationId)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const mainNotificationId = querySnapshot.docs[0].data().notificationId;
        if (mainNotificationId) {
          const mainNotificationRef = doc(db, 'notifications', mainNotificationId);
          await updateDoc(mainNotificationRef, {
            readBy: arrayUnion(userId)
          });
        }
      }
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

  // Delete a notification
  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'user-notifications', id));
      
      // Update local state to remove deleted notification
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      Alert.alert('Success', 'Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  // Handle long press on notification to show delete option
  const handleLongPress = (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(id) }
      ]
    );
  };

  // Go back to previous screen
  const handleGoBack = () => {
    router.back();
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

  // Render notification item
  const renderNotificationItem = (notification: Notification) => {
    const isUnread = !notification.read;
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          isUnread && styles.unreadNotification
        ]}
        onPress={() => handleNotificationAction(notification)}
        onLongPress={() => handleLongPress(notification.id)}
        delayLongPress={500}
      >
        <View style={styles.notificationIconContainer}>
          {getNotificationIcon(notification.data?.type || '')}
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          
          <Text style={styles.notificationBody}>{notification.body}</Text>
          
          <View style={styles.notificationMeta}>
            <Clock size={14} color="#9BA1D0" style={styles.metaIcon} />
            <Text style={styles.notificationTime}>
              {formatDate(notification.createdAt)}
            </Text>
            
            {notification.data?.fileUrl && (
              <View style={styles.actionButton}>
                <ExternalLink size={14} color="#5BC0BE" />
                <Text style={styles.actionButtonText}>View</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0B132B', '#1C2541', '#3A506B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
        <View style={styles.placeholderView} />
      </View>
      
      {/* Notifications List */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5BC0BE']}
            tintColor="#5BC0BE"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5BC0BE" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={60} color="#5BC0BE" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You don't have any notifications at the moment. Check back later!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.notificationHeader}>
              <Bell size={20} color="#5BC0BE" />
              <Text style={styles.notificationHeaderText}>
                Recent Notifications
              </Text>
            </View>
            
            <Text style={styles.notificationHint}>
              Tap on a notification to open related content.
              Long press to delete a notification.
            </Text>
            
            {notifications.map(renderNotificationItem)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
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
    backgroundColor: 'rgba(91, 192, 190, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderView: {
    width: 38,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
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
    color: '#A7D5E4',
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
    color: '#A7D5E4',
    textAlign: 'center',
    lineHeight: 22,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  notificationHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  notificationItem: {
    backgroundColor: 'rgba(28, 37, 65, 0.7)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadNotification: {
    borderLeftColor: '#5BC0BE',
    backgroundColor: 'rgba(58, 80, 107, 0.7)',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(91, 192, 190, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
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
    backgroundColor: '#5BC0BE',
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 192, 190, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#5BC0BE',
    marginLeft: 4,
    fontWeight: '500',
  },
});