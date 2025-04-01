import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, ArrowLeft, FileText, AlertTriangle, Info } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const { width } = Dimensions.get('window');

// Define the type for timetable data
interface Timetable {
  id: string;
  semester: string;
  fileUrl: string;
  uploadedAt: string;
  originalFilename?: string;
}

export default function TimetablePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch timetables from Firebase
  const fetchTimetables = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Query Firebase for all timetables
      const timetableRef = collection(db, 'semester-timetables');
      
      const timetableSnapshot = await getDocs(
        query(timetableRef, orderBy('uploadedAt', 'desc'))
      );
      
      if (timetableSnapshot.empty) {
        setTimetables([]);
        setError('No timetables available at this time.');
      } else {
        const timetableList: Timetable[] = [];
        
        timetableSnapshot.forEach((doc) => {
          const data = doc.data();
          timetableList.push({
            id: doc.id,
            semester: data.semester || 'All',
            fileUrl: data.fileUrl,
            uploadedAt: data.uploadedAt,
            originalFilename: data.originalFilename || 'Timetable.pdf'
          });
        });
        
        setTimetables(timetableList);
      }
    } catch (err) {
      console.error('Error fetching timetables:', err);
      setError('Failed to load timetables. Please try again later.');
      setTimetables([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch timetables on component mount
  useEffect(() => {
    fetchTimetables();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTimetables().then(() => {
      setRefreshing(false);
    });
  }, []);

  const handleSemesterSelect = (semester: string | null) => {
    setSelectedSemester(semester);
    setShowSemesterDropdown(false);
  };

  const handleOpenFile = (fileUrl: string) => {
    console.log('Opening file:', fileUrl);
    // Use Linking API to open the PDF
    Linking.openURL(fileUrl).catch(err => {
      console.error('Error opening URL:', err);
      alert('Could not open the file. Please try again later.');
    });
  };

  const handleGoBack = () => {
    // Navigate back to the student dashboard
    router.push('./dashboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Filter timetables based on selected semester
  const filteredTimetables = selectedSemester 
    ? timetables.filter(tt => tt.semester === selectedSemester)
    : timetables;

  // Get all available semesters from data
  const availableSemesters = [...new Set(timetables.map(t => t.semester))].sort();

  // Render timetables
  const renderTimetables = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#5BC0BE" />
          <Text style={styles.loaderText}>Loading timetables...</Text>
        </View>
      );
    }
    
    if (error || timetables.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <AlertTriangle size={40} color="#5BC0BE" />
          <Text style={styles.noDataText}>{error || 'No timetables available'}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredTimetables.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Calendar size={60} color="#3A506B" />
          <Text style={styles.emptyStateTitle}>No Timetables Found</Text>
          <Text style={styles.emptyStateText}>
            {selectedSemester 
              ? `No timetables available for Semester ${selectedSemester}` 
              : 'No timetables available yet. Check back later.'}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => setSelectedSemester(null)}
          >
            <Text style={styles.refreshButtonText}>View All Timetables</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        {filteredTimetables.map((timetable) => (
          <View key={timetable.id} style={styles.timetableCard}>
            <View style={styles.timetableHeader}>
              <View style={styles.fileCardHeader}>
                <FileText size={20} color="#5BC0BE" style={styles.fileIcon} />
                <Text style={styles.fileCardTitle}>
                  {timetable.semester === 'All' 
                    ? 'General Timetable' 
                    : `Semester ${timetable.semester} Timetable`}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.timetableInfo}>
              <View style={styles.filePreview}>
                <Text style={styles.previewText}>PDF</Text>
              </View>
              <View style={styles.timetableDetails}>
                <Text style={styles.timetableFileName}>
                  {timetable.originalFilename || 'Timetable.pdf'}
                </Text>
                <View style={styles.lastUpdatedContainer}>
                  <Clock size={14} color="#9BA1D0" style={styles.smallInfoIcon} />
                  <Text style={styles.lastUpdatedText}>
                    Updated: {formatDate(timetable.uploadedAt)}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => handleOpenFile(timetable.fileUrl)}
            >
              <Text style={styles.viewButtonText}>View Timetable</Text>
            </TouchableOpacity>
          </View>
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0B132B', '#1C2541']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
          accessible={true}
          accessibilityLabel="Go back to dashboard"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Timetables</Text>
        <View style={styles.placeholderView} />
      </View>
      
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5BC0BE']}
            tintColor="#5BC0BE"
          />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Calendar size={20} color="#5BC0BE" />
          </View>
          <Text style={styles.statusText}>Semester Timetables</Text>
        </View>
        
        {/* Semester Filter */}
        {timetables.length > 0 && (
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
                
                {availableSemesters.map((semester) => (
                  <TouchableOpacity 
                    key={semester}
                    style={styles.dropdownItem}
                    onPress={() => handleSemesterSelect(semester)}
                  >
                    <Text style={[
                      styles.dropdownItemText, 
                      selectedSemester === semester && styles.dropdownItemTextActive
                    ]}>
                      {semester === 'All' ? 'General' : `Semester ${semester}`}
                    </Text>
                    {selectedSemester === semester && (
                      <Ionicons name="checkmark" size={18} color="#5BC0BE" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        
        {/* Timetable List */}
        {renderTimetables()}
        
        {/* Help Card */}
        <View style={styles.helpCard}>
          <View style={styles.helpCardContent}>
            <View style={styles.helpIconContainer}>
              <Info size={24} color="#FFFFFF" />
            </View>
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>If you're having trouble viewing the timetable, please contact your department office.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(91, 192, 190, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderView: {
    width: 38,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 192, 190, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(91, 192, 190, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A7D5E4',
  },
  filterContainer: {
    marginBottom: 20,
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
    marginTop: 8,
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
  timetableCard: {
    backgroundColor: 'rgba(28, 37, 65, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.2)',
  },
  timetableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 8,
  },
  fileCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D8EDEF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(91, 192, 190, 0.15)',
    marginBottom: 16,
  },
  timetableInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filePreview: {
    width: 60,
    height: 80,
    backgroundColor: 'rgba(91, 192, 190, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.2)',
    marginRight: 16,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5BC0BE',
  },
  timetableDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  timetableFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F7FAFC',
    marginBottom: 8,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallInfoIcon: {
    marginRight: 6,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#9BA1D0',
  },
  viewButton: {
    backgroundColor: 'rgba(91, 192, 190, 0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.3)',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B7E4E3',
  },
  loaderContainer: {
    backgroundColor: 'rgba(28, 37, 65, 0.6)',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.2)',
    minHeight: 200,
  },
  loaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B7E4E3',
    marginTop: 16,
  },
  noDataContainer: {
    backgroundColor: 'rgba(28, 37, 65, 0.6)',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.2)',
    minHeight: 200,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B7E4E3',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: 'rgba(91, 192, 190, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.3)',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B7E4E3',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(28, 37, 65, 0.6)',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(91, 192, 190, 0.2)',
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
    marginBottom: 20,
    maxWidth: '80%',
  },
  helpCard: {
    backgroundColor: 'rgba(91, 192, 190, 0.25)',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#5BC0BE',
    marginTop: 10,
  },
  helpCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(91, 192, 190, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#D8EDEF',
    lineHeight: 20,
  },
});