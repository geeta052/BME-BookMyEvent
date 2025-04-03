import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchDataAndCluster } from "../recommendation"; // Import clustering function
import "./StudentDashboard.css"; // Reusing the same CSS

function RecommendedEvents() {
  const [locationRecommendedEvents, setLocationRecommendedEvents] = useState([]); // State for location-based recommendations
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Location-Based Recommended Events
  useEffect(() => {
    const fetchLocationBasedRecommendations = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const recommendations = await fetchDataAndCluster();
        const studentRecommendations = recommendations.find(rec => rec.studentId === currentUser.uid);
        setLocationRecommendedEvents(studentRecommendations ? studentRecommendations.recommendations : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching location-based recommendations:", error);
        setError("Failed to load nearby events. Please try again later.");
        setLoading(false);
      }
    };

    fetchLocationBasedRecommendations();
  }, [currentUser]);

  // Handle click on event card
  const handleEventClick = (event) => {
    navigate(`/event/${event.id}`, { state: event });
  };

  if (loading) {
    return (
      <div className="recommended-events-container">
        <h2>Recommended Events (Near You)</h2>
        <p>Loading nearby events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommended-events-container">
        <h2>Recommended Events (Near You)</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="recommended-events-container">
      <h2>Recommended Events (Near You)</h2>
      {locationRecommendedEvents.length > 0 ? (
        locationRecommendedEvents.map((event) => (
          <div 
            key={event.id} 
            className="recommended-event-card"
            onClick={() => handleEventClick(event)} 
            style={{ cursor: "pointer" }} // Makes it clear it's clickable
          >
            <h3>{event.eventName}</h3>
            <p><strong>Date:</strong> {event.eventDate || "N/A"}</p>
            <p><strong>Time:</strong> {event.eventTime || "N/A"}</p>
            <p><strong>Location:</strong> {event.location || "Unknown"}</p>
            <img 
              src={event.images[0] || "https://via.placeholder.com/100"} 
              alt={event.eventName} 
              className="recommended-event-image" 
            />
          </div>
        ))
      ) : (
        <p>No events near your location</p>
      )}
    </div>
  );
}

export default RecommendedEvents;