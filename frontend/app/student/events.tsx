import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { db } from '../../firebase'; // Adjust path to your firebase configuration
import { collection, onSnapshot } from 'firebase/firestore';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  color: string;
}

const colorOptions = [
  { name: 'blue', color: '#3788d8' },
  { name: 'green', color: '#28a745' },
  { name: 'red', color: '#dc3545' },
  { name: 'orange', color: '#fd7e14' },
  { name: 'purple', color: '#6f42c1' },
  { name: 'pink', color: '#e83e8c' },
  { name: 'teal', color: '#20c997' },
  { name: 'yellow', color: '#ffc107' },
];

const EventsView = () => {
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Subscribe to events from Firestore on component mount
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

  // Create marked dates for the calendar
  const getMarkedDates = () => {
    const markedDates: any = {};
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
        markedDates[event.date].dots.push({
          color: colorOptions.find(c => c.name === event.color)?.color || '#3788d8',
        });
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

  // Render a single event item (card) in the list
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
        <Text style={styles.eventTitle}>{item.title}</Text>
        {item.time && <Text style={styles.eventTime}>{item.time}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Events</Text>
      
      <Calendar
        markedDates={getMarkedDates()}
        onDayPress={onDaySelect}
        theme={{
          calendarBackground: '#1E0A3C',
          textSectionTitleColor: '#E0C3FC',
          selectedDayBackgroundColor: '#6F42C1',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#B799FF',
          dayTextColor: '#E0C3FC',
          textDisabledColor: '#555',
          dotColor: '#E0C3FC',
          selectedDotColor: '#ffffff',
          arrowColor: '#E0C3FC',
          monthTextColor: '#E0C3FC',
          indicatorColor: '#E0C3FC',
        }}
        markingType="multi-dot"
      />

      {selectedDate ? (
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsHeaderText}>
            Events for {format(new Date(selectedDate), 'MMM dd, yyyy')}
          </Text>
          {getEventsForDate(selectedDate).length > 0 ? (
            <FlatList
              data={getEventsForDate(selectedDate)}
              renderItem={renderEventItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <Text style={styles.noEventsText}>No events for this day</Text>
          )}
        </View>
      ) : (
        <View style={styles.eventsContainer}>
          <Text style={styles.infoText}>Select a date to view events.</Text>
        </View>
      )}

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
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                <Text style={styles.modalText}>
                  Date: {format(new Date(selectedEvent.date), 'MMM dd, yyyy')}
                </Text>
                {selectedEvent.time && (
                  <Text style={styles.modalText}>Time: {selectedEvent.time}</Text>
                )}
                {selectedEvent.description && (
                  <Text style={styles.modalText}>{selectedEvent.description}</Text>
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
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E0A3C',
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E0C3FC',
    textAlign: 'center',
    marginVertical: 16,
  },
  eventsContainer: {
    marginTop: 16,
    flex: 1,
  },
  eventsHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E0C3FC',
    marginBottom: 8,
    textAlign: 'center',
  },
  eventItem: {
    backgroundColor: '#2C003E',
    borderRadius: 10,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 10,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E0C3FC',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 16,
    color: '#B799FF',
  },
  noEventsText: {
    fontSize: 18,
    color: '#B799FF',
    textAlign: 'center',
    marginTop: 20,
  },
  infoText: {
    fontSize: 18,
    color: '#B799FF',
    textAlign: 'center',
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#2C003E',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E0C3FC',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#B799FF',
    marginBottom: 8,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#6F42C1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default EventsView;
