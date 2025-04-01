import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function LandingPage() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#2D3748", "#4A5568", "#1A202C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>📅</Text>
            <Text style={styles.headerText}>Event-Ease</Text>
          </View>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📅</Text>
          </View>
          <Text style={styles.heroTitle}>College Events Made Easy</Text>
          <Text style={styles.heroSubtitle}>Your one-stop platform for all campus activities</Text>
          
          <View style={styles.heroImageContainer}>
            <View style={styles.heroImagePlaceholder}>
              <Ionicons name="calendar" size={60} color="white" />
            </View>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>Why Event-Ease?</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="calendar-outline" size={24} color="#FFF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Event Management</Text>
              <Text style={styles.featureText}>Create, manage, and track campus events</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Live Updates</Text>
              <Text style={styles.featureText}>Stay informed with real-time notifications</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="people-outline" size={24} color="#FFF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>User Friendly</Text>
              <Text style={styles.featureText}>Simple interface for students and organizers</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="school-outline" size={24} color="#FFF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Campus Exclusive</Text>
              <Text style={styles.featureText}>Tailored for college community</Text>
            </View>
          </View>
        </View>

        <View style={styles.testimonialSection}>
          <View style={styles.testimonialCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#1A202C" style={styles.testimonialIcon} />
            <Text style={styles.testimonialText}>
              "Event-Ease has transformed how we organize campus events. Highly recommended!"
            </Text>
            <Text style={styles.testimonialAuthor}>- Student Council President</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Ionicons name="log-in-outline" size={20} color="#1A202C" style={styles.buttonIcon} />
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </Link>
          
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <Link href="/register" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupButtonText}>Student Sign Up</Text>
              <Ionicons name="arrow-forward-outline" size={20} color="#FFF" style={styles.buttonIcon} />
            </TouchableOpacity>
          </Link>
          
          <Text style={styles.noteText}>*Event organizers are registered by administrators</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Event-Ease</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  gradient: { 
    position: "absolute", 
    left: 0, 
    right: 0, 
    top: 0, 
    bottom: 0 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    paddingVertical: 20 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 40,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logoIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  headerText: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  heroSection: { 
    alignItems: "center", 
    paddingHorizontal: 20, 
    marginBottom: 40 
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconText: { 
    fontSize: 40 
  },
  heroTitle: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "#fff", 
    textAlign: "center" 
  },
  heroSubtitle: { 
    fontSize: 18, 
    color: "rgba(255, 255, 255, 0.8)", 
    textAlign: "center", 
    marginTop: 12,
    marginBottom: 20,
  },
  heroImageContainer: {
    marginTop: 20,
    width: width * 0.8,
    alignItems: 'center',
  },
  heroImagePlaceholder: {
    width: width * 0.7,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featuresSection: { 
    paddingHorizontal: 20, 
    marginBottom: 40 
  },
  featuresSectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#1A202C",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#fff",
    marginBottom: 4,
  },
  featureText: { 
    fontSize: 14, 
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  testimonialSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  testimonialCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    alignItems: "center",
  },
  testimonialIcon: {
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#1A202C",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
  },
  actionsSection: { 
    paddingHorizontal: 20, 
    alignItems: "center",
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 300,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#1A202C", 
    textAlign: "center" 
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
    marginVertical: 16,
  },
  dividerLine: { 
    flex: 1, 
    height: 1, 
    backgroundColor: "rgba(255, 255, 255, 0.3)" 
  },
  dividerText: { 
    color: "rgba(255, 255, 255, 0.8)", 
    marginHorizontal: 12,
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "rgba(45, 55, 72, 0.8)",
    width: "100%",
    maxWidth: 300,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  signupButtonText: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#fff", 
    marginRight: 8 
  },
  buttonIcon: {
    marginHorizontal: 8,
  },
  noteText: { 
    fontSize: 12, 
    color: "rgba(255, 255, 255, 0.7)", 
    textAlign: "center", 
    marginTop: 16 
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
  },
});