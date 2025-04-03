import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../firebase";
import { ref as dbRef, get } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./CalendarPopup.css";

const CalendarPopup = ({ isOpen, onClose, onSelectDate }) => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [hoverEvent, setHoverEvent] = useState(null);
  const [reminders, setReminders] = useState({});
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (isOpen && currentUser) {
      console.log("Fetching registered events...");
      fetchRegisteredEvents();
    }
  }, [isOpen, currentUser]);

  const fetchRegisteredEvents = async () => {
    try {
      if (!currentUser) {
        console.log("❌ No user is logged in.");
        return;
      }
      console.log(`✅ Logged in user: ${currentUser.uid}`);

      // Get user document from Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.log("❌ User document not found.");
        return;
      }

      const userData = userDocSnap.data();
      
      // Check if purchasedEvents exists in the user data
      if (!userData.purchasedEvents || !Array.isArray(userData.purchasedEvents) || userData.purchasedEvents.length === 0) {
        console.log("❌ No registered events found.");
        return;
      }

      console.log("✅ Purchased events found:", userData.purchasedEvents);

      // Get existing reminders if any
      const remindersMap = userData.reminders || {};
      setReminders(remindersMap);

      const formattedEvents = userData.purchasedEvents.map((event) => {
        try {
          const eventDate = new Date(event.eventDate);
          console.log(`📅 Processing event: ${event.eventName} on ${eventDate}`);

          return {
            id: event.paymentID, // Use paymentID as a unique identifier
            date: eventDate,
            name: event.eventName,
            time: event.eventTime,
            location: event.eventLocation,
            hasReminder: remindersMap[event.paymentID] || false
          };
        } catch (error) {
          console.error("Error processing event date:", error);
          return null;
        }
      }).filter(Boolean); // Remove any null entries

      setRegisteredEvents(formattedEvents);
      console.log("✅ Final formatted events:", formattedEvents);
    } catch (error) {
      console.error("🚨 Error fetching events:", error);
    }
  };

  const isEventDay = (date) => {
    return registeredEvents.some(
      (event) => event.date.toDateString() === date.toDateString()
    );
  };

  const getEventsForDate = (date) => {
    return registeredEvents.filter(
      (event) => event.date.toDateString() === date.toDateString()
    );
  };

  const handleSetReminder = async (event) => {
    try {
      // Update local state
      const newReminders = {
        ...reminders,
        [event.id]: true
      };
      setReminders(newReminders);
      
      // Update the events list with reminder status
      setRegisteredEvents(
        registeredEvents.map(e => 
          e.id === event.id ? {...e, hasReminder: true} : e
        )
      );
      
      // In a real implementation, you would update this in Firebase
      // For now, just show a confirmation
      alert(`Reminder set for: ${event.name} at ${event.time}`);
    } catch (error) {
      console.error("Error setting reminder:", error);
      alert("Failed to set reminder. Please try again.");
    }
  };

  const handleRemoveReminder = async (event) => {
    try {
      // Update local state
      const newReminders = {...reminders};
      delete newReminders[event.id];
      setReminders(newReminders);
      
      // Update the events list with reminder status
      setRegisteredEvents(
        registeredEvents.map(e => 
          e.id === event.id ? {...e, hasReminder: false} : e
        )
      );
      
      // In a real implementation, you would update this in Firebase
      alert(`Reminder removed for: ${event.name}`);
    } catch (error) {
      console.error("Error removing reminder:", error);
      alert("Failed to remove reminder. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="calendar-modal-overlay">
      <div className="calendar-modal">
        <div className="calendar-modal-header">
          <h2>Your Event Calendar</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="calendar-modal-content">
          <div className="calendar-container">
            <DatePicker
              inline
              onChange={(date) => {
                onSelectDate(date);
                const eventsOnDate = getEventsForDate(date);
                if (eventsOnDate.length > 0) {
                  setHoverEvent(eventsOnDate[0]);
                }
              }}
              highlightDates={registeredEvents.map((event) => event.date)}
              dayClassName={(date) =>
                isEventDay(date) ? "event-day" : undefined
              }
            />
          </div>

          <div className="events-list">
            <h3>Your Registered Events</h3>
            {registeredEvents.length === 0 ? (
              <p className="no-events">No registered events found</p>
            ) : (
              registeredEvents.map((event) => (
                <div className="event-card" key={event.id}>
                  <div className="event-details">
                    <h4>{event.name}</h4>
                    <p>
                      <strong>Date:</strong> {event.date.toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Time:</strong> {event.time}
                    </p>
                    <p>
                      <strong>Location:</strong> {event.location}
                    </p>
                  </div>
                  <div className="event-actions">
                    {event.hasReminder ? (
                      <button
                        onClick={() => handleRemoveReminder(event)}
                        className="remove-reminder-button"
                      >
                        Remove Reminder
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetReminder(event)}
                        className="set-reminder-button"
                      >
                        Set Reminder
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPopup;