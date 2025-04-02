import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
  } from "react-native";
  import { LinearGradient } from "expo-linear-gradient";
  import { useRouter } from "expo-router";
  import { useState } from "react";
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { auth, db } from "../firebase";
  import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
  
  export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
  
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
  
    const handleLogin = async () => {
      setEmailError("");
      setPasswordError("");
      let isValid = true;
    
      if (!email) {
        setEmailError("Email is required");
        isValid = false;
      } else if (!validateEmail(email)) {
        setEmailError("Please enter a valid email");
        isValid = false;
      }
    
      if (!password) {
        setPasswordError("Password is required");
        isValid = false;
      }
    
      if (isValid) {
        setLoading(true);
        try {
          // Authenticate the user
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
    
          // Get user role and metadata from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
    
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.role;
    
            // Store user metadata in AsyncStorage
            await AsyncStorage.setItem("userId", user.uid);
            await AsyncStorage.setItem("userRole", userRole);
            await AsyncStorage.setItem("userMetadata", JSON.stringify(userData));
    
            console.log("User metadata stored in AsyncStorage:", userData);
    
            // Navigate based on role
            switch (userRole) {
              case "student":
                router.replace("./student/dashboard");
                break;
              case "student-head":
                router.replace("./student-head/dashboard");
                break;
              case "faculty-head":
                router.replace("./faculty-head/dashboard");
                break;
              default:
                router.replace("/"); // Default fallback
            }
          } else {
            // User document doesn't exist in Firestore
            setPasswordError("Account error. Please contact support.");
            console.error("User document not found in Firestore");
          }
        } catch (err: any) {
          if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
            setPasswordError("Invalid email or password");
          } else {
            setPasswordError("Login failed. Please try again.");
            console.error("Login error:", err);
          }
        } finally {
          setLoading(false);
        }
      }
    };
  
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#121827", "#1E293B"]}
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
              <Text style={styles.backIcon}>⬅️</Text>
            </TouchableOpacity>
  
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Event Ease</Text>
              <Text style={styles.subtitle}>Login as a student</Text>
            </View>
  
            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#718096"
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
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>
  
              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#718096"
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
                    <Text style={styles.toggleIcon}>{showPassword ? "👁️‍🗨️" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>
  
              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => router.push("./forgot-password")}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
  
              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading ? styles.buttonDisabled : null]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
  
              {/* Footer */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/register")} disabled={loading}>
                  <Text style={styles.footerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
      bottom: 0,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    backButton: {
      marginBottom: 24,
    },
    backIcon: {
      fontSize: 24,
      color: "#fff",
    },
    headerContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    headerText: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fff",
    },
    subtitle: {
      fontSize: 16,
      color: "#E4E4E7",
      marginTop: 8,
    },
    formContainer: {
      backgroundColor: "rgba(30, 41, 59, 0.7)",
      padding: 24,
      borderRadius: 16,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      color: "#E4E4E7",
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#2D3748",
      borderRadius: 12,
      paddingHorizontal: 12,
    },
    inputIcon: {
      fontSize: 20,
      color: "#9F7AEA",
      marginRight: 12,
    },
    input: {
      flex: 1,
      height: 50,
      color: "#fff",
      fontSize: 16,
    },
    toggleButton: {
      padding: 8,
    },
    toggleIcon: {
      fontSize: 20,
      color: "#A1A1AA",
    },
    inputError: {
      borderWidth: 1,
      borderColor: "#FC8181",
    },
    errorText: {
      fontSize: 12,
      color: "#FC8181",
      marginTop: 4,
    },
    forgotPasswordButton: {
      alignSelf: "flex-end",
      marginBottom: 24,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: "#9F7AEA",
      fontWeight: "600",
    },
    loginButton: {
      backgroundColor: "#7C3AED",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 24,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
    },
    footerContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    footerText: {
      fontSize: 14,
      color: "#E4E4E7",
    },
    footerLink: {
      fontSize: 14,
      color: "#9F7AEA",
      fontWeight: "600",
    },
  });