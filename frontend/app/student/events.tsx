import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Animated,
  StatusBar as RNStatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, getDay, eachDayOfInterval, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react-native';
import styles from './eventsStyles';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  description: string;
  color: string;
}

const colorOptions = [
  { name: 'blue', color: '#3788d8' },
  { name: 'green', color: '#28a745' },
  { name: 'red', color: '#dc3545' },
  { name: 'orange', color: '#fd7e14' },
  { name: 'purple', color: '#6F42C1' },
  { name: 'pink', color: '#e83e8c' },
  { name: 'teal', color: '#20c997' },
  { name: 'yellow', color: '#ffc107' },
];

const MAX_EVENTS_PREVIEW = 3; // Maximum number of events to show in the grid view
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const { width, height } = Dimensions.get('window');

const EventsScreen = () => {
  const router = useRouter();
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [calendarMode, setCalendarMode] = useState<'calendar' | 'grid'>('grid');
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Subscribe to events from Firestore
  useEffect(() => {
    const eventsCollectionRef = collection(db, 'events');
    const unsubscribe = onSnapshot(
      eventsCollectionRef,
      snapshot => {
        const eventsData = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<EventItem, 'id'>),
        }));
        setEventList(eventsData);
      },
      error => {
        console.error('Error fetching events:', error);
      }
    );
    return unsubscribe;
  }, []);

  // Toggle between calendar and grid view with animation
  const toggleCalendarMode = () => {
    Animated.timing(animatedValue, {
      toValue: calendarMode === 'calendar' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCalendarMode(calendarMode === 'calendar' ? 'grid' : 'calendar');
    });
  };

  // Create marked dates for standard calendar view
  const getMarkedDates = () => {
    const markedDates: any = {};
    
    // Mark selected date
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: '#6F42C1',
      marked: false,
      dots: [],
    };
    
    // Add event markers
    eventList.forEach(event => {
      if (!markedDates[event.date]) {
        markedDates[event.date] = {
          marked: true,
          dots: [
            {
              color: colorOptions.find(c => c.name === event.color)?.color || '#3788d8',
            },
          ],
        };
      } else {
        // For the selected date with events
        if (event.date === selectedDate) {
          markedDates[event.date] = {
            ...markedDates[event.date],
            marked: true,
            selected: true,
            selectedColor: '#6F42C1',
          };
          
          if (!markedDates[event.date].dots) {
            markedDates[event.date].dots = [];
          }
          
          markedDates[event.date].dots.push({
            color: colorOptions.find(c => c.name === event.color)?.color || '#3788d8',
          });
        } 
        // For non-selected dates with events
        else if (markedDates[event.date].dots) {
          markedDates[event.date].dots.push({
            color: colorOptions.find(c => c.name === event.color)?.color || '#3788d8',
          });
        }
      }
    });
    
    return markedDates;
  };

  // Get events for a selected date
  const getEventsForDate = (date: string) => {
    return eventList.filter(event => event.date === date);
  };

  // Handle day selection from calendar
  const onDaySelect = (day: any) => {
    setSelectedDate(day.dateString);
  };

  // Generate grid calendar data
  const generateGridCalendarData = () => {
    const monthStart = startOfMonth(parseISO(`${currentMonth}-01`));
    const monthEnd = endOfMonth(monthStart);
    const startDate = addDays(monthStart, -getDay(monthStart)); // Start from the previous Sunday
    
    const days = eachDayOfInterval({ start: startDate, end: monthEnd });
    const weeksData = [];
    
    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);
      weeksData.push(weekDays);
      
      // Stop when we've included the end of the month
      if (format(weekDays[weekDays.length - 1], 'yyyy-MM') !== format(monthStart, 'yyyy-MM')) {
        if (weekDays.some(day => format(day, 'yyyy-MM') === format(monthStart, 'yyyy-MM'))) {
          continue;
        } else {
          break;
        }
      }
    }
    
    return weeksData;
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const [year, month] = currentMonth.split('-').map(num => parseInt(num));
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth === 0) {
      newMonth = 12;
      newYear--;
    }
    
    const formattedMonth = newMonth < 10 ? `0${newMonth}` : `${newMonth}`;
    setCurrentMonth(`${newYear}-${formattedMonth}`);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(num => parseInt(num));
    let newMonth = month + 1;
    let newYear = year;
    
    if (newMonth === 13) {
      newMonth = 1;
      newYear++;
    }
    
    const formattedMonth = newMonth < 10 ? `0${newMonth}` : `${newMonth}`;
    setCurrentMonth(`${newYear}-${formattedMonth}`);
  };

  // Go back to dashboard
  const handleGoBack = () => {
    router.back();
  };

  // Render a single event item in the list
  const renderEventItem = ({ item }: { item: EventItem }) => {
    const eventColor = colorOptions.find(c => c.name === item.color)?.color || '#3788d8';
    return (
      <TouchableOpacity
        style={[styles.eventItem, { borderLeftColor: eventColor }]}
        onPress={() => {
          setSelectedEvent(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
        </View>
        
        <View style={styles.eventDetails}>
          {item.time && (
            <View style={styles.eventDetailRow}>
              <Clock size={16} color="#B799FF" style={styles.eventDetailIcon} />
              <Text style={styles.eventDetailText}>{item.time}</Text>
            </View>
          )}
          
          {item.location && (
            <View style={styles.eventDetailRow}>
              <MapPin size={16} color="#B799FF" style={styles.eventDetailIcon} />
              <Text style={styles.eventDetailText}>{item.location}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render grid calendar day cell
  const renderDayCell = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const isCurrentMonth = format(date, 'yyyy-MM') === currentMonth;
    const isToday = dateString === format(new Date(), 'yyyy-MM-dd');
    const isSelected = dateString === selectedDate;
    const dayEvents = eventList.filter(event => event.date === dateString);
    const hasEvents = dayEvents.length > 0;
    
    return (
      <TouchableOpacity
        key={dateString}
        style={[
          styles.dayCell,
          !isCurrentMonth && styles.otherMonthDay,
          isToday && styles.todayCell,
          isSelected && styles.selectedCell
        ]}
        onPress={() => setSelectedDate(dateString)}
      >
        <Text style={[
          styles.dayNumber,
          !isCurrentMonth && styles.otherMonthDayText,
          isToday && styles.todayText,
          isSelected && styles.selectedText
        ]}>
          {format(date, 'd')}
        </Text>
        
        {hasEvents && (
          <View style={styles.dayCellEventsContainer}>
            {dayEvents.slice(0, MAX_EVENTS_PREVIEW).map((event, index) => {
              const eventColor = colorOptions.find(c => c.name === event.color)?.color || '#3788d8';
              return (
                <View 
                  key={`${event.id}-${index}`}
                  style={[styles.dayCellEvent, { backgroundColor: eventColor }]}
                >
                  <Text 
                    style={styles.dayCellEventText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {event.title}
                  </Text>
                </View>
              );
            })}
            
            {/* Show indicator for additional events */}
            {dayEvents.length > MAX_EVENTS_PREVIEW && (
              <View style={styles.moreEventsIndicator}>
                <Text style={styles.moreEventsText}>+{dayEvents.length - MAX_EVENTS_PREVIEW} more</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Calendar grid view
  const renderGridCalendar = () => {
    const weeksData = generateGridCalendarData();
    
    return (
      <View style={styles.gridCalendarContainer}>
        {/* Month navigation */}
        <View style={styles.monthNavigator}>
          <TouchableOpacity 
            style={styles.monthNavigatorButton}
            onPress={goToPreviousMonth}
          >
            <ChevronLeft size={20} color="#E0C3FC" />
          </TouchableOpacity>
          
          <Text style={styles.monthYearText}>
            {format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}
          </Text>
          
          <TouchableOpacity 
            style={styles.monthNavigatorButton}
            onPress={goToNextMonth}
          >
            <ChevronRight size={20} color="#E0C3FC" />
          </TouchableOpacity>
        </View>
        
        {/* Weekday headers */}
        <View style={styles.weekdayHeaderRow}>
          {WEEK_DAYS.map((day, index) => (
            <View key={index} style={styles.weekdayHeaderCell}>
              <Text style={styles.weekdayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>
        
        {/* Calendar grid */}
        {weeksData.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.calendarRow}>
            {week.map((day) => renderDayCell(day))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={["#231942", "#5E548E", "#9F86C0"]}
        style={styles.backgroundGradient}
      />
      
      {/* Header with navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <ArrowLeft size={24} color="#E0C3FC" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Events</Text>
        
        <TouchableOpacity 
          style={styles.viewToggleButton}
          onPress={toggleCalendarMode}
        >
          <CalendarIcon size={24} color="#E0C3FC" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar View (Toggle between Grid and Standard) */}
        {calendarMode === 'grid' ? (
          renderGridCalendar()
        ) : (
          <Calendar
            markedDates={getMarkedDates()}
            onDayPress={onDaySelect}
            onMonthChange={(month: { year: number; month: number }) => {
              setCurrentMonth(`${month.year}-${month.month < 10 ? '0' + month.month : month.month}`);
            }}
            theme={{
              calendarBackground: 'rgba(30, 10, 60, 0.5)',
              textSectionTitleColor: '#E0C3FC',
              selectedDayBackgroundColor: '#6F42C1',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#B799FF',
              dayTextColor: '#E0C3FC',
              textDisabledColor: 'rgba(224, 195, 252, 0.4)',
              dotColor: '#E0C3FC',
              selectedDotColor: '#ffffff',
              arrowColor: '#E0C3FC',
              monthTextColor: '#E0C3FC',
              indicatorColor: '#E0C3FC',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            markingType="multi-dot"
            current={`${currentMonth}-01`}
            enableSwipeMonths={true}
          />
        )}
        
        {/* Selected Date Events */}
        <View style={styles.eventsContainer}>
          <View style={styles.eventsHeaderContainer}>
            <Text style={styles.eventsHeaderText}>
              Events for {format(parseISO(selectedDate), 'MMMM d, yyyy')}
            </Text>
            
            <View style={styles.eventsHeaderLine} />
          </View>
          
          {getEventsForDate(selectedDate).length > 0 ? (
            <FlatList
              data={getEventsForDate(selectedDate)}
              renderItem={renderEventItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <CalendarIcon size={40} color="rgba(224, 195, 252, 0.5)" />
              <Text style={styles.noEventsText}>No events for this day</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Event Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedEvent && (
              <>
                <View style={[
                  styles.modalColorStrip,
                  { backgroundColor: colorOptions.find(c => c.name === selectedEvent.color)?.color || '#3788d8' }
                ]} />
                
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                
                <View style={styles.modalDetailRow}>
                  <CalendarIcon size={18} color="#B799FF" style={styles.modalDetailIcon} />
                  <Text style={styles.modalDetailText}>
                    {format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}
                  </Text>
                </View>
                
                {selectedEvent.time && (
                  <View style={styles.modalDetailRow}>
                    <Clock size={18} color="#B799FF" style={styles.modalDetailIcon} />
                    <Text style={styles.modalDetailText}>{selectedEvent.time}</Text>
                  </View>
                )}
                
                {selectedEvent.location && (
                  <View style={styles.modalDetailRow}>
                    <MapPin size={18} color="#B799FF" style={styles.modalDetailIcon} />
                    <Text style={styles.modalDetailText}>{selectedEvent.location}</Text>
                  </View>
                )}
                
                {selectedEvent.description && (
                  <View style={styles.modalDescription}>
                    <Text style={styles.modalDescriptionLabel}>Description</Text>
                    <Text style={styles.modalDescriptionText}>{selectedEvent.description}</Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


export default EventsScreen;