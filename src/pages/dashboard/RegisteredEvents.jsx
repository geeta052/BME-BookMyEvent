import React, { useEffect, useState, useContext } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, setDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import "./RegisteredEvents.css";

function RegisteredEvents() {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrScanned, setQrScanned] = useState({});
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setRegisteredEvents(userData.purchasedEvents || []);
          setQrScanned(
            userData.purchasedEvents.reduce((acc, event) => {
              acc[event.paymentID] = event.qrScanned || false;
              return acc;
            }, {})
          );
        }
      } catch (error) {
        console.error("Error fetching registered events:", error);
      }
    };

    fetchRegisteredEvents();
  }, [currentUser]);

  const handleEventClick = (event) => {
    if (qrScanned[event.paymentID]) {
      alert("QR Code already used. Entry denied.");
      return;
    }
    setSelectedEvent(event);
  };

  const handleScan = async () => {
    if (!selectedEvent) return;

    const eventId = selectedEvent.paymentID;

    // Mark the QR as scanned
    setQrScanned((prev) => ({ ...prev, [eventId]: true }));

    // Update Firebase
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        let updatedEvents = userDocSnap.data().purchasedEvents.map((ev) =>
          ev.paymentID === eventId
            ? { ...ev, qrScanned: true, entryConfirmed: true } // ✅ Entry Confirmed
            : ev
        );

        await updateDoc(userDocRef, { purchasedEvents: updatedEvents });
      }
    } catch (error) {
      console.error("Error updating QR scan status:", error);
    }
  };

  const joinGroupChat = async (event) => {
    try {
      // First, try to find the actual event ID by querying events collection
      const eventsRef = collection(db, "events");
      const eventQuery = query(eventsRef, where("eventName", "==", event.eventName));
      const eventSnap = await getDocs(eventQuery);
      
      let actualEventId = null;
      
      // If found, use the actual event ID
      if (!eventSnap.empty) {
        actualEventId = eventSnap.docs[0].id;
      } else {
        // If not found, use payment ID as fallback
        actualEventId = event.paymentID;
      }
      
      // Check if chat exists with the actual event ID
      const chatDocRef = doc(db, "chats", actualEventId);
      const chatSnap = await getDoc(chatDocRef);

      // Get user data including displayName from the database
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : {};
      const userDisplayName = userData.displayName || currentUser.displayName || "Anonymous";

      if (!chatSnap.exists()) {
        // Create chat document
        await setDoc(chatDocRef, {
          name: event.eventName,
          description: `Chat for ${event.eventName} participants`,
          eventId: actualEventId,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid,
        });
        
        // Add current user as member
        await setDoc(doc(db, `chats/${actualEventId}/members`, currentUser.uid), {
          userId: currentUser.uid,
          userName: userDisplayName,
          userEmail: currentUser.email,
          photoURL: currentUser.photoURL || null,
          joinedAt: serverTimestamp(),
        });
        
        // Add welcome message
        await addDoc(collection(db, `chats/${actualEventId}/messages`), {
          text: `Welcome to the chat for ${event.eventName}!`,
          senderId: "system",
          senderName: "System",
          isSystemMessage: true,
          timestamp: serverTimestamp()
        });
      }
      
      // Navigate to chat page using the actual event ID
      navigate(`/chat/${actualEventId}`);
    } catch (error) {
      console.error("Error preparing chat:", error);
      alert("Failed to join group chat. Please try again.");
    }
  };

  return (
    <div className="registered-events-container">
      <h1 className="page-title">My Registered Events</h1>
      {registeredEvents.length > 0 ? (
        <div className="events-list">
          {registeredEvents.map((event, index) => (
            <div
              key={index}
              className={`event-card ${qrScanned[event.paymentID] ? "used-qr" : ""}`}
              onClick={() => handleEventClick(event)}
              style={{ cursor: "pointer" }}
            >
              <h2>{event.eventName}</h2>
              <p><strong>Name:</strong> {currentUser.displayName}</p>
              <p><strong>Date:</strong> {event.eventDate}</p>
              <p><strong>Time:</strong> {event.eventTime}</p>
              <p><strong>Location:</strong> {event.eventLocation}</p>
              <p><strong>Price:</strong> ₹{event.ticketPrice}</p>
              {qrScanned[event.paymentID] && <p style={{ color: "red" }}>✅ QR Code Already Used</p>}
              {event.entryConfirmed && <p style={{ color: "green" }}>🎟 Entry Confirmed</p>}

              <div className="qr-section">
                <h3>QR Code for Entry</h3>
                <QRCodeCanvas
                  value={JSON.stringify({
                    name: currentUser.displayName,
                    amountPaid: event.ticketPrice,
                    eventName: event.eventName,
                  })}
                  size={200}
                />
                <br />
                {!qrScanned[event.paymentID] && (
                  <button className="scan-button" onClick={handleScan}>Mark QR as Scanned</button>
                )}
              </div>

              <button 
                className="join-chat-button" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering handleEventClick
                  joinGroupChat(event);
                }}
              >
                Join Group Chat
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-events-text">No registered events found.</p>
      )}

      <button className="back-button" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
}

export default RegisteredEvents;