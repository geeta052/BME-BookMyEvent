import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

function InstituteDashboard() {
    const { instituteId } = useParams();
    const navigate = useNavigate();

    const [stats, setStats] = useState({ events: 0, students: 0, revenue: 0 });
    const [events, setEvents] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editEvent, setEditEvent] = useState(null); // Event being edited

    useEffect(() => {
        let isMounted = true;

        const fetchDashboardData = async () => {
            try {
                if (!instituteId || instituteId === ":instituteId") {
                    console.error("Invalid Institute ID:", instituteId);
                    return;
                }

                console.log("Fetching events for Institute Name:", instituteId);

                const eventsSnapshot = await getDocs(collection(db, 'events'));
                let eventList = [];
                let studentList = [];
                let totalRevenue = 0;

                eventsSnapshot.forEach(doc => {
                    const eventData = doc.data();
                    console.log("Event Data:", eventData);

                    if (eventData.participantName === instituteId) {
                        eventList.push({ id: doc.id, ...eventData });

                        let registrations = eventData.registeredUsers ? eventData.registeredUsers.length : 0;
                        let ticketPrice = parseInt(eventData.ticketPrice) || 0;
                        
                        totalRevenue += ticketPrice * registrations;

                        if (eventData.registeredUsers) {
                            eventData.registeredUsers.forEach(user => {
                                studentList.push({
                                    name: user.name || "Unknown",
                                    email: user.email || "Unknown",
                                    eventName: eventData.eventName,
                                    amountPaid: ticketPrice > 0 ? `₹${ticketPrice}` : null,
                                });
                            });
                        }
                    }
                });

                if (isMounted) {
                    console.log("Final Events List:", eventList);
                    console.log("Final Students List:", studentList);
                    console.log("Total Revenue:", totalRevenue);

                    setStats({ events: eventList.length, students: studentList.length, revenue: totalRevenue });
                    setEvents(eventList);
                    setStudents(studentList);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();

        return () => { isMounted = false; };
    }, [instituteId]);

    const handleEditEvent = (event) => {
        setEditEvent({ ...event });
    };

    const handleSaveEvent = async () => {
        if (!editEvent) return;

        try {
            const eventRef = doc(db, 'events', editEvent.id);
            await updateDoc(eventRef, {
                eventName: editEvent.eventName,
                eventDate: editEvent.eventDate,
                eventTime: editEvent.eventTime,
                ticketPrice: editEvent.ticketPrice,
            });

            setEvents(events.map(event => event.id === editEvent.id ? editEvent : event));
            setEditEvent(null);
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    if (!instituteId || instituteId === ":instituteId") {
        return <p style={{ color: 'red', textAlign: 'center' }}>Error: Invalid Institute ID.</p>;
    }

    if (loading) {
        return <p style={{ textAlign: 'center' }}>Loading...</p>;
    }

    return (
        <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Institute Dashboard</h1>
                <button 
                    onClick={() => navigate('/details/eventuploader')}
                    style={{
                        padding: '10px 15px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Create Event
                </button>
            </div>

            <div style={{
                display: 'flex', justifyContent: 'space-around', padding: '20px',
                backgroundColor: '#f4f4f4', borderRadius: '8px', marginBottom: '20px'
            }}>
                <h3>Events Created: {stats.events}</h3>
                <h3>Students Registered: {stats.students}</h3>
                <h3>Revenue Generated: ₹{stats.revenue}</h3>
            </div>

            <h2>Events Created</h2>
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                {events.length === 0 ? <p>No events created yet.</p> : (
                    events.map((event, index) => (
                        <div key={index} style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                            <h3>{event.eventName}</h3>
                            <p><strong>Date:</strong> {event.eventDate}</p>
                            <p><strong>Time:</strong> {event.eventTime || "Not Set"}</p>
                            <p><strong>Ticket Price:</strong> ₹{event.ticketPrice || "Free"}</p>
                            <p><strong>Registrations:</strong> {students.filter(s => s.eventName === event.eventName).length}</p>
                            <button 
                                onClick={() => handleEditEvent(event)}
                                style={{
                                    padding: '5px 10px',
                                    fontSize: '14px',
                                    borderRadius: '5px',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Edit Event
                            </button>
                        </div>
                    ))
                )}
            </div>

            <h2>Registered Students</h2>
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                {students.length === 0 ? <p>No students registered yet.</p> : (
                    students.map((student, index) => (
                        <div key={index} style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                            <p><strong>Name:</strong> {student.name}</p>
                            <p><strong>Event:</strong> {student.eventName}</p>
                            {student.amountPaid && <p><strong>Payment:</strong> {student.amountPaid}</p>}
                        </div>
                    ))
                )}
            </div>

            {/* Edit Event Modal */}
            {editEvent && (
                <div style={{
                    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px'
                    }}>
                        <h2>Edit Event</h2>
                        <label>Event Name:</label>
                        <input 
                            type="text" 
                            value={editEvent.eventName} 
                            onChange={(e) => setEditEvent({ ...editEvent, eventName: e.target.value })} 
                            style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                        />
                        <label>Event Date:</label>
                        <input 
                            type="date" 
                            value={editEvent.eventDate} 
                            onChange={(e) => setEditEvent({ ...editEvent, eventDate: e.target.value })} 
                            style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                        />
                        <label>Event Time:</label>
                        <input 
                            type="time" 
                            value={editEvent.eventTime} 
                            onChange={(e) => setEditEvent({ ...editEvent, eventTime: e.target.value })} 
                            style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                        />
                        <label>Ticket Price:</label>
                        <input 
                            type="number" 
                            value={editEvent.ticketPrice} 
                            onChange={(e) => setEditEvent({ ...editEvent, ticketPrice: e.target.value })} 
                            style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                        />
                        <button onClick={handleSaveEvent} style={{ marginRight: '10px' }}>Save</button>
                        <button onClick={() => setEditEvent(null)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InstituteDashboard;
