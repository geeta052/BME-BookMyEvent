import React, { useState, useContext } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import "./signup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
      });

      dispatch({ type: "LOGIN", payload: user });
      navigate("/selection");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="addUser">
      <h3>Sign Up</h3>
      <form className="addUserForm" onSubmit={handleSignup}>
        <div className="inputGroup">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="off"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
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
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="conpassword">Confirm Password:</label>
          <input
            type="password"
            id="conpassword"
            name="conpassword"
            autoComplete="off"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <button type="submit" className="btn btn-success" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </div>
      </form>
      <div className="login">
        <p>Already have an Account?</p>
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Signup;
