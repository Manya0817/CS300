import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Menu, Bell, User, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebase';
import { headerStyles as styles } from '../../styles/headerStyles';

interface HeaderProps {
  userName: string;
  unreadCount: number;
  onMenuPress: () => void;
  onNotificationPress: () => void;
  onProfilePress: () => void;
  onLogoutPress?: () => void; // Added this optional prop
  subtitle?: string;
}

const Header = ({
  userName,
  unreadCount,
  onMenuPress,
  onNotificationPress,
  onProfilePress,
  onLogoutPress,
  subtitle
}: HeaderProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    // Check if we're on web platform
    if (Platform.OS === 'web') {
      // Web sometimes has issues with alerts, use confirm instead
      if (window.confirm("Are you sure you want to logout?")) {
        await performLogout();
      }
    } else {
      // Use Alert for native platforms
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Logout", 
            style: "destructive",
            onPress: performLogout
          }
        ]
      );
    }
  };

  const performLogout = async () => {
    try {
      // Sign out from Firebase Auth
      await auth.signOut();
      
      // Clear all AsyncStorage data
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      
      console.log('User logged out, AsyncStorage cleared');
      
      // Use custom handler if provided, otherwise handle internally
      if (onLogoutPress) {
        onLogoutPress();
      } else {
        // Navigate to login
        router.replace("/");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      if (Platform.OS === 'web') {
        window.alert("Failed to logout. Please try again.");
      } else {
        Alert.alert("Error", "Failed to logout. Please try again.");
      }
    }
  };

  return (
    <View style={styles.header}>
      {/* Left: Menu Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onMenuPress}
        accessible={true}
        accessibilityLabel="Open menu"
        accessibilityRole="button"
      >
        <Menu size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Right: Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {/* Notification Button with Badge */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          accessible={true}
          accessibilityLabel="View notifications"
          accessibilityRole="button"
        >
          <Bell size={22} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onProfilePress}
          accessible={true}
          accessibilityLabel="View profile"
          accessibilityRole="button"
        >
          <User size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLogout}
          accessible={true}
          accessibilityLabel="Logout"
          accessibilityRole="button"
        >
          <LogOut size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;