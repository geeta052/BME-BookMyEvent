import React, { useEffect, useState, useContext } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import { fetchDataAndCluster } from "./recommendation"; // Import clustering function

function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [profilePic, setProfilePic] = useState("");
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [locationRecommendedEvents, setLocationRecommendedEvents] = useState([]); // New state for location-based recommendations
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          images: doc.data().images || [],
        }));
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [currentUser]);

  // Fetch Profile Picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!currentUser) return;

      console.log("Fetching profile picture for UID:", currentUser.uid);

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const studentData = userDocSnap.data().Student;
          if (studentData && studentData.profilePicture) {
            setProfilePic(studentData.profilePicture);
            console.log("Profile Picture URL:", studentData.profilePicture);
          } else {
            console.log("Profile picture not found in Student map.");
            setProfilePic("https://via.placeholder.com/50");
          }
        } else {
          console.log("User document not found.");
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, [currentUser]);

  // Image Slider Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          const updatedImages = [...event.images];
          const firstImage = updatedImages.shift();
          updatedImages.push(firstImage);
          return { ...event, images: updatedImages };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

  // Fetch Location-Based Recommended Events
  useEffect(() => {
    const fetchLocationBasedRecommendations = async () => {
      if (!currentUser) return;

      try {
        const recommendations = await fetchDataAndCluster();
        const studentRecommendations = recommendations.find(rec => rec.studentId === currentUser.uid);
        setLocationRecommendedEvents(studentRecommendations ? studentRecommendations.recommendations : []);
      } catch (error) {
        console.error("Error fetching location-based recommendations:", error);
      }
    };

    fetchLocationBasedRecommendations();
  }, [currentUser]);

  return (
    <div className="dashboard-container">
      {/* Top Header Section */}
      <div className="dashboard-header">
        <img src={profilePic} alt="Profile" className="profile-picture" />
        <button className="registered-events-button" onClick={() => navigate("/registered-events")}>
          View Registered Events
        </button>
      </div>

      <h1 className="dashboard-title">Student Dashboard</h1>

      {/* Available Events Section */}
      <div className="events-container">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="event-card">
              <img
                src={event.images[0] || "https://via.placeholder.com/300"}
                alt="Event Main"
                className="event-main-image"
              />
              <h2 className="event-title">{event.eventName || "No Event Name"}</h2>
              <p className="event-detail"><strong>Participant:</strong> {event.participantName || "No Name"}</p>
              <p className="event-detail"><strong>Date:</strong> {event.eventDate || "No Date"}</p>
              <p className="event-detail"><strong>Time:</strong> {event.eventTime || "No Time"}</p>
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
          <p className="loading-text">No current events</p>
        )}
      </div>

      {/* Recommended Events Section (API-based) */}
      <div className="recommended-events-container">
        <h2>Recommended Events (Based on Preferences)</h2>
        {recommendedEvents.length > 0 ? (
          recommendedEvents.map((event) => (
            <div key={event.id} className="recommended-event-card">
              <h3>{event.eventName}</h3>
              <p><strong>Date:</strong> {event.eventDate || "N/A"}</p>
              <p><strong>Time:</strong> {event.eventTime || "N/A"}</p>
              <img src={event.images[0] || "https://via.placeholder.com/100"} alt={event.eventName} className="recommended-event-image" />
            </div>
          ))
        ) : (
          <p>No recommendations found</p>
        )}
      </div>

      {/* Recommended Events Section (Location-based) */}
      <div className="recommended-events-container">
        <h2>Recommended Events (Near You)</h2>
        {locationRecommendedEvents.length > 0 ? (
          locationRecommendedEvents.map((event) => (
            <div key={event.id} className="recommended-event-card">
              <h3>{event.eventName}</h3>
              <p><strong>Date:</strong> {event.eventDate || "N/A"}</p>
              <p><strong>Time:</strong> {event.eventTime || "N/A"}</p>
              <p><strong>Location:</strong> {event.location || "Unknown"}</p>
              <img src={event.images[0] || "https://via.placeholder.com/100"} alt={event.eventName} className="recommended-event-image" />
            </div>
          ))
        ) : (
          <p>No events near your location</p>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
