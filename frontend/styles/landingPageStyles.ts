import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const landingPageStyles = StyleSheet.create({
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
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1
  },
  heroSection: { 
    alignItems: "center", 
    paddingHorizontal: 20, 
    marginBottom: 40,
    marginTop: 80
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  heroTitle: { 
    fontSize: 42, 
    fontWeight: "700", 
    color: "#fff", 
    textAlign: "center" 
  },
  heroSubtitle: { 
    fontSize: 18, 
    color: "rgba(255, 255, 255, 0.9)", 
    textAlign: "center", 
    marginTop: 12,
    marginBottom: 20,
  },
  featuresSection: { 
    paddingHorizontal: 20, 
    marginBottom: 40,
    width: "100%",
    maxWidth: 500
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    backgroundColor: "#5E548E",
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
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  actionsSection: { 
    paddingHorizontal: 20, 
    alignItems: "center",
    marginBottom: 30,
    width: "100%",
    maxWidth: 500
  },
  loginButton: {
    backgroundColor: "#E0B1CB",
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
    color: "#231942", 
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
    backgroundColor: "rgba(255, 255, 255, 0.4)" 
  },
  dividerText: { 
    color: "rgba(255, 255, 255, 0.9)", 
    marginHorizontal: 12,
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "#5E548E",
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
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 20
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
});