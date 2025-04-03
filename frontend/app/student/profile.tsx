import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Mail, User } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // First try to get data from AsyncStorage
      const userMetadataString = await AsyncStorage.getItem("userMetadata");
      
      if (userMetadataString) {
        // Parse the stored metadata
        const userMetadata = JSON.parse(userMetadataString);
        
        // Update profile state with metadata
        updateProfileFromMetadata(userMetadata);
        setLoading(false);
      } else {
        // If no metadata in AsyncStorage, fetch from Firestore
        await fetchProfileFromFirestore();
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      setLoading(false);
    }
  };

  interface Metadata {
    name?: string;
    displayName?: string;
    email?: string;
  }

  const updateProfileFromMetadata = (metadata: Metadata) => {
    // Extract only name and email
    setProfile({
      name: metadata.name || metadata.displayName || "Student",
      email: metadata.email || "",
    });
  };

  const fetchProfileFromFirestore = async () => {
    try {
      // Get current user from auth
      const currentUser = auth.currentUser;
      let userId;
      
      if (currentUser) {
        userId = currentUser.uid;
      } else {
        // Fallback to AsyncStorage
        userId = await AsyncStorage.getItem("userId");
      }
      
      if (!userId) {
        console.error("No user ID found");
        setLoading(false);
        return;
      }
      
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Store metadata in AsyncStorage for future use
        await AsyncStorage.setItem("userMetadata", JSON.stringify(userData));
        
        // Update profile state
        updateProfileFromMetadata(userData);
      } else {
        console.log("No user document found in Firestore");
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile from Firestore:", error);
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={["#231942", "#5E548E", "#9F86C0"]}
        style={styles.backgroundGradient}
      />
      
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E0B1CB" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <User size={60} color="#E0B1CB" />
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
            </View>
            
            {/* Email */}
            {profile.email && (
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Mail size={20} color="#E0B1CB" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profile.email}</Text>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              IIIT Guwahati Student Information System
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#231942",
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(94, 84, 142, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(94, 84, 142, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(224, 177, 203, 0.5)",
  },
  profileName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(94, 84, 142, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footer: {
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
});