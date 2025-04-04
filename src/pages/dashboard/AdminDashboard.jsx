import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import "./AdminDashboard.css";

function AdminDashboard() {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ institutions: 0, students: 0, events: 0 });
    const [urls, setUrls] = useState([]);

    useEffect(() => {
        const fetchStatsAndUrls = async () => {
            try {
                const institutesSnapshot = await getDocs(collection(db, 'institutes'));
                const studentsSnapshot = await getDocs(collection(db, 'users'));
                const eventsSnapshot = await getDocs(collection(db, 'events'));

                setStats({
                    institutions: institutesSnapshot.size,
                    students: studentsSnapshot.size,
                    events: eventsSnapshot.size
                });

                // Fetch URLs where allowWebCrawling is true
                const q = query(collection(db, 'institutes'), where('allowWebCrawling', '==', true));
                const eligibleInstitutesSnapshot = await getDocs(q);
                const eventLinks = eligibleInstitutesSnapshot.docs
                    .map(doc => doc.data().eventPageLink)
                    .filter(link => link); // Ensure no null/undefined values

                setUrls(eventLinks);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchStatsAndUrls();
    }, []);

    const handleCrawl = async () => {
        if (urls.length === 0) {
            alert('No valid event page links available for crawling.');
            return;
        }

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
        <div className="dashboard-container">
            <h1>Admin Dashboard</h1>
    
            {/* Display Registered Data */}
            <div className="stats-container">
                <h3>Institutions: {stats.institutions}</h3>
                <h3>Students: {stats.students}</h3>
                <h3>Events: {stats.events}</h3>
            </div>
    
            {/* Crawl Button */}
            <button
                onClick={handleCrawl}
                className="crawl-button"
            >
                Crawl Events
            </button>
    
            {loading && <p>Loading...</p>}
    
            {/* Crawled Content Display */}
            <div className="content-section">
                {content.length > 0 && (
                    <div className="crawled-content">
                        <h2>Crawled Content</h2>
                        {content.map((html, index) => (
                            <div
                                key={index}
                                className="crawled-item"
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        ))}
                    </div>
                )}
    
                {/* Display Crawled Events */}
                {events.length > 0 && (
                    <div>
                        <h2>Events Found</h2>
                        <div className="events-container">
                            {events.map((event, index) => (
                                <div key={index} className="event-item">
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
