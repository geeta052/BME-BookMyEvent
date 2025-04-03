import React, { useState, useContext } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "../../context/AuthContext";
import { getDoc, doc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 1: Check the `users` collection
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const accType = userData.accType;
        const displayName = userData.displayName; // Institute Name
        const instituteEmail = userData.email; // Institute Email

        console.log("Account Type:", accType);
        console.log("Display Name (Institute Name):", displayName);

        dispatch({ type: "LOGIN", payload: user });

        if (accType === "student") {
          navigate(`/dashboard/StudentDashboard/${user.uid}`);
        } else if (accType === "admin") {
          navigate(`/admin`);
        } else if (accType === "institute") {
          if (displayName) {
            // Step 2: Fetch Institute Data
            const instituteDocRef = doc(db, "institutes", displayName);
            const instituteDoc = await getDoc(instituteDocRef);

            if (instituteDoc.exists()) {
              console.log("Institute found:", instituteDoc.data());

              // Step 3: Fetch Events Linked to the Institute
              const eventsCollectionRef = collection(db, "events");
              const eventQuery = query(eventsCollectionRef, where("participantEmail", "==", instituteEmail));
              const eventSnapshot = await getDocs(eventQuery);
              const events = eventSnapshot.docs.map(doc => doc.data());

              console.log("Events associated with institute:", events);

              // Step 4: Navigate to Institute Dashboard with Display Name
              navigate(`/dashboard/institute/${displayName}`);
            } else {
              console.error("Institute record not found!");
              setError("Institute record not found. Please contact support.");
            }
          } else {
            setError("Institute name is missing in the user profile.");
          }
        } else {
          setError("Invalid account type.");
        }
      } else {
        setError("User record not found.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="addUser">
      <h3>Login</h3>
      <form className="addUserForm" onSubmit={handleLogin}>
        <div className="inputGroup">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="off"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="off"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </div>
      </form>
      {error && <p className="error-message">{error}</p>}
      <div className="login">
        <p>Don't have an account?</p>
        <Link to="/signup" className="btn btn-success">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Login;
