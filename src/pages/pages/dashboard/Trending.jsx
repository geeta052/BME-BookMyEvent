import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const Trending = () => {
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        let eventList = [];

        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          const registeredUsers = eventData.registeredUsers ? Object.values(eventData.registeredUsers) : [];
          const registeredCount = registeredUsers.length;

          eventList.push({
            id: doc.id,
            eventName: eventData.eventName || "Unknown Event",
            eventDate: eventData.eventDate || "Unknown Date",
            eventTime: eventData.eventTime || "Unknown Time",
            ticketPrice: eventData.ticketPrice || "N/A",
            eventLocation: eventData.location || "Unknown Location",
            images: eventData.images || [], // Fetch images array
            registeredCount,
          });
        });

        // Sort events based on the number of registered users in descending order
        eventList.sort((a, b) => b.registeredCount - a.registeredCount);

        // Take only the top 5 events
        const topEvents = eventList.slice(0, 5);
        setTrendingEvents(topEvents);

        // Initialize image index for each event
        const initialIndexes = {};
        topEvents.forEach((event) => {
          initialIndexes[event.id] = 0;
        });
        setImageIndexes(initialIndexes);
      } catch (error) {
        console.error("Error fetching trending events:", error);
      }
    };

    fetchTrendingEvents();
  }, []);

  // Slideshow Logic: Change image for each event every 3 seconds
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setImageIndexes((prevIndexes) => {
        const newIndexes = { ...prevIndexes };
        trendingEvents.forEach((event) => {
          if (event.images.length > 0) {
            newIndexes[event.id] = (prevIndexes[event.id] + 1) % event.images.length;
          }
        });
        return newIndexes;
      });
    }, 3000); // Change images every 3 seconds

    return () => clearInterval(imageInterval);
  }, [trendingEvents]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2 style={{ textAlign: "center" }}>🔥 Trending Events</h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
        {trendingEvents.map((event) => (
          <div
            key={event.id}
            className="recommended-event-card"
            onClick={() => navigate(`/event/${event.id}`, { state: event })}
            style={{
              cursor: "pointer", // Makes it clear it's clickable
              width: "300px",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
              transition: "transform 0.2s ease-in-out",
            }}
          >
            <img
              src={event.images.length > 0 ? event.images[imageIndexes[event.id]] : "https://via.placeholder.com/300"}
              alt={event.eventName}
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
            <div style={{ padding: "10px" }}>
              <h3 style={{ margin: "5px 0" }}>{event.eventName}</h3>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>📅 {event.eventDate} | 🕒 {event.eventTime}</p>
              <p style={{ margin: "5px 0", fontSize: "14px" }}>📍 {event.eventLocation}</p>
              <p style={{ fontWeight: "bold", color: "#d9534f" }}>💰 Ticket Price: ₹{event.ticketPrice}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
