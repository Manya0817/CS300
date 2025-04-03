import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { registerStyles } from "../styles/registerStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  // Generate styles based on screen width
  const styles = registerStyles(screenWidth);
  
  // Handle screen rotation and resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    
    return () => subscription?.remove();
  }, []);

  // Password strength requirements
  const passwordRequirements = [
    { id: 1, text: "At least 8 characters", met: password.length >= 8 },
    { id: 2, text: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { id: 3, text: "At least one number", met: /[0-9]/.test(password) },
    { id: 4, text: "At least one special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    let isValid = true;
  
    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    }
  
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else if (!email.endsWith("@iiitg.ac.in")) {
      setEmailError("Use your IIIT Guwahati student email (e.g., firstname.lastname##b@iiitg.ac.in)");
      isValid = false;
    }
  
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter");
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least one number");
      isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError("Password must contain at least one special character");
      isValid = false;
    }
  
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }
  
    if (isValid) {
      setLoading(true);
      try {
        // Create the authentication user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Extract academic year from email (e.g., "23b" from firstname.lastname23b@iiitg.ac.in)
        const emailNamePart = email.split('@')[0];
        const academicYearMatch = emailNamePart.match(/(\d+)b$/);
        const academicYear = academicYearMatch ? `20${academicYearMatch[1]}` : null;
        
        // Create user metadata object
        const userData = {
          uid: user.uid, // Store Firebase UID in the document
          name: name,
          email: email,
          role: "student",
          batch: academicYear, // Include batch year if found in email
          createdAt: new Date(),
          lastLogin: new Date(),
          phoneVerified: false
        };
        
        // Store user information in Firestore
        await setDoc(doc(db, "users", user.uid), userData);
        
        // Store user metadata in AsyncStorage
        await AsyncStorage.setItem("userId", user.uid);
        await AsyncStorage.setItem("userRole", "student");
        await AsyncStorage.setItem("userMetadata", JSON.stringify(userData));
        
        // Navigate to dashboard
        router.replace("./student/dashboard");
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          setEmailError("This email is already registered");
        } else if (err.code === "auth/invalid-email") {
          setEmailError("Invalid email address");
        } else {
          setEmailError("Registration failed. Please try again.");
          console.error("Registration error:", err);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#231942", "#5E548E", "#9F86C0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/")}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#E0C3FC" />
          </TouchableOpacity>

          {/* Header with Logo */}
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={screenWidth < 350 ? 40 : 50} color="white" />
            </View>
            <Text style={styles.headerText}>Create Account</Text>
            <Text style={styles.subtitle}>Join the IIITG community</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputContainer, nameError ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={20} color="#B799FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#B799FF80"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) setNameError("");
                  }}
                  editable={!loading}
                />
              </View>
              {nameError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#E83A95" />
                  <Text style={styles.errorText}>{nameError}</Text>
                </View>
              ) : null}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={20} color="#B799FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="firstname.lastname##b@iiitg.ac.in"
                  placeholderTextColor="#B799FF80"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {emailError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#E83A95" />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : (
                <View style={styles.helperContainer}>
                  <Ionicons name="information-circle" size={14} color="#B799FF" />
                  <Text style={styles.helperText}>Use your IIIT Guwahati email</Text>
                </View>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={20} color="#B799FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor="#B799FF80"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}
                  disabled={loading}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#B799FF" 
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#E83A95" />
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : (
                <View style={styles.requirementsContainer}>
                  {passwordRequirements.map((req) => (
                    <View key={req.id} style={styles.requirementItem}>
                      <Ionicons 
                        name={req.met ? "checkmark-circle" : "ellipse-outline"} 
                        size={14} 
                        color={req.met ? "#9F86C0" : "#B799FF"} 
                        style={styles.requirementIcon}
                      />
                      <Text style={[styles.requirementText, req.met ? styles.requirementMet : null]}>
                        {req.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputContainer, confirmPasswordError ? styles.inputError : null]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#B799FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#B799FF80"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError("");
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.toggleButton}
                  disabled={loading}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#B799FF" 
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#E83A95" />
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                </View>
              ) : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading ? styles.buttonDisabled : null]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Create Account</Text>
                  <Ionicons name="arrow-forward-outline" size={20} color="white" style={styles.buttonIcon} />
                </View>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login")} disabled={loading}>
                <Text style={styles.footerLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}