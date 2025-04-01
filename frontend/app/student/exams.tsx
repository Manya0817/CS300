import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, FileText, Info, Download, ArrowLeft, Calendar, Clock, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function ExamTimetable() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Simulated timetable data (just one file for all years)
  const [timetable, setTimetable] = useState({
    id: '1',
    fileName: 'BTech_Exam_Schedule_All_Years.pdf',
    fileUrl: 'https://example.com/exam-schedule-all-years.pdf',
    lastUpdated: '2025-03-20T14:30:00Z',
    uploadedBy: 'Admin'
  });

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
    // In a real app, fetch the latest data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Open the file
  const handleOpenFile = (fileUrl: string) => {
    console.log('Opening file:', fileUrl);
    // Use Linking API to open the PDF
    Linking.openURL(fileUrl).catch(err => {
      console.error('Error opening URL:', err);
      alert('Could not open the file. Please try again later.');
    });
  };

  // Download the file
  const handleDownloadFile = (fileUrl: string) => {
    console.log('Downloading file:', fileUrl);
    // In a real app, implement file downloading functionality
    Linking.openURL(fileUrl).catch(err => {
      console.error('Error downloading file:', err);
      alert('Could not download the file. Please try again later.');
    });
  };

  // Go back to dashboard
  const handleGoBack = () => {
    router.push('./dashboard');
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
          <Text style={styles.statusText}>Upcoming Exams</Text>
        </View>
        
        {/* Main Timetable Card */}
        <View style={styles.timetableCard}>
          <View style={styles.timetableHeader}>
            <View style={styles.fileCardHeader}>
              <FileText size={20} color="#9333EA" style={styles.fileIcon} />
              <Text style={styles.fileCardTitle}>Exam Schedule PDF</Text>
            </View>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={() => handleDownloadFile(timetable.fileUrl)}
            >
              <Download size={18} color="#9333EA" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.timetableInfo}>
            <View style={styles.filePreview}>
              <Text style={styles.previewText}>PDF</Text>
            </View>
            <View style={styles.timetableDetails}>
              <Text style={styles.timetableFileName}>{timetable.fileName}</Text>
              <View style={styles.lastUpdatedContainer}>
                <Clock size={14} color="#9BA1D0" style={styles.smallInfoIcon} />
                <Text style={styles.lastUpdatedText}>
                  Updated: {formatDate(timetable.lastUpdated)}
                </Text>
              </View>
            </View>
          </View>
  
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => handleOpenFile(timetable.fileUrl)}
          >
            <Text style={styles.viewButtonText}>View Exam Schedule</Text>
          </TouchableOpacity>
        </View>
        
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
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
});