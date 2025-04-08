import { StyleSheet, Dimensions, StatusBar as RNStatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#231942',
    paddingTop: RNStatusBar.currentHeight,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 195, 252, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(94, 84, 142, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E0C3FC',
    textAlign: 'center',
  },
  viewToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(94, 84, 142, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  eventsContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  eventsHeaderContainer: {
    marginVertical: 16,
  },
  eventsHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E0C3FC',
    marginBottom: 8,
  },
  eventsHeaderLine: {
    height: 2,
    backgroundColor: 'rgba(224, 195, 252, 0.3)',
    width: '40%',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  eventItem: {
    backgroundColor: 'rgba(44, 0, 62, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E0C3FC',
  },
  eventDetails: {
    marginTop: 4,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailIcon: {
    marginRight: 8,
  },
  eventDetailText: {
    fontSize: 15,
    color: '#B799FF',
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noEventsText: {
    fontSize: 18,
    color: 'rgba(224, 195, 252, 0.8)',
    marginTop: 12,
    textAlign: 'center',
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
    padding: 0,
    overflow: 'hidden',
  },
  modalColorStrip: {
    height: 8,
    width: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E0C3FC',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modalDetailIcon: {
    marginRight: 12,
  },
  modalDetailText: {
    fontSize: 16,
    color: '#B799FF',
  },
  modalDescription: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 195, 252, 0.2)',
    marginTop: 8,
    marginBottom: 16,
  },
  modalDescriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0C3FC',
    marginBottom: 8,
  },
  modalDescriptionText: {
    fontSize: 16,
    color: '#B799FF',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: 'rgba(111, 66, 193, 0.8)',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Grid Calendar Styles
  gridCalendarContainer: {
    backgroundColor: 'rgba(30, 10, 60, 0.5)',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 12,
    marginTop: 12,
    paddingBottom: 8,
  },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(111, 66, 193, 0.2)',
  },
  monthNavigatorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(94, 84, 142, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0C3FC',
  },
  weekdayHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 195, 252, 0.2)',
    paddingVertical: 8,
  },
  weekdayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  weekdayHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0C3FC',
  },
  calendarRow: {
    flexDirection: 'row',
    height: 80, // Fixed height for day cells
  },
  dayCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(224, 195, 252, 0.1)',
  },
  otherMonthDay: {
    backgroundColor: 'rgba(30, 10, 60, 0.3)',
  },
  todayCell: {
    backgroundColor: 'rgba(111, 66, 193, 0.15)',
  },
  selectedCell: {
    backgroundColor: 'rgba(111, 66, 193, 0.3)',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E0C3FC',
    marginBottom: 2,
  },
  otherMonthDayText: {
    color: 'rgba(224, 195, 252, 0.4)',
  },
  todayText: {
    fontWeight: '700',
    color: '#B799FF',
  },
  selectedText: {
    fontWeight: '700',
    color: '#E0C3FC',
  },
  dayCellEventsContainer: {
    flex: 1,
  },
  dayCellEvent: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  dayCellEventText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  moreEventsIndicator: {
    paddingHorizontal: 4,
  },
  moreEventsText: {
    fontSize: 9,
    color: '#B799FF',
    fontStyle: 'italic',
  },
});

export default styles;