import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Book,
  Calendar,
  Clock,
  FileText,
  LogOut,
  Bell,
  User,
  Zap,
  AlertCircle,
  School,
} from "lucide-react-native";
import { collection, query, where, getDocs, doc, getDoc, DocumentData } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';

const { width } = Dimensions.get("window");

export default function StudentDashboard() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("Student");
  const [studentInfo, setStudentInfo] = useState<DocumentData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const greeting = getGreeting();

  // Setup auth persistence
  useEffect(() => {
    // Add this line near the top - it's critical for web environments
    if (Platform.OS === 'web') {
      // This ensures Firebase knows to persist authentication
      auth.setPersistence(browserLocalPersistence)
        .then(() => {
          console.log('Firebase auth persistence set to LOCAL');
        })
        .catch((error) => {
          console.error('Error setting persistence:', error);
        });
    }
    let isMounted = true;
    // Set up Auth state change listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return; // Prevent state updates if unmounted
      setAuthInitialized(true);
      
      if (user) {
        // User is signed in
        console.log('Auth state changed: User is signed in', user.uid);
        setUserId(user.uid);
        
        // Store user ID in AsyncStorage as backup
        try {
          await AsyncStorage.setItem('userId', user.uid);
          await AsyncStorage.setItem('userToken', user.refreshToken || 'true');
          
          // Store the actual auth token for potential refreshes
          if (user.refreshToken) {
            await AsyncStorage.setItem('refreshToken', user.refreshToken);
          }
        } catch (error) {
          console.error('Error storing user data in AsyncStorage', error);
        }
        
        // Fetch user data and notification count
        fetchStudentInfo(user.uid);
        fetchUnreadCount(user.uid);
      } else {
        // User is signed out - check AsyncStorage as fallback
        console.log('Auth state changed: No user is signed in');
        
        try {
          const storedUserId = await AsyncStorage.getItem('userId');
          const storedUserToken = await AsyncStorage.getItem('userToken');
          
          if (storedUserId && storedUserToken) {
            // We have stored credentials - can use them temporarily
            console.log('Using stored credentials from AsyncStorage');
            setUserId(storedUserId);
            fetchStudentInfo(storedUserId);
            fetchUnreadCount(storedUserId);
          } else {
            // No stored credentials - user needs to log in
            console.log('No stored credentials - redirecting to login');
            router.replace('/');
          }
        } catch (error) {
          console.error('Error accessing AsyncStorage:', error);
          router.replace('/');
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
      const studentDoc = await getDoc(doc(db, 'users', uid));
      
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
          const emailName = data.email.split('@')[0];
          setStudentName(emailName);
        }
        
        // Store user name in AsyncStorage as fallback
        await AsyncStorage.setItem('userName', studentName);
        console.log('Student data fetched:', data);
      } else {
        console.log('No student data found in Firestore');
        
        // Fallback to user displayName from auth if available
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.displayName) {
          setStudentName(currentUser.displayName);
          await AsyncStorage.setItem('userName', currentUser.displayName);
        } else if (currentUser && currentUser.email) {
          const emailName = currentUser.email.split('@')[0];
          setStudentName(emailName);
          await AsyncStorage.setItem('userName', emailName);
        }
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
      
      // Use fallback from AsyncStorage if Firestore fetch fails
      const name = await AsyncStorage.getItem("userName");
      if (name) setStudentName(name);
    }
  };

  // Fetch unread notification count
  const fetchUnreadCount = async (uid: string) => {
    try {
      const notificationsRef = collection(db, 'user-notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', uid),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      setUnreadCount(querySnapshot.size);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Prefer auth.currentUser, fall back to stored userId
    const uid = auth.currentUser?.uid || userId;
    
    if (uid) {
      fetchStudentInfo(uid);
      fetchUnreadCount(uid);
      
      // Simulate refreshing announcements
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } else {
      console.error("No user ID available for refresh");
      setRefreshing(false);
      
      // Try to recover by checking AsyncStorage
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        fetchStudentInfo(storedUserId);
        fetchUnreadCount(storedUserId);
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Auth
      await auth.signOut();
      
      // Clear local storage
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userName");
      await AsyncStorage.removeItem("userId");
      
      // Navigate to login
      router.replace("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navigateToExamSchedules = () => {
    // This preserves the stack so previous screen remains in memory
    router.push({
      pathname: "./exams",
      params: { preserve: "true" }
    });
  };
  
  const navigateToTimetable = () => {
    router.push({
      pathname: "./timetable",
      params: { preserve: "true"  }
    });
  };
  
  const navigateToProfile = () => {
    router.push({
      pathname: "./profile",
      params: { preserve: "true"  }
    });
  };
  
  const navigateToNotifications = () => {
    router.push({
      pathname: './notifications',
      params: { preserve: "true"  }
    });
  };

  const navigateToEvents = () => {
    router.push({
      pathname: './events',
      params: { preserve: "true"  }
    });
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
          colors={["#0F0825", "#1A1035", "#261143"]}
          style={styles.backgroundGradient}
        />
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingScreenText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#0F0825", "#1A1035", "#261143"]}
        style={styles.backgroundGradient}
      />

      {/* Header with Logout Button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>{studentName}</Text>
          {studentSubtitle && (
            <Text style={styles.userSubtitle}>{studentSubtitle}</Text>
          )}
        </View>
        
        <View style={styles.headerRightContainer}>
          {/* Notification Button with Badge */}
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={navigateToNotifications}
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
          
          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessible={true}
            accessibilityLabel="Log out"
            accessibilityRole="button"
          >
            <LogOut size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
              onPress={navigateToProfile}
            >
              <View style={styles.quickActionIconContainer}>
                <User size={24} color="#9333EA" />
              </View>
              <Text style={styles.quickActionText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={navigateToEvents}
            >
              <View style={styles.quickActionIconContainer}>
                <User size={24} color="#9333EA" />
              </View>
              <Text style={styles.quickActionText}>My Events</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={navigateToNotifications}
            >
              <View style={styles.quickActionIconContainer}>
                <Bell size={24} color="#9333EA" />
                {unreadCount > 0 && <View style={styles.gridNotificationBadge} />}
              </View>
              <Text style={styles.quickActionText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Latest Announcements */}
        <View style={styles.announcementsContainer}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9333EA" />
              <Text style={styles.loadingText}>Loading updates...</Text>
            </View>
          ) : (
            <>
              {/* Information Card */}
              <View style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <View style={styles.announcementIconContainer}>
                    <AlertCircle size={20} color="#9333EA" />
                  </View>
                  <Text style={styles.announcementTitle}>Important Notice</Text>
                </View>

                <View style={styles.announcementBody}>
                  <Text style={styles.announcementText}>
                    Check your notifications for the latest timetable and exam schedule updates.
                  </Text>
                  <View style={styles.announcementMeta}>
                    <Clock size={14} color="#7C7C8A" />
                    <Text style={styles.announcementDate}>Today</Text>
                  </View>
                </View>
              </View>

              {/* Event Card */}
              <View style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <View style={styles.announcementIconContainer}>
                    <Zap size={20} color="#9333EA" />
                  </View>
                  <Text style={styles.announcementTitle}>Upcoming Events</Text>
                </View>

                <View style={styles.announcementBody}>
                  <Text style={styles.announcementText}>
                    Events and notifications will appear here. Stay tuned for updates on your academic schedule.
                  </Text>
                  <View style={styles.announcementMeta}>
                    <Clock size={14} color="#7C7C8A" />
                    <Text style={styles.announcementDate}>Yesterday</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* College Info */}
        <View style={styles.collegeInfoContainer}>
          <View style={styles.collegeLogoPlaceholder}>
            <School size={30} color="#9333EA" />
          </View>
          <Text style={styles.collegeTitle}>IIIT Guwahati</Text>
          <Text style={styles.collegeSubtitle}>
            Student Information System
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0825",
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingScreenText: {
    marginTop: 20,
    fontSize: 18,
    color: '#A78BDA',
    fontWeight: '500',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerLeft: {
    flex: 1,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    color: "#A78BDA",
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: 12,
    color: "#A78BDA",
    fontWeight: "500",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(147, 51, 234, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(147, 51, 234, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF4D4F",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  gridNotificationBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF4D4F",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F7FAFC",
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (width - 50) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(147, 51, 234, 0.2)",
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(147, 51, 234, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D8BDFF",
  },
  announcementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  announcementCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(147, 51, 234, 0.2)",
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  announcementIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(147, 51, 234, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F7FAFC",
  },
  announcementBody: {},
  announcementText: {
    fontSize: 14,
    color: "#A78BDA",
    lineHeight: 20,
    marginBottom: 10,
  },
  announcementMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  announcementDate: {
    fontSize: 12,
    color: "#7C7C8A",
    marginLeft: 5,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(147, 51, 234, 0.2)",
  },
  loadingText: {
    fontSize: 16,
    color: "#A78BDA",
    marginTop: 10,
  },
  collegeInfoContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  collegeLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  collegeLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  collegeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F7FAFC",
    marginBottom: 5,
  },
  collegeSubtitle: {
    fontSize: 14,
    color: "#A78BDA",
  },
});