import React, { useState } from 'react';
import "./college.css";
// import './instagram-theme-styles.css';

const CollegeEventsPage = () => {
  // Sample data of Mumbai engineering colleges and their events
  const [colleges, setColleges] = useState([
    {
      id: 1,
      name: "Veermata Jijabai Technological Institute (VJTI)",
      location: "Matunga, Mumbai",
      events: ["Technovanza", "Pratibimb", "CodeZilla", "Robocon"],
      website: "https://vjti.ac.in",
      highlighted: "Technovanza"
    },
    {
      id: 2,
      name: "Indian Institute of Technology Bombay (IIT-B)",
      location: "Powai, Mumbai",
      events: ["Techfest", "Mood Indigo", "E-Summit", "Techfest"],
      website: "https://www.iitb.ac.in",
      highlighted: "Techfest"
    },
    {
      id: 3,
      name: "Sardar Patel College of Engineering (SPCE)",
      location: "Andheri, Mumbai",
      events: ["Spaces", "Threshold", "Lumina", "Code Wars"],
      website: "https://www.spce.ac.in",
      highlighted: "Spaces"
    },
    {
      id: 4,
      name: "K. J. Somaiya College of Engineering",
      location: "Vidyavihar, Mumbai",
      events: ["Symphony", "Renaissance", "TechXplore", "Abhiyantriki"],
      website: "https://kjsce.somaiya.edu",
      highlighted: "Symphony"
    },
    {
      id: 5,
      name: "Dwarkadas J. Sanghvi College of Engineering",
      location: "Vile Parle, Mumbai",
      events: ["Odyssey", "Pulse", "Synergy", "DJCSI Hackathon"],
      website: "https://www.djsce.ac.in",
      highlighted: "Odyssey"
    },
    {
      id: 6,
      name: "Thadomal Shahani Engineering College (TSEC)",
      location: "Bandra, Mumbai",
      events: ["Zephyr", "Kiran", "Hackathon", "Tech Expo"],
      website: "https://tsec.edu",
      highlighted: "Zephyr"
    },
    {
      id: 7,
      name: "Mukesh Patel School of Technology Management & Engineering",
      location: "Vile Parle, Mumbai",
      events: ["Metanoia", "Techkruti", "Nexus", "Innovex"],
      website: "https://engineering.nmims.edu",
      highlighted: "Metanoia"
    },
    {
      id: 8,
      name: "Fr. Conceicao Rodrigues College of Engineering",
      location: "Bandra, Mumbai",
      events: ["Mosaic", "Crescendo", "Colosseum", "Phoenix"],
      website: "https://www.frcrce.ac.in",
      highlighted: "Mosaic"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(false);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Simulate loading
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  // Handle sort
  const handleSort = (e) => {
    setSortBy(e.target.value);
    // Simulate loading
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  // Filter and sort colleges
  const filteredColleges = colleges
    .filter(college => 
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.highlighted.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "event") {
        return a.highlighted.localeCompare(b.highlighted);
      }
      return 0;
    });

  return (
    <div>
      <header>
        <div className="container">
          <h1>All Institutes</h1>
          <p>Discover top engineering college events across Mumbai</p>
        </div>
      </header>

      <div className="container">
        <div className="search-section">
          <div className="search-row">
            <div className="search-field">
              <input
                type="text"
                placeholder="Search colleges or events..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="filters">
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={handleSort}
              >
                <option value="name">College Name</option>
                <option value="event">Event Name</option>
              </select>
            </div>
          </div>

          {/* <h2>Registered Colleges</h2> */}
          
          {loading ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <>
              {filteredColleges.length > 0 ? (
                <div className="college-grid">
                  {filteredColleges.map(college => (
                    <div key={college.id} className="college-card">
                      <div className="college-header">
                        <h3>{college.name}</h3>
                        <p>{college.location}</p>
                      </div>
                      <div className="college-content">
                        <div>
                          <span className="event-tag">
                            Highlighted Event: {college.highlighted}
                          </span>
                        </div>
                        <h4>All Events:</h4>
                        <ul className="event-list">
                          {college.events.map((event, idx) => (
                            <li key={idx}>
                              <span className="event-dot"></span>
                              <span className={event === college.highlighted ? "event-highlighted" : ""}>
                                {event}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="college-footer">
                          <a 
                            href={college.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="college-link"
                          >
                            Visit College Website
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No colleges found matching your search criteria.</p>
                  <button className="btn btn-primary" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer>
        <div className="container">
          <p className="copyright">© 2025 Mumbai Engineering College Events Portal</p>
          <p className="tagline">Connecting students to the best engineering events across Mumbai</p>
        </div>
      </footer>
    </div>
  );
};

export default CollegeEventsPage;