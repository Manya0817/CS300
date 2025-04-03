import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  FlatList,
  Animated,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { format, parseISO, getDay, eachDayOfInterval, startOfMonth, endOfMonth, addDays } from "date-fns";
import { db } from "../../firebase";

import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, getDocs, writeBatch } from "firebase/firestore";
import { ArrowLeft, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import styles from "./eventsStyles"; // Assuming styles are imported from a separate file

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string; // Will store "startTime - endTime" (e.g., "10:00 AM - 12:00 PM")
  description: string;
  color: string;
}

const colorOptions = [
  { name: "blue", color: "#3788d8" },
  { name: "green", color: "#28a745" },
  { name: "red", color: "#dc3545" },
  { name: "orange", color: "#fd7e14" },
  { name: "purple", color: "#6f42c1" },
  { name: "pink", color: "#e83e8c" },
  { name: "teal", color: "#20c997" },
  { name: "yellow", color: "#ffc107" },
];

const MAX_EVENTS_PREVIEW = 3;
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Events = () => {
  const router = useRouter();
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedColor, setSelectedColor] = useState("blue");
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Subscribe to events from Firestore
  useEffect(() => {
    const eventsCollectionRef = collection(db, "events");
    const unsubscribe = onSnapshot(
      eventsCollectionRef,
      (snapshot) => {
        const eventsData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<EventItem, "id">),
        }));
        setEventList(eventsData);
      },
      (error) => {
        console.error("Error fetching events: ", error);
      }
    );
    return unsubscribe;
  }, []);

  // Get events for a specific date
  const getEventsForDate = (date: string) => {
    return eventList.filter((event) => event.date === date);
  };

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setStartTime("");
    setEndTime("");
    setDescription("");
    setSelectedColor("blue");
  };

  // Function to validate time format (hh:mm AM/PM)
  const isValidTimeFormat = (time: string) => {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
    return timeRegex.test(time);
  };

  const addEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      Alert.alert("Missing Information", "Title, date, start time, and end time are required!");
      return;
    }
  
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      Alert.alert("Invalid Time Format", "Please enter time in format: hh:mm AM/PM (e.g., 10:00 AM)");
      return;
    }
  
    const timeRange = `${startTime} - ${endTime}`;
    const newEvent = { title, date, time: timeRange, description, color: selectedColor };
  
    try {
      // Add the event to Firestore
      const eventRef = await addDoc(collection(db, "events"), newEvent);
  
      // Fetch all users to send notifications
      const users = await fetchAllUsers();
  
      // Prepare notifications for all users
      const batch = writeBatch(db);
      users.forEach((user) => {
        const notificationRef = doc(collection(db, "user-notifications"));
        batch.set(notificationRef, {
          userId: user.id,
          title: "New Event Added",
          body: `Event "${title}" is scheduled on ${date} (${timeRange}).`,
          read: false,
          createdAt: new Date().toISOString(),
          type: "event",
          eventId: eventRef.id, // Link the notification to the event
        });
      });
  
      // Commit the batch operation
      await batch.commit();
  
      setAddModalVisible(false);
      resetForm();
      Alert.alert("Success", "Event added successfully, and notifications sent!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const updateEvent = async () => {
    if (!selectedEvent || !title || !date || !startTime || !endTime) {
      Alert.alert("Missing Information", "Title, date, start time, and end time are required!");
      return;
    }
  
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      Alert.alert("Invalid Time Format", "Please enter time in format: hh:mm AM/PM (e.g., 10:00 AM)");
      return;
    }
  
    const timeRange = `${startTime} - ${endTime}`;
    const updatedData = { title, date, time: timeRange, description, color: selectedColor };
  
    try {
      // Update the event in Firestore
      const eventRef = doc(db, "events", selectedEvent.id);
      await updateDoc(eventRef, updatedData);
  
      // Fetch all users to send notifications
      const users = await fetchAllUsers();
  
      // Prepare notifications for all users
      const batch = writeBatch(db);
      users.forEach((user) => {
        const notificationRef = doc(collection(db, "user-notifications"));
        batch.set(notificationRef, {
          userId: user.id,
          title: "Event Updated",
          body: `The event "${title}" has been updated. It is now scheduled on ${date} (${timeRange}).`,
          read: false,
          createdAt: new Date().toISOString(),
          type: "event",
          eventId: selectedEvent.id, // Link the notification to the updated event
        });
      });
  
      // Commit the batch operation
      await batch.commit();
  
      setIsEditing(false);
      setViewModalVisible(false);
      setSelectedEvent(null);
      Alert.alert("Success", "Event updated successfully, and notifications sent!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };



   const deleteEvent = async () => {
    if (!selectedEvent) return;
  
    try {
      // Delete the event from Firestore
      await deleteDoc(doc(db, "events", selectedEvent.id));
  
      // Fetch all users to send notifications
      const users = await fetchAllUsers();
  
      // Prepare notifications for all users
      const batch = writeBatch(db);
      users.forEach((user) => {
        const notificationRef = doc(collection(db, "user-notifications"));
        batch.set(notificationRef, {
          userId: user.id,
          title: "Event Deleted",
          body: `The event "${selectedEvent.title}" scheduled on ${selectedEvent.date} has been deleted.`,
          read: false,
          createdAt: new Date().toISOString(),
          type: "event",
          eventId: selectedEvent.id, // Link the notification to the deleted event
        });
      });
  
      // Commit the batch operation
      await batch.commit();
  
      setViewModalVisible(false);
      setSelectedEvent(null);
      Alert.alert("Success", "Event deleted successfully, and notifications sent!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Animate modal on open
  useEffect(() => {
    if (addModalVisible || viewModalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [addModalVisible, viewModalVisible]);

  // Prepare form fields for editing
  const handleEdit = (event: EventItem) => {
    setIsEditing(true);
    setTitle(event.title);
    setDate(event.date);
    const [start, end] = event.time.split(" - ");
    setStartTime(start || "");
    setEndTime(end || "");
    setDescription(event.description);
    setSelectedColor(event.color);
    setViewModalVisible(true);
  };

  // Generate grid calendar data
  const generateGridCalendarData = () => {
    const monthStart = startOfMonth(parseISO(`${currentMonth}-01`));
    const monthEnd = endOfMonth(monthStart);
    const startDate = addDays(monthStart, -getDay(monthStart));
    const days = eachDayOfInterval({ start: startDate, end: monthEnd });
    const weeksData = [];
    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);
      weeksData.push(weekDays);
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

  // Navigate months
  const goToPreviousMonth = () => {
    const [year, month] = currentMonth.split('-').map(num => parseInt(num));
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth === 0) { newMonth = 12; newYear--; }
    setCurrentMonth(`${newYear}-${newMonth < 10 ? `0${newMonth}` : newMonth}`);
  };

  const goToNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(num => parseInt(num));
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth === 13) { newMonth = 1; newYear++; }
    setCurrentMonth(`${newYear}-${newMonth < 10 ? `0${newMonth}` : newMonth}`);
  };

  // Render event item
  const renderEventItem = ({ item }: { item: EventItem }) => {
    const eventColor = colorOptions.find((c) => c.name === item.color)?.color || "#3788d8";
    return (
      <TouchableOpacity
        style={[styles.eventItem, { borderLeftColor: eventColor }]}
        onPress={() => {
          setSelectedEvent(item);
          setViewModalVisible(true);
        }}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
        </View>
        {item.time && (
          <View style={styles.eventDetailRow}>
            <Clock size={16} color="#B799FF" style={styles.eventDetailIcon} />
            <Text style={styles.eventDetailText}>{item.time}</Text>
          </View>
        )}
        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>{item.description}</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render grid calendar day cell
  const renderDayCell = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const isCurrentMonth = format(date, 'yyyy-MM') === currentMonth;
    const isToday = dateString === format(new Date(), 'yyyy-MM-dd');
    const isSelected = dateString === selectedDate;
    const dayEvents = getEventsForDate(dateString);
    const hasEvents = dayEvents.length > 0;

    return (
      <TouchableOpacity
        key={dateString}
        style={[
          styles.dayCell,
          !isCurrentMonth && styles.otherMonthDay,
          isToday && styles.todayCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => {
          setSelectedDate(dateString);
          setDate(dateString);
          resetForm();
          setAddModalVisible(true); // Open modal on date click
        }}
      >
        <Text style={[
          styles.dayNumber,
          !isCurrentMonth && styles.otherMonthDayText,
          isToday && styles.todayText,
          isSelected && styles.selectedText,
        ]}>
          {format(date, 'd')}
        </Text>
        {hasEvents && (
          <View style={styles.dayCellEventsContainer}>
            {dayEvents.slice(0, MAX_EVENTS_PREVIEW).map((event, index) => (
              <View
                key={`${event.id}-${index}`}
                style={[styles.dayCellEvent, { backgroundColor: colorOptions.find(c => c.name === event.color)?.color || '#3788d8' }]}
              >
                <Text style={styles.dayCellEventText} numberOfLines={1}>{event.title}</Text>
              </View>
            ))}
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

  // Render grid calendar
  const renderGridCalendar = () => {
    const weeksData = generateGridCalendarData();
    return (
      <View style={styles.gridCalendarContainer}>
        <View style={styles.monthNavigator}>
          <TouchableOpacity style={styles.monthNavigatorButton} onPress={goToPreviousMonth}>
            <ChevronLeft size={20} color="#E0C3FC" />
          </TouchableOpacity>
          <Text style={styles.monthYearText}>{format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}</Text>
          <TouchableOpacity style={styles.monthNavigatorButton} onPress={goToNextMonth}>
            <ChevronRight size={20} color="#E0C3FC" />
          </TouchableOpacity>
        </View>
        <View style={styles.weekdayHeaderRow}>
          {WEEK_DAYS.map((day, index) => (
            <View key={index} style={styles.weekdayHeaderCell}>
              <Text style={styles.weekdayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>
        {weeksData.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.calendarRow}>
            {week.map((day) => renderDayCell(day))}
          </View>
        ))}
      </View>
    );
  };

  const fetchAllUsers = async () => {
    try {
      const usersCollectionRef = collection(db, "users");
      const snapshot = await getDocs(usersCollectionRef);
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { email: string; name: string }),
      }));
      return users;
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#231942", "#5E548E", "#9F86C0"]} style={styles.backgroundGradient} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('./dashboard')}>
          <ArrowLeft size={24} color="#E0C3FC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Events</Text>
        {/* Removed Add button */}
      </View>
      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
        {renderGridCalendar()}
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
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <CalendarIcon size={40} color="rgba(224, 195, 252, 0.5)" />
              <Text style={styles.noEventsText}>No events for this day</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.addEventModalContainer, { opacity: fadeAnim }]}>
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderText}>Add New Event</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Title:</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter event title"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Date:</Text>
                <Text style={styles.dateText}>
                  {date ? format(new Date(date), "MMMM dd, yyyy") : "Select a date"}
                </Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Start Time (format: hh:mm AM/PM):</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="e.g., 10:00 AM"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>End Time (format: hh:mm AM/PM):</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="e.g., 11:00 AM"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description:</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter event details"
                  placeholderTextColor="#aaa"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Color:</Text>
                <View style={styles.colorOptions}>
                  {colorOptions.map((option) => (
                    <TouchableOpacity
                      key={option.name}
                      style={[
                        styles.colorOption,
                        { backgroundColor: option.color },
                        selectedColor === option.name && styles.selectedColorOption,
                      ]}
                      onPress={() => setSelectedColor(option.name)}
                    />
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={addEvent}>
                <Text style={styles.submitButtonText}>Add Event</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* View/Edit Event Modal */}
      <Modal animationType="fade" transparent={true} visible={viewModalVisible} onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            {selectedEvent && !isEditing && (
              <>
                <View style={[styles.modalColorStrip, { backgroundColor: colorOptions.find(c => c.name === selectedEvent.color)?.color || '#3788d8' }]} />
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                <View style={styles.modalDetailRow}>
                  <CalendarIcon size={18} color="#B799FF" style={styles.modalDetailIcon} />
                  <Text style={styles.modalDetailText}>{format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}</Text>
                </View>
                {selectedEvent.time && (
                  <View style={styles.modalDetailRow}>
                    <Clock size={18} color="#B799FF" style={styles.modalDetailIcon} />
                    <Text style={styles.modalDetailText}>{selectedEvent.time}</Text>
                  </View>
                )}
                {selectedEvent.description && (
                  <View style={styles.modalDescription}>
                    <Text style={styles.modalDescriptionLabel}>Description</Text>
                    <Text style={styles.modalDescriptionText}>{selectedEvent.description}</Text>
                  </View>
                )}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.closeViewButton} onPress={() => setViewModalVisible(false)}>
                    <Text style={styles.closeViewButtonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={deleteEvent}>
                    <Text style={styles.deleteButtonText}>Delete Event</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(selectedEvent)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {selectedEvent && isEditing && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderText}>Edit Event</Text>
                  <TouchableOpacity onPress={() => { setIsEditing(false); setViewModalVisible(false); }} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Event Title:</Text>
                    <TextInput
                      style={styles.input}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter event title"
                      placeholderTextColor="#aaa"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Event Date:</Text>
                    <Text style={styles.dateText}>
                      {date ? format(new Date(date), "MMMM dd, yyyy") : "Select a date"}
                    </Text>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Start Time (format: hh:mm AM/PM):</Text>
                    <TextInput
                      style={styles.input}
                      value={startTime}
                      onChangeText={setStartTime}
                      placeholder="e.g., 10:00 AM"
                      placeholderTextColor="#aaa"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>End Time (format: hh:mm AM/PM):</Text>
                    <TextInput
                      style={styles.input}
                      value={endTime}
                      onChangeText={setEndTime}
                      placeholder="e.g., 11:00 AM"
                      placeholderTextColor="#aaa"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Description:</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Enter event details"
                      placeholderTextColor="#aaa"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Event Color:</Text>
                    <View style={styles.colorOptions}>
                      {colorOptions.map((option) => (
                        <TouchableOpacity
                          key={option.name}
                          style={[
                            styles.colorOption,
                            { backgroundColor: option.color },
                            selectedColor === option.name && styles.selectedColorOption,
                          ]}
                          onPress={() => setSelectedColor(option.name)}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.closeViewButton} onPress={() => setIsEditing(false)}>
                      <Text style={styles.closeViewButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={updateEvent}>
                      <Text style={styles.submitButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Events;