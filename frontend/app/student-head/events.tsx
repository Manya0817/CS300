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
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { db } from "../../firebase"; // Ensure this points to your Firebase configuration
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
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

const events = () => {
  // Use different state names to avoid conflict with the component name
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedColor, setSelectedColor] = useState("blue");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipEvent, setTooltipEvent] = useState<EventItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Form state for add & edit
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  // Flag to indicate if the view modal is in edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tooltipFadeAnim = useRef(new Animated.Value(0)).current;

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

  // Format calendar marked dates
  const getMarkedDates = () => {
    const markedDates: any = {};

    eventList.forEach((event) => {
      if (!markedDates[event.date]) {
        markedDates[event.date] = {
          marked: true,
          dots: [
            {
              color:
                colorOptions.find((c) => c.name === event.color)?.color ||
                "#3788d8",
            },
          ],
        };
      } else {
        markedDates[event.date].dots.push({
          color:
            colorOptions.find((c) => c.name === event.color)?.color ||
            "#3788d8",
        });
      }
    });

    return markedDates;
  };

  // Get events for a specific date
  const getEventsForDate = (date: string) => {
    return eventList.filter((event) => event.date === date);
  };

  // Handle date selection
  const handleDateSelect = (day: any) => {
    const dateStr = day.dateString;
    setSelectedDate(dateStr);

    const dateEvents = getEventsForDate(dateStr);
    if (dateEvents.length > 0) {
      // If there are events, simply display them
    } else {
      setDate(dateStr);
      resetForm();
      setAddModalVisible(true);
    }
  };

  // Double tap tracking
  const lastTap = useRef(0);
  const handleDatePress = (day: any) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      setDate(day.dateString);
      resetForm();
      setAddModalVisible(true);
    }
    lastTap.current = now;
  };

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setTime("");
    setDescription("");
    setSelectedColor("blue");
  };

  // Add a new event to Firestore
  const addEvent = async () => {
    if (!title || !date) {
      Alert.alert("Error", "Title and date are required!");
      return;
    }

    const newEvent = {
      title,
      date,
      time,
      description,
      color: selectedColor,
    };

    try {
      await addDoc(collection(db, "events"), newEvent);
      setAddModalVisible(false);
      resetForm();
      Alert.alert("Success", "Event added successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Update an existing event in Firestore
  const updateEvent = async () => {
    if (!selectedEvent) return;
    if (!title || !date) {
      Alert.alert("Error", "Title and date are required!");
      return;
    }
    const updatedData = {
      title,
      date,
      time,
      description,
      color: selectedColor,
    };

    try {
      const eventRef = doc(db, "events", selectedEvent.id);
      await updateDoc(eventRef, updatedData);
      setIsEditing(false);
      setViewModalVisible(false);
      setSelectedEvent(null);
      Alert.alert("Success", "Event updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Delete event from Firestore
  const deleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await deleteDoc(doc(db, "events", selectedEvent.id));
      setViewModalVisible(false);
      setSelectedEvent(null);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Show event tooltip
  const showTooltip = (event: EventItem, x: number, y: number) => {
    setTooltipEvent(event);
    setTooltipPosition({ x, y });
    setTooltipVisible(true);

    Animated.timing(tooltipFadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => hideTooltip(), 3000);
  };

  // Hide tooltip
  const hideTooltip = () => {
    Animated.timing(tooltipFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTooltipVisible(false);
      setTooltipEvent(null);
    });
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

  // Prepare form fields for editing when opening view modal
  const handleEdit = (event: EventItem) => {
    setIsEditing(true);
    setTitle(event.title);
    setDate(event.date);
    setTime(event.time);
    setDescription(event.description);
    setSelectedColor(event.color);
  };

  // Render event item in the list
  const renderEventItem = ({ item }: { item: EventItem }) => {
    const eventColor =
      colorOptions.find((c) => c.name === item.color)?.color || "#3788d8";

    return (
      <TouchableOpacity
        style={[styles.eventItem, { borderLeftColor: eventColor }]}
        onPress={() => {
          setSelectedEvent(item);
          setViewModalVisible(true);
        }}
        onLongPress={(e) => {
          const { pageX, pageY } = e.nativeEvent;
          showTooltip(item, pageX, pageY - 100);
        }}
      >
        <View style={styles.eventItemContent}>
          <View style={styles.eventItemHeader}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <View style={[styles.colorDot, { backgroundColor: eventColor }]} />
          </View>
          {item.time ? <Text style={styles.eventTime}>{item.time}</Text> : null}
          {item.description ? (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📅 My Colorful Event Calendar</Text>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={getMarkedDates()}
          onDayPress={handleDateSelect}
          onDayLongPress={handleDatePress}
          theme={{
            calendarBackground: "#2C003E",
            textSectionTitleColor: "#E0C3FC",
            selectedDayBackgroundColor: "#6F42C1",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#B799FF",
            dayTextColor: "#E0C3FC",
            textDisabledColor: "#555",
            dotColor: "#E0C3FC",
            selectedDotColor: "#ffffff",
            arrowColor: "#E0C3FC",
            monthTextColor: "#E0C3FC",
            indicatorColor: "#E0C3FC",
          }}
          markingType="multi-dot"
        />
      </View>

      {/* Events for selected date */}
      {selectedDate ? (
        <View style={styles.eventsContainer}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsHeaderText}>
              Events for {format(new Date(selectedDate), "MMM dd, yyyy")}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setDate(selectedDate);
                resetForm();
                setAddModalVisible(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {getEventsForDate(selectedDate).length > 0 ? (
            <FlatList
              data={getEventsForDate(selectedDate)}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              style={styles.eventsList}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>No events for this day</Text>
              <Text style={styles.noEventsSubtext}>
                Tap "Add" to create a new event
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {/* Add Event Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Add New Event</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.closeButton}
              >
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
                  {date
                    ? format(new Date(date), "MMMM dd, yyyy")
                    : "Select a date"}
                </Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Time:</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="Ex: 10:00 AM"
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
                        selectedColor === option.name &&
                          styles.selectedColorOption,
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={viewModalVisible}
        onRequestClose={() => {
          setViewModalVisible(false);
          setIsEditing(false);
        }}
      >
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            {selectedEvent && !isEditing && (
              <>
                <View
                  style={[
                    styles.modalHeader,
                    {
                      borderTopWidth: 6,
                      borderTopColor:
                        colorOptions.find((c) => c.name === selectedEvent.color)
                          ?.color || "#3788d8",
                    },
                  ]}
                >
                  <Text style={styles.modalHeaderText}>Event Details</Text>
                  <TouchableOpacity
                    onPress={() => setViewModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalContent}>
                  <View style={styles.eventDetailRow}>
                    <Text style={styles.eventDetailLabel}>Title:</Text>
                    <Text style={styles.eventDetailValue}>
                      {selectedEvent.title}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Text style={styles.eventDetailLabel}>Date:</Text>
                    <Text style={styles.eventDetailValue}>
                      {format(new Date(selectedEvent.date), "MMMM dd, yyyy")}
                    </Text>
                  </View>
                  {selectedEvent.time && (
                    <View style={styles.eventDetailRow}>
                      <Text style={styles.eventDetailLabel}>Time:</Text>
                      <Text style={styles.eventDetailValue}>
                        {selectedEvent.time}
                      </Text>
                    </View>
                  )}
                  <View style={styles.eventDetailRow}>
                    <Text style={styles.eventDetailLabel}>Description:</Text>
                    <Text style={styles.eventDetailValue}>
                      {selectedEvent.description || "No description provided"}
                    </Text>
                  </View>
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.closeViewButton}
                      onPress={() => {
                        setViewModalVisible(false);
                        setIsEditing(false);
                        setSelectedEvent(null);
                      }}
                    >
                      <Text style={styles.closeViewButtonText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={deleteEvent}
                    >
                      <Text style={styles.deleteButtonText}>Delete Event</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(selectedEvent)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
            {selectedEvent && isEditing && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderText}>Edit Event</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setViewModalVisible(false);
                      setSelectedEvent(null);
                    }}
                    style={styles.closeButton}
                  >
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
                      {date
                        ? format(new Date(date), "MMMM dd, yyyy")
                        : "Select a date"}
                    </Text>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Event Time:</Text>
                    <TextInput
                      style={styles.input}
                      value={time}
                      onChangeText={setTime}
                      placeholder="Ex: 10:00 AM"
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
                            selectedColor === option.name &&
                              styles.selectedColorOption,
                          ]}
                          onPress={() => setSelectedColor(option.name)}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.closeViewButton}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={styles.closeViewButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={updateEvent}
                    >
                      <Text style={styles.submitButtonText}>
                        Save Changes
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Tooltip */}
      {tooltipVisible && tooltipEvent && (
        <Animated.View
          style={[
            styles.tooltip,
            {
              left: tooltipPosition.x - 150,
              top: tooltipPosition.y,
              opacity: tooltipFadeAnim,
            },
          ]}
        >
          <Text style={styles.tooltipTitle}>{tooltipEvent.title}</Text>
          <Text style={styles.tooltipDate}>
            {format(new Date(tooltipEvent.date), "MMM dd")}
            {tooltipEvent.time ? ` at ${tooltipEvent.time}` : ""}
          </Text>
          {tooltipEvent.description && (
            <Text style={styles.tooltipDescription} numberOfLines={2}>
              {tooltipEvent.description}
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E0A3C",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#E0C3FC",
  },
  calendarContainer: {
    backgroundColor: "#2C003E",
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  eventsContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    flex: 1,
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventsHeaderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#E0C3FC",
  },
  addButton: {
    backgroundColor: "#6F42C1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    backgroundColor: "#291A3F",
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  eventItemContent: {
    flex: 1,
  },
  eventItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E0C3FC",
    flex: 1,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  eventTime: { fontSize: 16, color: "#B799FF", marginBottom: 4 },
  eventDescription: { fontSize: 16, color: "#B799FF" },
  noEventsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#B799FF",
  },
  noEventsSubtext: {
    fontSize: 16,
    color: "#B799FF",
    marginTop: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#2C003E",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    backgroundColor: "#3B0A45",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#6F42C1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E0C3FC",
  },
  closeButton: { padding: 5 },
  closeButtonText: {
    fontSize: 24,
    color: "#aaa",
    fontWeight: "bold",
  },
  modalContent: { padding: 15 },
  formGroup: { marginBottom: 15 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E0C3FC",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#3B0A45",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#6F42C1",
    fontSize: 16,
    color: "#E0C3FC",
  },
  textArea: { height: 100 },
  dateText: {
    fontSize: 16,
    color: "#E0C3FC",
    paddingVertical: 10,
    backgroundColor: "#3B0A45",
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#6F42C1",
  },
  colorOptions: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#E0C3FC",
    transform: [{ scale: 1.2 }],
  },
  submitButton: {
    backgroundColor: "#6F42C1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  eventDetailRow: {
    flexDirection: "row",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#6F42C1",
  },
  eventDetailLabel: {
    width: 100,
    fontSize: 16,
    fontWeight: "600",
    color: "#E0C3FC",
  },
  eventDetailValue: { flex: 1, fontSize: 16, color: "#B799FF" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  closeViewButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  closeViewButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  deleteButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  editButton: {
    backgroundColor: "#ffc107",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  editButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  tooltip: {
    position: "absolute",
    width: 300,
    backgroundColor: "rgba(44, 0, 62, 0.95)",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#6F42C1",
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E0C3FC",
    marginBottom: 4,
  },
  tooltipDate: { fontSize: 14, color: "#B799FF", marginBottom: 4 },
  tooltipDescription: { fontSize: 14, color: "#B799FF" },
});

export default events;
