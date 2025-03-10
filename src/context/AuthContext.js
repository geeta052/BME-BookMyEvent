import { createContext, useEffect, useReducer, useContext } from "react";
import AuthReducer from "./AuthReducer";
import { auth } from "./firebase";

const INITIAL_STATE = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null,
};
 
export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.currentUser));
  }, [state.currentUser]);

  const logout = async () => {
    try {
      await auth.signOut(); // Sign out using Firebase auth
      dispatch({ type: "LOGOUT" });
     // Dispatch action to update state
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
 

  return (
    <AuthContext.Provider value={{ currentUser: state.currentUser, dispatch,logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
