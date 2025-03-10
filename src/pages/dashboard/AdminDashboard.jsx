import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

function AdminDashboard() {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ institutions: 0, students: 0, events: 0 });

    const urls = [
        'http://localhost:3001/events',
        'http://localhost:3001/another'
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const institutesSnapshot = await getDocs(collection(db, 'institutes'));
                const studentsSnapshot = await getDocs(collection(db, 'users'));
                const eventsSnapshot = await getDocs(collection(db, 'events'));

                setStats({
                    institutions: institutesSnapshot.size,
                    students: studentsSnapshot.size,
                    events: eventsSnapshot.size
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    const handleCrawl = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/crawl', { urls });
            setContent(response.data.contents);

            let allEvents = [];
            response.data.contents.forEach(siteContent => {
                const eventRegex = /<h3>(.*?)<\/h3>.*?<p><strong>Date:<\/strong> (.*?)<\/p>.*?<p><strong>Description:<\/strong> (.*?)<\/p>.*?<p><strong>Location:<\/strong> (.*?)<\/p>/g;
                let match;

                while ((match = eventRegex.exec(siteContent)) !== null) {
                    allEvents.push({
                        name: match[1],
                        date: match[2],
                        description: match[3],
                        location: match[4],
                    });
                }
            });

            setEvents(allEvents);
        } catch (error) {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '20px' }}>
            <h1>Admin Dashboard</h1>

            {/* Display Registered Data */}
            <div style={{
                display: 'flex', justifyContent: 'space-around', padding: '20px',
                backgroundColor: '#f4f4f4', borderRadius: '8px', marginBottom: '20px'
            }}>
                <h3>Institutions: {stats.institutions}</h3>
                <h3>Students: {stats.students}</h3>
                <h3>Events: {stats.events}</h3>
            </div>

            {/* Crawl Button */}
            <button
                onClick={handleCrawl}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    borderRadius: '5px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Crawl Events
            </button>

            {loading && <p>Loading...</p>}

            {/* Crawled Content Display */}
            <div style={{ marginTop: '40px' }}>
                {content.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h2>Crawled Content</h2>
                        {content.map((html, index) => (
                            <div
                                key={index}
                                style={{
                                    border: '1px solid #ccc',
                                    padding: '10px',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '8px',
                                    wordWrap: 'break-word',
                                    maxHeight: '500px',
                                    overflowY: 'scroll',
                                    marginBottom: '20px',
                                }}
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        ))}
                    </div>
                )}

                {/* Display Crawled Events */}
                {events.length > 0 && (
                    <div>
                        <h2>Events Found</h2>
                        <div
                            style={{
                                border: '1px solid #ccc',
                                padding: '20px',
                                backgroundColor: '#f4f4f4',
                                borderRadius: '8px',
                            }}
                        >
                            {events.map((event, index) => (
                                <div key={index} style={{ marginBottom: '20px' }}>
                                    <h3>{event.name}</h3>
                                    <p><strong>Date:</strong> {event.date}</p>
                                    <p><strong>Description:</strong> {event.description}</p>
                                    <p><strong>Location:</strong> {event.location}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
