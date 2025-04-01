import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions,
  RefreshControl,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, FileText, Download, Calendar, Clock, ArrowLeft } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

// Mock data for the timetables
const mockTimetables = [
  {
    id: '1',
    semester: 1,
    fileName: 'Semester 1 Timetable.pdf',
    fileUrl: 'https://example.com/timetable1.pdf',
    lastUpdated: '2024-04-15T10:00:00Z'
  },
  {
    id: '2',
    semester: 2,
    fileName: 'Semester 2 Timetable.pdf',
    fileUrl: 'https://example.com/timetable2.pdf',
    lastUpdated: '2024-04-10T10:00:00Z'
  },
  {
    id: '3',
    semester: 3,
    fileName: 'Semester 3 Timetable.pdf',
    fileUrl: 'https://example.com/timetable3.pdf',
    lastUpdated: '2024-04-05T10:00:00Z'
  },
  {
    id: '4',
    semester: 4,
    fileName: 'Semester 4 Timetable.pdf',
    fileUrl: 'https://example.com/timetable4.pdf',
    lastUpdated: '2024-04-01T10:00:00Z'
  },
  {
    id: '5',
    semester: 5,
    fileName: 'Semester 5 Timetable.pdf',
    fileUrl: 'https://example.com/timetable5.pdf',
    lastUpdated: '2024-03-25T10:00:00Z'
  },
  {
    id: '6',
    semester: 6,
    fileName: 'Semester 6 Timetable.pdf',
    fileUrl: 'https://example.com/timetable6.pdf',
    lastUpdated: '2024-03-20T10:00:00Z'
  },
  {
    id: '7',
    semester: 7,
    fileName: 'Semester 7 Timetable.pdf',
    fileUrl: 'https://example.com/timetable7.pdf',
    lastUpdated: '2024-03-15T10:00:00Z'
  },
  {
    id: '8',
    semester: 8,
    fileName: 'Semester 8 Timetable.pdf',
    fileUrl: 'https://example.com/timetable8.pdf',
    lastUpdated: '2024-03-10T10:00:00Z'
  }
];

export default function TimetablePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timetables, setTimetables] = useState<{ id: string; semester: number; fileName: string; fileUrl: string; lastUpdated: string; }[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch timetables (simulated)
  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        // For now, use mock data
        setTimeout(() => {
          setTimetables(mockTimetables);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching timetables:', error);
        setLoading(false);
      }
    };

    fetchTimetables();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, refresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleSemesterSelect = (semester: number | null) => {
    setSelectedSemester(semester);
    setShowSemesterDropdown(false);
  };

  const handleDownload = (fileUrl: string) => {
    // In a real app, this would download the file or open it in a viewer
    Linking.openURL(fileUrl);
  };

  const handleGoBack = () => {
    // Navigate back to the student dashboard
    router.push('./dashboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTimetables = selectedSemester 
    ? timetables.filter(tt => tt.semester === selectedSemester)
    : timetables;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0B132B', '#1C2541']}
        style={styles.background}
      />
      
      {/* Header with Back Button */}
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            accessible={true}
            accessibilityLabel="Go back to dashboard"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Class Timetables</Text>
          <View style={styles.headerIconPlaceholder} />
        </View>
        
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconContainer}>
              <Ionicons name="calendar-outline" size={36} color="#FFFFFF" />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Semester Timetables</Text>
              <Text style={styles.bannerSubtitle}>View & download your class schedules</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
      
      {/* Content Area */}
      <View style={styles.contentContainer}>
        {/* Semester Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Semester:</Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowSemesterDropdown(!showSemesterDropdown)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedSemester ? `Semester ${selectedSemester}` : 'All Semesters'}
            </Text>
            <Ionicons name={showSemesterDropdown ? "chevron-up" : "chevron-down"} size={18} color="#5BC0BE" />
          </TouchableOpacity>
        </View>
        
        {/* Semester Dropdown */}
        {showSemesterDropdown && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleSemesterSelect(null)}
            >
              <Text style={[
                styles.dropdownItemText, 
                selectedSemester === null && styles.dropdownItemTextActive
              ]}>
                All Semesters
              </Text>
              {selectedSemester === null && (
                <Ionicons name="checkmark" size={18} color="#5BC0BE" />
              )}
            </TouchableOpacity>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <TouchableOpacity 
                key={sem}
                style={styles.dropdownItem}
                onPress={() => handleSemesterSelect(sem)}
              >
                <Text style={[
                  styles.dropdownItemText, 
                  selectedSemester === sem && styles.dropdownItemTextActive
                ]}>
                  Semester {sem}
                </Text>
                {selectedSemester === sem && (
                  <Ionicons name="checkmark" size={18} color="#5BC0BE" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Timetable List */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#5BC0BE" />
            <Text style={styles.loaderText}>Loading timetables...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.timetableList}
            contentContainerStyle={styles.timetableListContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#5BC0BE']} 
                tintColor="#5BC0BE"
              />
            }
          >
            {filteredTimetables.length > 0 ? (
              filteredTimetables.map(timetable => (
                <View key={timetable.id} style={styles.timetableCard}>
                  <View style={styles.timetableHeader}>
                    <View style={styles.semesterBadge}>
                      <Text style={styles.semesterBadgeText}>Semester {timetable.semester}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => handleDownload(timetable.fileUrl)}
                    >
                      <Ionicons name="download-outline" size={18} color="#5BC0BE" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.timetableInfo}>
                    <View style={styles.fileIconContainer}>
                      <Ionicons name="document-text-outline" size={26} color="#5BC0BE" />
                    </View>
                    <View style={styles.timetableDetails}>
                      <Text style={styles.timetableFileName}>{timetable.fileName}</Text>
                      <View style={styles.lastUpdatedContainer}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" style={styles.infoIcon} />
                        <Text style={styles.lastUpdatedText}>
                          Updated: {formatDate(timetable.lastUpdated)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleDownload(timetable.fileUrl)}
                  >
                    <Text style={styles.viewButtonText}>View Timetable</Text>
                    <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar" size={60} color="#3A506B" />
                <Text style={styles.emptyStateTitle}>No Timetables Found</Text>
                <Text style={styles.emptyStateText}>
                  {selectedSemester 
                    ? `No timetables available for Semester ${selectedSemester}` 
                    : 'No timetables available yet. Check back later.'}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerIconPlaceholder: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(91, 192, 190, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(58, 80, 107, 0.6)',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  bannerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(91, 192, 190, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#0B132B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: 'rgba(58, 80, 107, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.3)',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: 'rgba(58, 80, 107, 0.9)',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 16,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.3)',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dropdownItemTextActive: {
    color: '#5BC0BE',
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  timetableList: {
    flex: 1,
  },
  timetableListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timetableCard: {
    backgroundColor: 'rgba(28, 37, 65, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.2)',
  },
  timetableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  semesterBadge: {
    backgroundColor: 'rgba(91, 192, 190, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.3)',
  },
  semesterBadgeText: {
    color: '#5BC0BE',
    fontWeight: '600',
    fontSize: 13,
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(91, 192, 190, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.3)',
  },
  timetableInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(91, 192, 190, 0.15)',
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 192, 190, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.3)',
  },
  timetableDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  timetableFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  viewButton: {
    backgroundColor: '#5BC0BE',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  viewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    maxWidth: '80%',
  },
});