import React, { useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css"; // Maintaining the same styling

function Recommendap() {
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const navigate = useNavigate();

  // Fetch Recommended Events (API-based)
  useEffect(() => {
    const fetchRecommendedEvents = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userEmail = user.email;

      try {
        const response = await fetch("http://localhost:5000/recommend-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail, eventPreferences: ["Sports", "Technical", "Cultural"] }),
        });

        const data = await response.json();
        setRecommendedEvents(data);
      } catch (error) {
        console.error("Error fetching recommended events:", error);
      }
    };

    fetchRecommendedEvents();
  }, []);

  return (
    <div className="recommended-events-container">
      <h2>Recommended Events (Based on Preferences)</h2>
      {recommendedEvents.length > 0 ? (
        recommendedEvents.map((event) => (
          <div
            key={event.id}
            className="recommended-event-card"
            onClick={() => navigate(`/event/${event.id}`, { state: event })}
            style={{ cursor: "pointer" }} // Makes it clear it's clickable
          >
            <h3>{event.eventName}</h3>
            <p><strong>Date:</strong> {event.eventDate || "N/A"}</p>
            <p><strong>Time:</strong> {event.eventTime || "N/A"}</p>
            <p><strong>Location:</strong> {event.location || "N/A"}</p>
            <img
              src={event.images[0] || "https://via.placeholder.com/100"}
              alt={event.eventName}
              className="recommended-event-image"
            />
          </div>
        ))
      ) : (
        <p>No recommendations found</p>
      )}
    </div>
  );
}

export default Recommendap;