// Selection.js

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import './AccountTypeRegistration.css'; // Import the CSS file

const Selection = () => {
  const [selectedType, setSelectedType] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const handleSelection = async () => {
    if (selectedType && currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            accType: selectedType,
          });
        } else {
          console.error("User document does not exist.");
        }

        navigate(`/details/${selectedType}`);
      } catch (error) {
        console.error("Error updating user document:", error);
      }
    }
  };

  return (
    <div className="registration-container">
      <h2>Select Your Account Type</h2>
      <div className="radio-group">
        <label className="radio-label">
          <input
            type="radio"
            value="student"
            checked={selectedType === "student"}
            onChange={() => setSelectedType("student")}
            className="radio-input"
          />
          <span className="radio-custom">Student</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            value="admin"
            checked={selectedType === "admin"}
            onChange={() => setSelectedType("admin")}
            className="radio-input"
          />
          <span className="radio-custom">Admin</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            value="institute"
            checked={selectedType === "institute"}
            onChange={() => setSelectedType("institute")}
            className="radio-input"
          />
          <span className="radio-custom">Institute</span>
        </label>
      </div>
      <button
        onClick={handleSelection}
        className="continue-button"
        disabled={!selectedType}
      >
        Continue
      </button>
    </div>
  );
};

export default Selection;
