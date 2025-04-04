import React, { useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import "./Recommendap.css"; 

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
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2 style={{ textAlign: "center" }}>🎯 Recommended Events (Based on Preferences)</h2>
      {recommendedEvents.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {recommendedEvents.map((event) => (
            <div
              key={event.id}
              className="recommended-event-card"
              onClick={() => navigate(`/event/${event.id}`, { state: event })}
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
                  📍 {event.location || "N/A"}
                </p>
                <p style={{ fontWeight: "bold", color: "#0275d8" }}>
                  ⭐ Recommended For You
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: "20px", fontStyle: "italic" }}>No recommendations found</p>
      )}
    </div>
  );
  
}

export default Recommendap;