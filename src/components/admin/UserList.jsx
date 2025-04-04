// AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { collection, getFirestore, getDocs, deleteDoc, doc } from 'firebase/firestore';
import "./userList.css";

const UserList = ({ app }) => {
  const db = getFirestore(app);

  const [users, setUsers] = useState([]);
  const [connectionsLength, setConnectionsLength] = useState(0);
  const [connectionRequestsLength, setConnectionRequestsLength] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        const usersList = [];
        usersSnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });

        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users data:', error.message);
      }
    };

    const fetchConnections = async () => {
      try {
        const connectionsRef = collection(db, 'connections');
        const connectionsSnapshot = await getDocs(connectionsRef);

        setConnectionsLength(connectionsSnapshot.size);
      } catch (error) {
        console.error('Error fetching connections data:', error.message);
      }
    };

    const fetchConnectionRequests = async () => {
      try {
        const connectionRequestsRef = collection(db, 'connectionRequests');
        const connectionRequestsSnapshot = await getDocs(connectionRequestsRef);

        setConnectionRequestsLength(connectionRequestsSnapshot.size);
      } catch (error) {
        console.error('Error fetching connection requests data:', error.message);
      }
    };

    fetchUsers();
    fetchConnections();
    fetchConnectionRequests();
  }, [db]);

  const handleDeleteUser = async (userId) => {
    try {
      // Delete the user document from the "users" collection
      await deleteDoc(doc(db, 'users', userId));
      console.log('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };

  return (
    <>
      <h1 className="admin-panel-title">Admin Panel</h1>
      <div className="admin-stats-grid">
        <div className="admin-panel-section">
          <h2 className="admin-panel-heading">Total Users</h2>
          <p className="admin-stat">{users.length}</p>
        </div>
        <div className="admin-panel-section">
          <h2 className="admin-panel-heading">Total Connections</h2>
          <p className="admin-stat">{connectionsLength}</p>
        </div>
        <div className="admin-panel-section">
          <h2 className="admin-panel-heading">Total Connection Requests</h2>
          <p className="admin-stat">{connectionRequestsLength}</p>
        </div>
      </div>
      <ul className="admin-user-list">
        {users.map((user) => (
          <li key={user.id} className="admin-user-item">
            <span className="admin-user-name">{user.displayName || user.email}</span>
            <button onClick={() => handleDeleteUser(user.id)} className="admin-delete-btn">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
  

};

export default UserList;
