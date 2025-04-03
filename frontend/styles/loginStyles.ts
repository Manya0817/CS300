import { StyleSheet, Dimensions, Platform } from "react-native";

// Function to generate styles based on screen dimensions
export const loginStyles = (screenWidth: number) => {
  const isSmallDevice = screenWidth < 350;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#231942", // Fallback color
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
      padding: 24,
      flexGrow: 1,
      justifyContent: "center",
    },
    backButton: {
      position: "absolute",
      top: 10,
      left: 10,
      padding: 8,
      zIndex: 10,
    },
    headerContainer: {
      alignItems: "center",
      marginBottom: 36,
    },
    iconContainer: {
      width: 90,
      height: 90,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: 45,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
    headerText: {
      fontSize: isSmallDevice ? 28 : 32,
      fontWeight: "bold",
      color: "#E0C3FC",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: isSmallDevice ? 16 : 18,
      color: "#B799FF",
    },
    formContainer: {
      backgroundColor: "rgba(46, 16, 80, 0.6)",
      borderRadius: 20,
      padding: 24,
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: "rgba(183, 153, 255, 0.2)",
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#E0C3FC",
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(46, 0, 64, 0.45)",
      borderRadius: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: "rgba(183, 153, 255, 0.3)",
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      height: 50,
      color: "#E0C3FC",
      fontSize: isSmallDevice ? 14 : 16,
    },
    toggleButton: {
      padding: 8,
    },
    inputError: {
      borderColor: "#E83A95",
      borderWidth: 1,
    },
    errorText: {
      fontSize: 12,
      color: "#E83A95",
      marginTop: 4,
      marginLeft: 4,
    },
    forgotPasswordButton: {
      alignSelf: "flex-end",
      marginBottom: 24,
      marginTop: 4,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: "#B799FF",
      fontWeight: "600",
    },
    loginButton: {
      backgroundColor: "#6F42C1",
      borderRadius: 12,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: isSmallDevice ? 16 : 18,
      fontWeight: "600",
      color: "#fff",
    },
    buttonIcon: {
      marginLeft: 8,
    },
    footerContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    footerText: {
      fontSize: 14,
      color: "#B799FF",
    },
    footerLink: {
      fontSize: 14,
      color: "#E0C3FC",
      fontWeight: "600",
    },
  });
};