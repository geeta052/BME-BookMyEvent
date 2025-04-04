import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchDataAndCluster } from "../recommendation"; // Import clustering function

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
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2 style={{ textAlign: "center" }}>📍 Recommended Events (Near You)</h2>
      {locationRecommendedEvents.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {locationRecommendedEvents.map((event) => (
            <div
              key={event.id}
              className="recommended-event-card"
              onClick={() => handleEventClick(event)}
              style={{
                cursor: "pointer",
                width: "300px",
                borderRadius: "10px",
                overflow: "hidden",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={event.images?.[0] || "https://via.placeholder.com/300"}
                alt={event.eventName || "Event Image"}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                loading="lazy"
              />
              <div style={{ padding: "10px" }}>
                <h3 style={{ margin: "5px 0" }}>{event.eventName}</h3>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  📅 {event.eventDate || "N/A"} | 🕒 {event.eventTime || "N/A"}
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  📍 {event.location || "Unknown"}
                </p>
                <p style={{ fontWeight: "bold", color: "#5cb85c" }}>
                  📌 Nearby Event
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: "20px", fontStyle: "italic" }}>
          No events near your location
        </p>
      )}
    </div>
  );
  
}

export default RecommendedEvents;