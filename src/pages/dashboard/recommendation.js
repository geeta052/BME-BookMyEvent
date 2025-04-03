import { db } from "../../firebase"; // Firebase Config
import { collection, getDocs } from "firebase/firestore";
import { kmeans } from "ml-kmeans"; // K-Means Clustering

// Known location coordinates
const locationCoordinates = {
  Delhi: { lat: 28.6139, lng: 77.209 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
};

// Function to assign an event to the nearest cluster centroid
const assignToCluster = (eventLocation, centroids) => {
  let minDist = Infinity, clusterIndex = -1;
  centroids.forEach((centroid, index) => {
    let dist = Math.sqrt(
      (eventLocation.lat - centroid[0]) ** 2 +
      (eventLocation.lng - centroid[1]) ** 2
    );
    if (dist < minDist) {
      minDist = dist;
      clusterIndex = index;
    }
  });
  return clusterIndex;
};

export const fetchDataAndCluster = async () => {
  try {
    console.log("Fetching students and events...");

    // Fetch student data
    const studentRef = collection(db, "users");
    const studentSnap = await getDocs(studentRef);
    const students = studentSnap.docs.map((doc) => {
      const data = doc.data();
      const studentData = data.Student || {}; // Extract 'Student' map
      const location = studentData.instituteName || "Unknown"; // Use instituteName for location
      return {
        id: doc.id,
        ...studentData,
        location,
        coordinates: locationCoordinates[location] || null,
      };
    });

    console.log("Fetched Students:", students.map(s => ({ id: s.id, location: s.location })));

    // Fetch event data
    const eventRef = collection(db, "events");
    const eventSnap = await getDocs(eventRef);
    const events = eventSnap.docs.map((doc) => {
      const data = doc.data();
      const location = data.location || "Unknown"; // Ensure event location is handled
      return {
        id: doc.id,
        ...data,
        location,
        coordinates: locationCoordinates[location] || null,
      };
    });

    console.log("Fetched Events:", events.length, events);

    // Filter students with valid location data
    const validStudents = students.filter((s) => s.coordinates);
    console.log("Valid Students:", validStudents.length, validStudents);

    if (validStudents.length < 3) {
      console.warn("Not enough student locations for clustering.");
      return [];
    }

    // Extract student locations for clustering
    const studentLocations = validStudents.map((s) => [s.coordinates.lat, s.coordinates.lng]);
    console.log("Student Locations for K-Means:", studentLocations);

    // Apply K-Means Clustering
    const kmeansResult = kmeans(studentLocations, 3);
    console.log("K-Means Result:", kmeansResult);

    // Assign clusters to students
    validStudents.forEach((student, index) => {
      student.cluster = kmeansResult.clusters[index];
    });

    // Filter events with valid location data
    const validEvents = events.filter((event) => event.coordinates);
    console.log("Valid Events:", validEvents.length, validEvents);

    // Manually assign events to the nearest cluster
    validEvents.forEach(event => {
      event.cluster = assignToCluster(event.coordinates, kmeansResult.centroids);
    });

    // Generate recommendations based on clustering
    const recommendations = validStudents.map((student) => {
      const clusterEvents = validEvents.filter(event => event.cluster === student.cluster);
      return { studentId: student.id, recommendations: clusterEvents };
    });

    console.log("Final Recommendations:", recommendations);
    return recommendations;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
