import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import "./EventDetails.css";

function EventDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state;
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };
    fetchUserData();
  }, []);

  // Slideshow Effect
  useEffect(() => {
    if (!event?.images || event.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % event.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [event?.images]);

  if (!event) {
    return <p>Event not found!</p>;
  }

  const handlePayment = async () => {
    try {
      const { data } = await axios.post("http://localhost:5000/create-order", {
        amount: event.ticketPrice,
      });

      const options = {
        key: "rzp_test_ql7KkMWOl3vfDP",
        amount: data.amount,
        currency: "INR",
        name: event.eventName,
        description: "Ticket Booking",
        order_id: data.id,
        handler: async function (response) {
          const currentUser = auth.currentUser;
          if (!currentUser || !userData) {
            alert("Please log in first!");
            return;
          }

          const ticketData = {
            name: userData.name || "Unknown",
            email: currentUser.email,
            institution: userData.institution || "Unknown",
            paymentID: response.razorpay_payment_id,
            eventName: event.eventName,
            ticketPrice: event.ticketPrice,
            eventDate: event.eventDate,
            eventTime: event.eventTime,
            eventLocation: event.location || "N/A",
          };

          try {
            // Update the event's registered users list with student's name
            await updateDoc(doc(db, "events", event.id), {
              registeredUsers: arrayUnion(ticketData),
            });

            // Save event details inside the existing users collection
            await updateDoc(doc(db, "users", currentUser.uid), {
              purchasedEvents: arrayUnion(ticketData),
            });

            setPaymentSuccess(true);
          } catch (error) {
            console.error("Error saving payment details:", error);
            alert("Payment successful, but data saving failed.");
          }
        },
        prefill: {
          name: userData?.name || "Student Name",
          email: auth.currentUser?.email || "example@email.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed!");
    }
  };

  return (
    <div className="event-details-container">
      <h1 className="event-title">{event.eventName}</h1>

      {/* Slideshow */}
      {event.images && event.images.length > 0 && (
        <img
          src={event.images[currentImageIndex]}
          alt="Event"
          className="event-image"
        />
      )}

      <p>
        <strong>Participant:</strong> {event.participantName || "N/A"}
      </p>
      <p>
        <strong>Date:</strong> {event.eventDate || "N/A"}
      </p>
      <p>
        <strong>Time:</strong> {event.eventTime || "N/A"}
      </p>
      <p>
        <strong>Ticket Price:</strong> ₹{event.ticketPrice || "N/A"}
      </p>
      <p>
        <strong>Description:</strong> {event.description || "No description available"}
      </p>

      {paymentSuccess ? (
        <p className="ticket-purchased">🎉 Ticket Purchased! 🎟️</p>
      ) : (
        <div className="button-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            Go Back
          </button>
          <button className="book-now-button" onClick={handlePayment}>
            Book Now
          </button>
        </div>
      )}
    </div>
  );
}

export default EventDetails;
