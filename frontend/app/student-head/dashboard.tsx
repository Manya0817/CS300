import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./Header"; // Updated Header component
import Sidebar from "./Sidebar"; // Updated Sidebar component
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

const { width } = Dimensions.get("window");

export default function StudentHeadDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userMetadata, setUserMetadata] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarAnimation] = useState(new Animated.Value(0));
  const [notifications, setNotifications] = useState<{ id: string; title: string; body: string; read?: boolean }[]>([]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedMetadata = await AsyncStorage.getItem("userMetadata");
        if (storedMetadata) {
          const metadata = JSON.parse(storedMetadata);
          setUserMetadata(metadata);
          setUserName(metadata.name || "Student Head");
        } else {
          setUserName("Student Head");
        }
      } catch (error) {
        console.error("Error fetching user metadata:", error);
        setUserName("Student Head");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      const notificationsRef = collection(db, "user-notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", auth.currentUser?.uid || ""),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const notificationList: any[] = [];
      querySnapshot.forEach((doc) => {
        notificationList.push({ id: doc.id, ...doc.data() });
      });

      setNotifications(notificationList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const toggleSidebar = () => {
    if (showSidebar) {
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSidebar(false);
      });
    } else {
      setShowSidebar(true);
      Animated.timing(sidebarAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#1E3A8A", "#3B82F6", "#93C5FD"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1E3A8A", "#3B82F6", "#93C5FD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Updated Header Component */}
      <Header
        userName={userName}
        userRole="Student Head"
        onMenuPress={toggleSidebar}
        unreadCount={notifications.filter((n) => !n.read).length} // Pass unread count
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.welcomeName}>{userName}</Text>
          <Text style={styles.welcomeText}>Student Head Dashboard</Text>
        </View>

        <Text style={styles.sectionTitle}>Management Options</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("./timetable")}
          >
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIconText}>📅</Text>
            </View>
            <Text style={styles.cardTitle}>Class Timetable</Text>
            <Text style={styles.cardDesc}>View weekly class schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardAlt]}
            onPress={() => router.push("./exams")}
          >
            <View style={[styles.cardIconContainer, styles.cardIconContainerAlt]}>
              <Text style={styles.cardIconText}>📝</Text>
            </View>
            <Text style={styles.cardTitle}>Exam Schedule</Text>
            <Text style={styles.cardDesc}>Check upcoming exams</Text>
          </TouchableOpacity>

          {/* Manage Events Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardAlt]}
            onPress={() => router.push("./events")}
          >
            <View style={[styles.cardIconContainer, styles.cardIconContainerAlt]}>
              <Text style={styles.cardIconText}>📆</Text>
            </View>
            <Text style={styles.cardTitle}>Manage Events</Text>
            <Text style={styles.cardDesc}>Create and manage events</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('./notifications')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {notifications.slice(0, 3).map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationCard}
              onPress={() => router.push('./notifications')}
            >
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationBody}>{notification.body}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Sidebar Implementation */}
      {showSidebar && (
        <>
          <TouchableWithoutFeedback onPress={toggleSidebar}>
            <Animated.View
              style={[
                styles.sidebarOverlay,
                {
                  opacity: sidebarAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.7],
                  }),
                },
              ]}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.sidebarContainer,
              {
                transform: [
                  {
                    translateX: sidebarAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Sidebar
              isVisible={showSidebar}
              onClose={toggleSidebar}
              activePage="dashboard"
              userName={userName}
              userRole="Student Head"
            />
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 12,
    fontSize: 16,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 30,
    position: "relative",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 16,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  card: {
    width: "48%",
    backgroundColor: "rgba(37, 99, 235, 0.3)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardAlt: {
    backgroundColor: "rgba(29, 78, 216, 0.4)",
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIconContainerAlt: {
    backgroundColor: "rgba(30, 58, 138, 0.8)",
  },
  cardIconText: {
    fontSize: 24,
    color: "white",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  notificationsContainer: {
    marginTop: 24,
  },
  notificationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  notificationBody: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  viewAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 998,
  },
  sidebarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    zIndex: 999,
  },
});