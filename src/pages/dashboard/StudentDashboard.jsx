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
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [profilePic, setProfilePic] = useState("");
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [locationRecommendedEvents, setLocationRecommendedEvents] = useState([]); // State for location-based recommendations
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // Category options
  const categories = [
    { emoji: "🎓", name: "Academic" },
    { emoji: "🎭", name: "Cultural" },
    { emoji: "⚽", name: "Sports" },
    { emoji: "💻", name: "Technology" },
    { emoji: "🎨", name: "Arts" },
    { emoji: "💼", name: "Career" },
    { emoji: "🏆", name: "Competitions" }
  ];

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
        setFilteredEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [currentUser]);

  // Filter events based on selected filters
  useEffect(() => {
    let result = [...events];

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(event => event.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(event => event.status === statusFilter);
    }

    // Apply user type filter
    if (userTypeFilter) {
      result = result.filter(event => event.userType === userTypeFilter);
    }

    // Apply location filter
    if (locationFilter) {
      result = result.filter(event =>
        event.location && event.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === "date") {
      result.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    } else if (sortBy === "price") {
      result.sort((a, b) => parseFloat(a.ticketPrice || 0) - parseFloat(b.ticketPrice || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.eventName.localeCompare(b.eventName));
    }

    setFilteredEvents(result);
  }, [events, categoryFilter, statusFilter, userTypeFilter, locationFilter, sortBy]);

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
          if (!event.images || event.images.length <= 1) return event;

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

  // Get unique locations for location filter dropdown
  const uniqueLocations = [...new Set(events.map(event => event.location).filter(Boolean))];

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
    setUserTypeFilter("");
    setLocationFilter("");
    setSortBy("date");
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar for filters */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Filters</h3>
        </div>

        <div className="sidebar-content">
          <div className="filter-section">
            <h4>Sort By</h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-dropdown"
            >
              <option value="date">Date</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="filter-section">
            <h4>Event Categories</h4>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <h4>Status</h4>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-section">
            <h4>User Type</h4>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="">All Users</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>

          <div className="filter-section">
            <h4>Location</h4>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <button
            className="clear-filters-button"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <button className="filter-toggle" onClick={toggleSidebar}>
              <span className="filter-icon">&#9776;</span> Filters
            </button>
            <div className="active-filters">
              {categoryFilter && <span className="filter-tag">{categories.find(c => c.name === categoryFilter)?.emoji} {categoryFilter}</span>}
              {statusFilter && <span className="filter-tag">Status: {statusFilter}</span>}
              {userTypeFilter && <span className="filter-tag">User: {userTypeFilter}</span>}
              {locationFilter && <span className="filter-tag">Location: {locationFilter}</span>}
              {(categoryFilter || statusFilter || userTypeFilter || locationFilter) &&
                <button className="clear-tag" onClick={clearAllFilters}>Clear All</button>}
            </div>
          </div>
          <h1 className="dashboard-title">🔍 Browse Events</h1>

          <div className="header-right">
            <button className="registered-events-button" onClick={() => navigate("/registered-events")}>
              View Registered Events
            </button>
          </div>
        </div>

        {/* <h1 className="dashboard-title">Browse Events</h1> */}

        {/* Available Events Section */}
        <div className="events-container">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="event-card"
                onClick={() => navigate(`/event/${event.id}`, { state: event })}
                style={{ cursor: 'pointer' }}
              >
                <div className="event-category-tag">
                  {categories.find(cat => cat.name === event.category)?.emoji || "🎪"} {event.category || "Event"}
                </div>
                <img
                  src={event.images[0] || "https://via.placeholder.com/300"}
                  alt="Event Main"
                  className="event-main-image"
                />
                <h2 className="event-title">{event.eventName || "No Event Name"}</h2>
                {/* <p className="event-detail"><strong>Participant:</strong> {event.participantName || "No Name"}</p> */}
                <p className="event-detail"><strong>Date:</strong> {event.eventDate || "No Date"}</p>
                <p className="event-detail"><strong>Time:</strong> {event.eventTime || "No Time"}</p>
                <p className="event-detail"><strong>Location:</strong> {event.location || "No Location"}</p>
                <p className="event-detail"><strong>Ticket Price:</strong> {event.ticketPrice || "Not Available"}</p>
                <p className="event-detail"><strong>Description:</strong> {event.description || "Not Available"}</p>

                <button
                  className="book-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the card's onClick from triggering
                    navigate(`/event/${event.id}`, { state: event });
                  }}
                >
                  Book Now
                </button>
              </div>
            ))
          ) : (
            <p className="no-events-message">No events match your current filters</p>
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
    </div>
  );
}

export default StudentDashboard;