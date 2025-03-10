import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export const getEvents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "events")); // Fetch all events
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // Firestore document ID
        eventName: data.eventName || "Unknown Event",
        eventDate: data.eventDate || "N/A",
        eventTime: data.eventTime || "N/A",
        images: data.images || [], // Array of event images
        participantName: data.participantName || "Unknown",
        participantEmail: data.participantEmail || "Unknown",
        registeredUsers: data.registeredUsers || [], // List of registered users
      };
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};
