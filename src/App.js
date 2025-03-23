import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import "./global.css";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Selection from "./pages/selection/Selection";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import EventDetails from "./pages/dashboard/EventDetails"; 
import Eventuploader from "./pages/eventuploader";
import Signup from "./pages/signup/Signup";
import UserDetails from "./pages/home/Userdetails";
import Profile from "./pages/profile/profile";
import UserList from "./components/admin/UserList";
import StudentLoginForm from "./pages/details/student";
import AdminLoginForm from "./pages/details/admin";
import InstituteLoginForm from "./pages/details/InstituteLogin";
import AdminPage from "./pages/dashboard/AdminDashboard";
import RegisteredEvents from "./pages/dashboard/RegisteredEvents";
import Chat from "./pages/Chat"; 
import About from "./pages/about/about";
import College from "./pages/college/college";
import { getEvents } from "./utils/eventService"; // 🔹 Import function to fetch events

function App() {
  const { darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [events, setEvents] = useState([]); // 🔹 Store events data

  // 🔹 Fetch and preprocess events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventData = await getEvents();
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="user-details/:userId" element={<RequireAuth><UserDetails /></RequireAuth>} />
            <Route index element={<Home />} />
            <Route path="dashboard/:dashboardType/:userId" element={<RequireAuth><DashboardRouter /></RequireAuth>} />
            <Route path="selection" element={<RequireAuth><Selection /></RequireAuth>} />
            <Route path="details/student" element={<RequireAuth><StudentLoginForm /></RequireAuth>} />
            <Route path="details/admin" element={<RequireAuth><AdminLoginForm /></RequireAuth>} />
            <Route path="details/eventuploader" element={<RequireAuth><Eventuploader /></RequireAuth>} />
            <Route path="details/institute" element={<RequireAuth><InstituteLoginForm /></RequireAuth>} />
            <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="userlist" element={<RequireAuth><UserList /></RequireAuth>} />
            <Route path="admin-login" element={<AdminLoginForm />} />
            <Route path="admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
            <Route path="event/:id" element={<RequireAuth><EventDetails events={events} /></RequireAuth>} /> {/* 🔹 Pass events to EventDetails */}
            <Route path="registered-events" element={<RequireAuth><RegisteredEvents events={events} /></RequireAuth>} /> {/* 🔹 Pass events to RegisteredEvents */}
            <Route path="chat/:chatRoomId" element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="about" element={<About />} />
            <Route path="college" element={<College />} />


          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const DashboardRouter = () => {
  const { dashboardType } = useParams();

  switch (dashboardType) {
    case 'StudentDashboard':
      return <StudentDashboard />;
    default:
      return <Navigate to="/" />;
  }
};

export default App;
