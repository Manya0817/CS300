import { StyleSheet, Dimensions, Platform } from "react-native";

export const registerStyles = (screenWidth: number) => {
  // Responsive sizing
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
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 60,
      flexGrow: 1,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    headerContainer: {
      alignItems: "center",
      marginBottom: 30,
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
      fontSize: isSmallDevice ? 14 : 16,
      color: "#B799FF",
      marginTop: 4,
    },
    formContainer: {
      backgroundColor: "rgba(46, 16, 80, 0.6)",
      padding: 24,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 10,
      borderWidth: 1,
      borderColor: "rgba(183, 153, 255, 0.2)",
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#E0C3FC",
      marginBottom: 10,
      paddingLeft: 4,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(46, 0, 64, 0.45)",
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: "rgba(183, 153, 255, 0.3)",
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      height: 56,
      color: "#E0C3FC",
      fontSize: isSmallDevice ? 14 : 16,
      fontWeight: "500",
    },
    toggleButton: {
      padding: 8,
    },
    inputError: {
      borderColor: "#E83A95",
      borderWidth: 1,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      paddingLeft: 4,
    },
    errorText: {
      fontSize: 12,
      color: "#E83A95",
      marginLeft: 6,
      fontWeight: "500",
    },
    helperContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      paddingLeft: 4,
    },
    helperText: {
      fontSize: 12,
      color: "#B799FF",
      marginLeft: 6,
    },
    requirementsContainer: {
      marginTop: 12,
      paddingLeft: 4,
    },
    requirementItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    requirementIcon: {
      marginRight: 6,
    },
    requirementText: {
      fontSize: 12,
      color: "#B799FF",
      fontWeight: "500",
    },
    requirementMet: {
      color: "#9F86C0",
    },
    registerButton: {
      backgroundColor: "#6F42C1",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 10,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
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
      marginTop: 8,
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