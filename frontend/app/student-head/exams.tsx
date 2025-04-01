import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Info, ArrowLeft, Calendar, Clock, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import path as necessar

const { width } = Dimensions.get('window');

// Define the type for exam schedule data
interface ExamSchedule {
  id: string;
  examType: string;
  batchYear: string;
  fileUrl: string;
  uploadedAt: string;
  originalFilename?: string;
}

export default function ExamTimetable() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch exam schedules from Firebase
  const fetchExamSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Query Firebase for all exam schedules
      const examRef = collection(db, 'exam-schedules');
      
      const examSnapshot = await getDocs(
        query(examRef, orderBy('uploadedAt', 'desc'))
      );
      
      if (examSnapshot.empty) {
        setExamSchedules([]);
        setError('No exam schedules available at this time.');
      } else {
        const schedules: ExamSchedule[] = [];
        
        examSnapshot.forEach((doc) => {
          const data = doc.data();
          schedules.push({
            id: doc.id,
            examType: data.examType || 'General',
            batchYear: data.batchYear || 'All',
            fileUrl: data.fileUrl,
            uploadedAt: data.uploadedAt,
            originalFilename: data.originalFilename || 'Exam_Schedule.pdf'
          });
        });
        
        setExamSchedules(schedules);
      }
    } catch (err) {
      console.error('Error fetching exam schedules:', err);
      setError('Failed to load exam schedules. Please try again later.');
      setExamSchedules([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch exam schedules on component mount
  useEffect(() => {
    fetchExamSchedules();
  }, []);

  // Format date to readable format
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

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExamSchedules().then(() => {
      setRefreshing(false);
    });
  }, []);

  // Get readable exam type
  const getReadableExamType = (examType: string) => {
    switch(examType) {
      case 'MidSemester':
        return 'Mid-Semester Exam';
      case 'EndSemester':
        return 'End-Semester Exam';
      case 'Other':
        return 'Other Exam';
      default:
        return examType;
    }
  };

  // Open the file
  const handleOpenFile = (fileUrl: string) => {
    console.log('Opening file:', fileUrl);
    // Use Linking API to open the PDF
    Linking.openURL(fileUrl).catch(err => {
      console.error('Error opening URL:', err);
      alert('Could not open the file. Please try again later.');
    });
  };

  // Go back to dashboard
  const handleGoBack = () => {
    router.push('./dashboard');
  };

  // Render exam schedules
  const renderExamSchedules = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingText}>Loading exam schedules...</Text>
        </View>
      );
    }
    
    if (error || examSchedules.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <AlertTriangle size={40} color="#9333EA" />
          <Text style={styles.noDataText}>{error || 'No exam schedules available'}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        {examSchedules.map((schedule) => (
          <View key={schedule.id} style={styles.timetableCard}>
            <View style={styles.timetableHeader}>
              <View style={styles.fileCardHeader}>
                <FileText size={20} color="#9333EA" style={styles.fileIcon} />
                <Text style={styles.fileCardTitle}>
                  {getReadableExamType(schedule.examType)}
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
                  {schedule.originalFilename || `Exam_Schedule.pdf`}
                </Text>
                <View style={styles.lastUpdatedContainer}>
                  <Clock size={14} color="#9BA1D0" style={styles.smallInfoIcon} />
                  <Text style={styles.lastUpdatedText}>
                    Updated: {formatDate(schedule.uploadedAt)}
                  </Text>
                </View>
                {schedule.batchYear && schedule.batchYear !== 'All' && (
                  <View style={styles.batchYearContainer}>
                    <Calendar size={14} color="#9BA1D0" style={styles.smallInfoIcon} />
                    <Text style={styles.batchYearText}>
                      For Batch: {schedule.batchYear}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => handleOpenFile(schedule.fileUrl)}
            >
              <Text style={styles.viewButtonText}>View Exam Schedule</Text>
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
        colors={['#1A0536', '#310A5D', '#4B116E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
          accessible={true}
          accessibilityLabel="Go back to dashboard"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam Schedule</Text>
        <View style={styles.placeholderView} />
      </View>
      
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9333EA']}
            tintColor="#9333EA"
          />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Calendar size={20} color="#9333EA" />
          </View>
          <Text style={styles.statusText}>Exam Schedules</Text>
        </View>
        
        {/* Exam Schedules */}
        {renderExamSchedules()}
        
        {/* Important Notice Card */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <AlertTriangle size={20} color="#9333EA" />
            <Text style={styles.noticeTitle}>Important Information</Text>
          </View>
          
          <View style={styles.infoCardContent}>
            <View style={styles.infoCardItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.infoCardText}>
                Exams will be conducted in both online and offline modes as specified in the schedule.
              </Text>
            </View>
            
            <View style={styles.infoCardItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.infoCardText}>
                Students must arrive at least 15 minutes before the exam start time.
              </Text>
            </View>
            
            <View style={styles.infoCardItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.infoCardText}>
                Ensure you have your student ID card for verification.
              </Text>
            </View>
            
            <View style={styles.infoCardItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.infoCardText}>
                For any queries, contact your respective department examination coordinator.
              </Text>
            </View>
          </View>
        </View>
        
        {/* Help Card */}
        <View style={styles.helpCard}>
          <View style={styles.helpCardContent}>
            <View style={styles.helpIconContainer}>
              <Info size={24} color="#FFFFFF" />
            </View>
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>If you're having trouble viewing your exam schedule, please contact the exam department.</Text>
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
    backgroundColor: '#0F0825',
  },
  backgroundGradient: {
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
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
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
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A78BDA',
  },
  timetableCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
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
    color: '#D8BDFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    marginBottom: 16,
  },
  timetableInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filePreview: {
    width: 60,
    height: 80,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
    marginRight: 16,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9333EA',
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
  batchYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  batchYearText: {
    fontSize: 13,
    color: '#9BA1D0',
  },
  smallInfoIcon: {
    marginRight: 6,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#9BA1D0',
  },
  viewButton: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B794F4',
  },
  noticeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F7FAFC',
    marginLeft: 10,
  },
  infoCardContent: {
    paddingHorizontal: 5,
  },
  infoCardItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9333EA',
    marginTop: 7,
    marginRight: 12,
  },
  infoCardText: {
    flex: 1,
    fontSize: 14,
    color: '#B9B9C6',
    lineHeight: 20,
  },
  helpCard: {
    backgroundColor: 'rgba(147, 51, 234, 0.25)',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9333EA',
  },
  helpCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(147, 51, 234, 0.4)',
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
    color: '#D8C4EF',
    lineHeight: 20,
  },
  loaderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B794F4',
    marginTop: 16,
  },
  noDataContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
    minHeight: 200,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B794F4',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B794F4',
  },
});