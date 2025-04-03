import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import {
  Home,
  Bell,
  Calendar,
  User,
  LogOut,
  X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebase';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  activePage: string;
  userName: string;
  userRole?: string;
}

const Sidebar = ({ isVisible, onClose, activePage, userName, userRole }: SidebarProps) => {
  const router = useRouter();

  if (!isVisible) {
    return null;
  }

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        await performLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: performLogout }
        ]
      );
    }
  };

  const performLogout = async () => {
    try {
      await auth.signOut();
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to logout. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    }
  };

  const navigateTo = (route: string) => {
    router.push(`./${route}`);
    onClose();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <View style={styles.userAvatarContainer}>
          <User size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>{userName}</Text>
        {userRole && <Text style={styles.userRole}>{userRole}</Text>}
      </View>

      {/* Navigation Menu */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuItem, activePage === 'dashboard' && styles.activeMenuItem]}
          onPress={() => navigateTo('dashboard')}
        >
          <Home size={24} color={activePage === 'dashboard' ? "#93C5FD" : "#FFFFFF"} />
          <Text
            style={[
              styles.menuItemText,
              activePage === 'dashboard' && styles.activeMenuItemText,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activePage === 'notifications' && styles.activeMenuItem]}
          onPress={() => navigateTo('notifications')}
        >
          <Bell size={24} color={activePage === 'notifications' ? "#93C5FD" : "#FFFFFF"} />
          <Text
            style={[
              styles.menuItemText,
              activePage === 'notifications' && styles.activeMenuItemText,
            ]}
          >
            Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activePage === 'events' && styles.activeMenuItem]}
          onPress={() => navigateTo('events')}
        >
          <Calendar size={24} color={activePage === 'events' ? "#93C5FD" : "#FFFFFF"} />
          <Text
            style={[
              styles.menuItemText,
              activePage === 'events' && styles.activeMenuItemText,
            ]}
          >
            Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activePage === 'profile' && styles.activeMenuItem]}
          onPress={() => navigateTo('profile')}
        >
          <User size={24} color={activePage === 'profile' ? "#93C5FD" : "#FFFFFF"} />
          <Text
            style={[
              styles.menuItemText,
              activePage === 'profile' && styles.activeMenuItemText,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    maxWidth: 300,
    height: '100%',
    backgroundColor: 'rgba(30, 58, 138, 0.97)',
    zIndex: 999,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuContainer: {
    flex: 1,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  activeMenuItem: {
    backgroundColor: 'rgba(147, 197, 253, 0.15)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  activeMenuItemText: {
    color: '#93C5FD',
  },
  logoutContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});

export default Sidebar;