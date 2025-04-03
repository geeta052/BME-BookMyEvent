import React from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css"; // Maintaining the same styling

function Events({ filteredEvents, categories }) {
  const navigate = useNavigate();

  return (
    <div className="events-container">
      {filteredEvents.length > 0 ? (
        filteredEvents.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-category-tag">
              {categories.find(cat => cat.name === event.category)?.emoji || "🎪"} {event.category || "Event"}
            </div>
            <img
              src={event.images[0] || "https://via.placeholder.com/300"}
              alt="Event Main"
              className="event-main-image"
            />
            <h2 className="event-title">{event.eventName || "No Event Name"}</h2>
            <p className="event-detail"><strong>Participant:</strong> {event.participantName || "No Name"}</p>
            <p className="event-detail"><strong>Date:</strong> {event.eventDate || "No Date"}</p>
            <p className="event-detail"><strong>Time:</strong> {event.eventTime || "No Time"}</p>
            <p className="event-detail"><strong>Location:</strong> {event.location || "No Location"}</p>
            <p className="event-detail"><strong>Ticket Price:</strong> {event.ticketPrice || "Not Available"}</p>

            <button
              className="book-button"
              onClick={() => navigate(`/event/${event.id}`, { state: event })}
            >
              Book Now
            </button>
          </div>
        ))
      ) : (
        <p className="no-events-message">No events match your current filters</p>
      )}
    </div>
  );
}

export default Events;