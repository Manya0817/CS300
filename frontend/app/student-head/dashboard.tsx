import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, StatusBar, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function StudentHeadDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || "Student Head");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hello, {userName}!</Text>
              <Text style={styles.welcomeText}>Student Head Dashboard</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Ionicons name="star" size={12} color="white" style={styles.badgeIcon} />
            <Text style={styles.badgeText}>Student Head</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Management Options</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push("/student-head/timetable")}
          >
            <View style={styles.cardIconContainer}>
              <Ionicons name="calendar" size={24} color="white" />
            </View>
            <Text style={styles.cardTitle}>Class Timetable</Text>
            <Text style={styles.cardDesc}>View weekly class schedule</Text>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.cardAlt]}
            onPress={() => router.push("/student-head/exams")}
          >
            <View style={[styles.cardIconContainer, styles.cardIconContainerAlt]}>
              <Ionicons name="document-text" size={24} color="white" />
            </View>
            <Text style={styles.cardTitle}>Exam Schedule</Text>
            <Text style={styles.cardDesc}>Check upcoming exams</Text>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.highlightCard} 
          onPress={() => router.push("/student-head/events")}
        >
          <View style={styles.highlightIconSection}>
            <View style={styles.highlightIconContainer}>
              <Ionicons name="calendar-outline" size={32} color="#1E3A8A" />
            </View>
          </View>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightTitle}>Manage Events</Text>
            <Text style={styles.highlightDesc}>Create, edit and coordinate student events for the semester</Text>
            <View style={styles.highlightAction}>
              <Text style={styles.highlightActionText}>Manage Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={20} color="white" style={styles.statIcon} />
              <Text style={styles.statValue}>145</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar-clear" size={20} color="white" style={styles.statIcon} />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flask" size={20} color="white" style={styles.statIcon} />
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Upcoming Exams</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
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
    paddingTop: 50,
  },
  header: {
    marginBottom: 30,
    position: "relative"
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "rgba(29, 78, 216, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  cardAlt: {
    backgroundColor: "rgba(29, 78, 216, 0.4)",
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.6)",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainerAlt: {
    backgroundColor: "rgba(30, 58, 138, 0.8)",
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
  cardArrow: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  highlightCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  highlightIconSection: {
    width: 90,
    backgroundColor: "rgba(219, 234, 254, 0.6)",
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightContent: {
    flex: 1,
    padding: 20,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  highlightDesc: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 20,
  },
  highlightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
    marginRight: 6,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(30, 58, 138, 0.5)",
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textAlign: 'center',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "rgba(30, 58, 138, 0.6)",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  logoutIcon: {
    marginRight: 8,
  },
});