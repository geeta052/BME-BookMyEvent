import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ReminderPopup.css";

const ReminderPopup = ({ event, onClose }) => {
  const navigate = useNavigate();

  // Close popup when escape key is pressed
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const handleViewEvent = () => {
    if (event.id) {
      navigate(`/event/${event.id}`);
    } else if (event.eventId) {
      navigate(`/event/${event.eventId}`);
    }
    onClose();
  };

  return (
    <div className="reminder-overlay">
      <div className="reminder-popup">
        <div className="reminder-header">
          <div className="reminder-icon">⏰</div>
          <h2>Event Reminder</h2>
          <button className="reminder-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="reminder-content">
          <h3>{event.eventName}</h3>
          <p><strong>Tomorrow:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {event.eventTime}</p>
          <p><strong>Location:</strong> {event.eventLocation || event.location}</p>
          
          <div className="reminder-message">
            Don't forget! You have this event scheduled for tomorrow.
          </div>
        </div>
        
        <div className="reminder-actions">
          <button className="reminder-dismiss-btn" onClick={onClose}>
            Dismiss
          </button>
          <button className="reminder-view-btn" onClick={handleViewEvent}>
            View Event Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderPopup;