import { View, Text, TouchableOpacity, ScrollView, StatusBar, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { landingPageStyles as styles } from "../styles/landingPageStyles";

const { width } = Dimensions.get("window");

export default function LandingPage() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#231942", "#5E548E", "#9F86C0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={60} color="white" />
          </View>
          <Text style={styles.heroTitle}>Event-Ease</Text>
          <Text style={styles.heroSubtitle}>College Events Management System</Text>
        </View>

        <View style={styles.featuresSection}>
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
              <Text style={styles.featureTitle}>Instant Notifications</Text>
              <Text style={styles.featureText}>Stay updated with event alerts</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Ionicons name="log-in-outline" size={20} color="#231942" style={styles.buttonIcon} />
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
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Event-Ease</Text>
        </View>
      </ScrollView>
    </View>
  );
}