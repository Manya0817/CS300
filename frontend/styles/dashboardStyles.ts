import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#231942", // From landing page background
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  // Add these styles to your dashboardStyles.ts file:

notificationsContainer: {
    marginBottom: 30,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  viewAllButtonText: {
    color: '#9333EA',
    fontSize: 14,
    fontWeight: '600',
  },
  unreadAnnouncementCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#9333EA',
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9333EA',
    marginLeft: 8,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add to dashboardStyles.ts
sidebarOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#000',
  zIndex: 998,
},
sidebarContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  width: 300,
  zIndex: 999,
},
  loadingScreenText: {
    marginTop: 20,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeGreeting: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 6,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 18,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (width - 50) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // From landing page
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#5E548E", // From landing page
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff", // Brighter from landing page
  },
  announcementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  announcementCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // From landing page
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  announcementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5E548E", // From landing page
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  announcementBody: {},
  announcementText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)", // From landing page
    lineHeight: 20,
    marginBottom: 10,
  },
  announcementMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  announcementDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)", // From landing page
    marginLeft: 5,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // From landing page
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)", // From landing page
    marginTop: 10,
  },
  collegeInfoContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 10,
  },
  collegeLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5E548E', // From landing page
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  collegeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 5,
  },
  collegeSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)", // From landing page
  },
  gridNotificationBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0B1CB", // From landing page
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});