import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Calendar,
  Clock,
  FileText,
  Bell,
  Zap,
  AlertCircle,
  School,
} from "lucide-react-native";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  DocumentData,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import Header from "./Header"; // Import the new Header component
import Sidebar from "./Sidebar"; // Import the Sidebar component
import { dashboardStyles as styles } from "../../styles/dashboardStyles"; // Import the styles

export default function StudentDashboard() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("Student");
  const [studentInfo, setStudentInfo] = useState<DocumentData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; body: string; read: boolean; createdAt: string; data: Record<string, any> }[]
  >([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarAnimation] = useState(new Animated.Value(0));

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const greeting = getGreeting();

  // Toggle sidebar with animation
  const toggleSidebar = () => {
    if (showSidebar) {
      // Close sidebar with animation
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSidebar(false);
      });
    } else {
      // Open sidebar with animation
      setShowSidebar(true);
      Animated.timing(sidebarAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Setup auth persistence
  useEffect(() => {
    // Add this line near the top - it's critical for web environments
    if (Platform.OS === "web") {
      // This ensures Firebase knows to persist authentication
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log("Firebase auth persistence set to LOCAL");
        })
        .catch((error) => {
          console.error("Error setting persistence:", error);
        });
    }
    let isMounted = true;
    // Set up Auth state change listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return; // Prevent state updates if unmounted
      setAuthInitialized(true);

      if (user) {
        // User is signed in
        console.log("Auth state changed: User is signed in", user.uid);
        setUserId(user.uid);

        // Store user ID in AsyncStorage as backup
        try {
          await AsyncStorage.setItem("userId", user.uid);
          await AsyncStorage.setItem("userToken", user.refreshToken || "true");

          // Store the actual auth token for potential refreshes
          if (user.refreshToken) {
            await AsyncStorage.setItem("refreshToken", user.refreshToken);
          }
        } catch (error) {
          console.error("Error storing user data in AsyncStorage", error);
        }

        // Fetch user data and notification count
        fetchStudentInfo(user.uid);
        fetchUnreadCount(user.uid);
        fetchRecentNotifications(user.uid);
      } else {
        // User is signed out - check AsyncStorage as fallback
        console.log("Auth state changed: No user is signed in");

        try {
          const storedUserId = await AsyncStorage.getItem("userId");
          const storedUserToken = await AsyncStorage.getItem("userToken");

          if (storedUserId && storedUserToken) {
            // We have stored credentials - can use them temporarily
            console.log("Using stored credentials from AsyncStorage");
            setUserId(storedUserId);
            fetchStudentInfo(storedUserId);
            fetchUnreadCount(storedUserId);
            fetchRecentNotifications(storedUserId);
          } else {
            // No stored credentials - user needs to log in
            console.log("No stored credentials - redirecting to login");
            router.replace("/");
          }
        } catch (error) {
          console.error("Error accessing AsyncStorage:", error);
          router.replace("/");
        }
      }

      // End loading state after a minimum time
      // to prevent flickering on fast connections
      setTimeout(() => {
        if (isMounted) {
          setLoading(false);
        }
      }, 800);
    });

    // Clean up the listener on unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Fetch student information from Firestore
  const fetchStudentInfo = async (uid: string) => {
    try {
      // Get student document from Firestore
      const studentDoc = await getDoc(doc(db, "users", uid));

      if (studentDoc.exists()) {
        const data = studentDoc.data();
        setStudentInfo(data);

        // Set student name from Firestore data
        if (data.name) {
          setStudentName(data.name);
        } else if (data.displayName) {
          setStudentName(data.displayName);
        } else if (data.firstName && data.lastName) {
          setStudentName(`${data.firstName} ${data.lastName}`);
        } else if (data.firstName) {
          setStudentName(data.firstName);
        } else if (data.email) {
          // Use email as fallback (without the domain part)
          const emailName = data.email.split("@")[0];
          setStudentName(emailName);
        }

        // Store user name in AsyncStorage as fallback
        await AsyncStorage.setItem("userName", studentName);
      } else {
        console.log("No student data found in Firestore");

        // Fallback to user displayName from auth if available
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.displayName) {
          setStudentName(currentUser.displayName);
          await AsyncStorage.setItem("userName", currentUser.displayName);
        } else if (currentUser && currentUser.email) {
          const emailName = currentUser.email.split("@")[0];
          setStudentName(emailName);
          await AsyncStorage.setItem("userName", emailName);
        }
      }
    } catch (error) {
      console.error("Error fetching student info:", error);

      // Use fallback from AsyncStorage if Firestore fetch fails
      const name = await AsyncStorage.getItem("userName");
      if (name) setStudentName(name);
    }
  };

  // Fetch unread notification count
  const fetchUnreadCount = async (uid: string) => {
    try {
      const notificationsRef = collection(db, "user-notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", uid),
        where("read", "==", false)
      );

      const querySnapshot = await getDocs(q);
      setUnreadCount(querySnapshot.size);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch recent notifications for dashboard preview
  const fetchRecentNotifications = async (uid: string) => {
    try {
      const notificationsRef = collection(db, "user-notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      
      const notificationsList: {
        id: string;
        title: string;
        body: string;
        read: boolean;
        createdAt: string;
        data: Record<string, any>;
      }[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notificationsList.push({
          id: doc.id,
          title: data.title || '',
          body: data.body || '',
          read: data.read || false,
          createdAt: data.createdAt || '',
          data: data.data || {}
        });
      });
      
      setNotifications(notificationsList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    // Prefer auth.currentUser, fall back to stored userId
    const uid = auth.currentUser?.uid || userId;

    if (uid) {
      fetchStudentInfo(uid);
      fetchUnreadCount(uid);
      fetchRecentNotifications(uid);

      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } else {
      console.error("No user ID available for refresh");
      setRefreshing(false);

      // Try to recover by checking AsyncStorage
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
        fetchStudentInfo(storedUserId);
        fetchUnreadCount(storedUserId);
        fetchRecentNotifications(storedUserId);
      }
    }
  };

  const navigateToExamSchedules = () => {
    router.push({
      pathname: "./exams",
      params: { preserve: "true" },
    });
  };

  const navigateToTimetable = () => {
    router.push({
      pathname: "./timetable",
      params: { preserve: "true" },
    });
  };

  const navigateToProfile = () => {
    router.push({
      pathname: "./profile",
      params: { preserve: "true" },
    });
  };

  const navigateToNotifications = () => {
    router.push({
      pathname: "./notifications",
      params: { preserve: "true" },
    });
  };

  const navigateToEvents = () => {
    router.push({
      pathname: "./events",
      params: { preserve: "true" },
    });
  };

  // Handle menu button press
  const handleMenuPress = () => {
    toggleSidebar();
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
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hr ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'semester_timetable':
        return <Calendar size={20} color="#9333EA" />;
      case 'exam_schedule':
        return <FileText size={20} color="#9333EA" />;
      default:
        return <Bell size={20} color="#9333EA" />;
    }
  };

  // Display student role/course if available
  const getStudentSubtitle = () => {
    if (studentInfo) {
      // Try to generate a student subtitle from available data
      if (studentInfo.role && studentInfo.semester) {
        return `${studentInfo.role} • Semester ${studentInfo.semester}`;
      } else if (studentInfo.course && studentInfo.semester) {
        return `${studentInfo.course} • Semester ${studentInfo.semester}`;
      } else if (studentInfo.batch) {
        return `Batch of ${studentInfo.batch}`;
      } else if (studentInfo.semester) {
        return `Semester ${studentInfo.semester}`;
      } else if (studentInfo.course) {
        return studentInfo.course;
      } else if (studentInfo.role) {
        return studentInfo.role;
      }
    }
    return null;
  };

  const studentSubtitle = getStudentSubtitle();

  if (!authInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#231942", "#5E548E", "#9F86C0"]}
          style={styles.backgroundGradient}
        />
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingScreenText}>
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#231942", "#5E548E", "#9F86C0"]}
        style={styles.backgroundGradient}
      />

      <Header
        userName={studentName}
        unreadCount={unreadCount}
        onMenuPress={handleMenuPress}
        onNotificationPress={navigateToNotifications}
        onProfilePress={navigateToProfile}
        onLogoutPress={() => router.replace("/")}
        subtitle={studentSubtitle}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeGreeting}>{greeting},</Text>
          <Text style={styles.welcomeName}>{studentName}</Text>
          {studentSubtitle && (
            <Text style={styles.welcomeSubtitle}>{studentSubtitle}</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={navigateToTimetable}
            >
              <View style={styles.quickActionIconContainer}>
                <Calendar size={24} color="#9333EA" />
              </View>
              <Text style={styles.quickActionText}>Class Timetable</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={navigateToExamSchedules}
            >
              <View style={styles.quickActionIconContainer}>
                <FileText size={24} color="#9333EA" />
              </View>
              <Text style={styles.quickActionText}>Exam Schedules</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={navigateToEvents}
            >
              <View style={styles.quickActionIconContainer}>
                <Zap size={24} color="#9333EA" />
              </View>
              <Text style={styles.quickActionText}>My Events</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={navigateToNotifications}
            >
              <View style={styles.quickActionIconContainer}>
                <Bell size={24} color="#9333EA" />
                {unreadCount > 0 && (
                  <View style={styles.gridNotificationBadge} />
                )}
              </View>
              <Text style={styles.quickActionText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Latest Notifications */}
        <View style={styles.notificationsContainer}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            {notifications.length > 0 && (
              <TouchableOpacity
                onPress={navigateToNotifications}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllButtonText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9333EA" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.announcementCard}>
              <View style={styles.announcementHeader}>
                <View style={styles.announcementIconContainer}>
                  <Bell size={20} color="#9333EA" />
                </View>
                <Text style={styles.announcementTitle}>No Notifications</Text>
              </View>

              <View style={styles.announcementBody}>
                <Text style={styles.announcementText}>
                  You don't have any notifications at the moment. Check back later for updates.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {notifications.slice(0, 3).map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.announcementCard,
                    !notification.read && styles.unreadAnnouncementCard
                  ]}
                  onPress={navigateToNotifications}
                >
                  <View style={styles.announcementHeader}>
                    <View style={styles.announcementIconContainer}>
                      {getNotificationIcon(notification.data?.type || '')}
                    </View>
                    <Text style={styles.announcementTitle}>{notification.title}</Text>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>

                  <View style={styles.announcementBody}>
                    <Text 
                      style={styles.announcementText}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {notification.body}
                    </Text>
                    <View style={styles.announcementMeta}>
                      <Clock size={14} color="#7C7C8A" />
                      <Text style={styles.announcementDate}>
                        {formatDate(notification.createdAt)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* College Info */}
        <View style={styles.collegeInfoContainer}>
          <View style={styles.collegeLogoPlaceholder}>
            <School size={30} color="#9333EA" />
          </View>
          <Text style={styles.collegeTitle}>IIIT Guwahati</Text>
          <Text style={styles.collegeSubtitle}>Student Information System</Text>
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
                }
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
              userName={studentName}
              userRole={studentSubtitle}
            />
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}