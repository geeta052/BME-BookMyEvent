import React, { useEffect, useState, useContext } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import { FaCalendarAlt } from "react-icons/fa";

// Import components
import Trending from "./student/Trending";
import RecommendedEvents from "./student/RecommendedEvents";
import Recommendap from "./student/Recommendap";
import CalendarPopup from "./CalendarPopup";
import ReminderPopup from "./ReminderPopup";

function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [profilePic, setProfilePic] = useState("");
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [reminderEvent, setReminderEvent] = useState(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // Calendar states
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);

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

  // Fetch User's Registered Events
  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.purchasedEvents && Array.isArray(userData.purchasedEvents)) {
            setRegisteredEvents(userData.purchasedEvents);
            console.log("Registered events fetched:", userData.purchasedEvents);
            
            // Check for reminders
            checkForUpcomingReminders(userData.purchasedEvents, userData.reminders || {});
          } else {
            console.log("No registered events found");
            setRegisteredEvents([]);
          }
        }
      } catch (error) {
        console.error("Error fetching registered events:", error);
      }
    };
    
    fetchRegisteredEvents();
  }, [currentUser]);

  // Check for upcoming reminders
  const checkForUpcomingReminders = (events, reminders) => {
    if (!events || !events.length) return;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find events happening tomorrow that have reminders set
    const upcomingEvents = events.filter(event => {
      if (!event || !event.eventDate) return false;
      
      const eventDate = new Date(event.eventDate);
      const isEventTomorrow = eventDate.getDate() === tomorrow.getDate() && 
                             eventDate.getMonth() === tomorrow.getMonth() && 
                             eventDate.getFullYear() === tomorrow.getFullYear();
      
      return isEventTomorrow && reminders[event.id || event.paymentID];
    });
    
    if (upcomingEvents.length > 0) {
      // Show reminder for the first upcoming event
      setReminderEvent(upcomingEvents[0]);
      setShowReminderPopup(true);
    }
  };

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

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const studentData = userDocSnap.data().Student;
          if (studentData && studentData.profilePicture) {
            setProfilePic(studentData.profilePicture);
          } else {
            setProfilePic("https://via.placeholder.com/50");
          }
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

  // Handle set reminder
  const handleSetReminder = async (eventId) => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      
      // Get the current reminders object or create a new one
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const currentReminders = userData.reminders || {};
      
      // Update the reminders object with the new reminder
      const updatedReminders = {
        ...currentReminders,
        [eventId]: true
      };
      
      // Update the user document with the new reminders object
      await updateDoc(userDocRef, {
        reminders: updatedReminders
      });
      
      alert("Reminder set successfully! You'll be notified one day before the event.");
    } catch (error) {
      console.error("Error setting reminder:", error);
      alert("Failed to set reminder");
    }
  };

  // Handle event click to navigate to event page
  const handleEventClick = (eventId) => {
    // This function is no longer used since we removed the click handler from the card
    if (eventId) {
      navigate(`/event/${eventId}`);
    }
  };

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
    <div className="dashboard-layout-custom">
      {/* Sidebar for filters */}
      <div className={`sidebar-custom ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header-custom">
          <h3>Filters</h3>
        </div>
        
        <div className="sidebar-content-custom">
          <div className="filter-section-custom">
            <h4>Sort By</h4>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-dropdown-custom"
            >
              <option value="date">Date</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </div>
  
          <div className="filter-section-custom">
            <h4>Event Categories</h4>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-dropdown-custom"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
  
          <div className="filter-section-custom">
            <h4>Status</h4>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-dropdown-custom"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
  
          <div className="filter-section-custom">
            <h4>User Type</h4>
            <select 
              value={userTypeFilter} 
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="filter-dropdown-custom"
            >
              <option value="">All Users</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
  
          <div className="filter-section-custom">
            <h4>Location</h4>
            <select 
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-dropdown-custom"
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
            className="clear-filters-button-custom" 
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        </div>
      </div>
  






  
      {/* Main content */}


      <div className={`main-content-custom ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Top Header Section */}
        <div className="dashboard-header-custom">
          <div className="header-left-custom">
            <button className="filter-toggle-custom" onClick={toggleSidebar}>
              <span className="filter-icon-custom">&#9776;</span> Filters
            </button>
            <div className="active-filters-custom">
              {categoryFilter && <span className="filter-tag-custom">{categories.find(c => c.name === categoryFilter)?.emoji} {categoryFilter}</span>}
              {statusFilter && <span className="filter-tag-custom">Status: {statusFilter}</span>}
              {userTypeFilter && <span className="filter-tag-custom">User: {userTypeFilter}</span>}
              {locationFilter && <span className="filter-tag-custom">Location: {locationFilter}</span>}
              {(categoryFilter || statusFilter || userTypeFilter || locationFilter) && 
                <button className="clear-tag-custom" onClick={clearAllFilters}>Clear All</button>}
            </div>
          </div>
          
          <h1 className="dashboard-title-custom"> Browse Events</h1>
          
          <div className="calendar-section-custom">
            <div className="calendar-button-custom" onClick={() => setIsCalendarOpen(true)}>
              <FaCalendarAlt size={20} />
              <span>My Event Calendar</span>
            </div>
          </div>
  
          <div className="header-right-custom">
            <button className="registered-events-button-custom" onClick={() => navigate("/registered-events")}>
              View Registered Events
            </button>
          </div>
        </div>
  
        {/* Events with fixed card structure - removed onClick from the card */}
        <div className="events-container-custom">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div className="event-card-custom" key={event.id}>
                <div className="event-category-tag-custom">
                  {categories.find(cat => cat.name === event.category)?.emoji} {event.category || "Uncategorized"}
                </div>
                
                {event.images && event.images.length > 0 ? (
                  <img 
                    src={event.images[0]} 
                    alt={event.eventName} 
                    className="event-main-image-custom"
                  />
                ) : (
                  <div className="event-placeholder-image-custom">No Image</div>
                )}
                
                <h3 className="event-title-custom">{event.eventName}</h3>
                <p className="event-detail-custom">
                  <strong>Date:</strong> {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "TBD"}
                </p>
                <p className="event-detail-custom">
                  <strong>Time:</strong> {event.eventTime || "TBD"}
                </p>
                <p className="event-detail-custom">
                  <strong>Location:</strong> {event.location || "TBD"}
                </p>
                <p className="event-detail-custom">
                  <strong>Price:</strong> ${event.ticketPrice || "Free"}
                </p>
                
                <button 
                  className="book-button-custom"
                  onClick={() => navigate(`/event/${event.id}`, { state: event })}
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <div className="no-events-message-custom">
              No events found matching your filters. Try adjusting your search criteria.
            </div>
          )}
        </div>
  
        {/* Component sections */}
        <Trending />
        <Recommendap />
        <RecommendedEvents />
      </div>
  
      {/* Calendar Popup */}
      {isCalendarOpen && (
        <CalendarPopup 
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onSelectDate={(date) => setSelectedDate(date)}
          registeredEvents={registeredEvents}
        />
      )}
  
      {/* Reminder Popup */}
      {showReminderPopup && reminderEvent && (
        <ReminderPopup 
          event={reminderEvent}
          onClose={() => setShowReminderPopup(false)}
        />
      )}
    </div>
  );
  
}

export default StudentDashboard;