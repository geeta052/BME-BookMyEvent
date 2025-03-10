import React, { useState, useContext } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "../../context/AuthContext";
import { getDoc, doc } from "firebase/firestore";
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

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const accType = userDoc.data().accType;

        dispatch({ type: "LOGIN", payload: user });

        navigate(`/dashboard/${accType}/${user.uid}`);
      } else {
        setError("User document not found");
      }
    } catch (error) {
      setError(error.message);
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
      {error && <p className="text-red-500 mt-4">{error}</p>}
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
