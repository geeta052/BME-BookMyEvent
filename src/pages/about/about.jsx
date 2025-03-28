
import React from "react";
import { Link } from "react-router-dom";
import "./about.css"; // We'll use a separate CSS file that matches the Instagram theme

function About() {
  // Founder data
  const founders = [
    {
      id: 1,
      name: "Geeta Medtiya",
      role: "CEO & Co-Founder",
      bio: "Geeta brings over 10 years of experience in event planning and community building. She previously led campus engagement at Stanford University before co-founding our platform to connect students with meaningful events.",
      image: "https://via.placeholder.com/400/d6249f/ffffff?text=AC", // Using placeholder with Instagram pink
      social: {
        linkedin: "https://linkedin.com/in/alexandra-chen",
        twitter: "https://twitter.com/alexchen",
        instagram: "https://instagram.com/alex.chen"
      }
    },
    {
      id: 2,
      name: "Ninad Kangandul",
      role: "CTO & Co-Founder",
      bio: "NInad is a full-stack developer with a passion for creating intuitive user experiences. With a background in computer science from MIT, he leads our technical development and ensures our platform runs smoothly.",
      image: "https://via.placeholder.com/400/6659c7/ffffff?text=MJ", // Using placeholder with Instagram purple
      social: {
        linkedin: "https://linkedin.com/in/marcus-johnson",
        twitter: "https://twitter.com/marcusjohnson",
        github: "https://github.com/mjohnson"
      }
    },
    {
      id: 3,
      name: "Revati Chaudhari",
      role: "Head of Design & Co-Founder",
      bio: "Revati is a UX/UI designer who believes in creating beautiful, accessible designs. Her background in psychology and human-computer interaction helps us build interfaces that students love to use.",
      image: "https://via.placeholder.com/400/bc1888/ffffff?text=PS", // Using placeholder with Instagram magenta
      social: {
        linkedin: "https://linkedin.com/in/priya-sharma",
        instagram: "https://instagram.com/priya.designs",
        behance: "https://behance.net/priyasharma"
      }
    },
    {
      id: 4,
      name: "Krish Modi",
      role: "COO & Co-Founder",
      bio: "Krish oversees our operations and partnerships. With experience in both academic administration and startup environments, he ensures that our platform meets the diverse needs of campus communities.",
      image: "https://via.placeholder.com/400/e6683c/ffffff?text=DW", // Using placeholder with Instagram orange
      social: {
        linkedin: "https://linkedin.com/in/david-wilson",
        twitter: "https://twitter.com/davidwilson",
        instagram: "https://instagram.com/david_wilson"
      }
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>About Us</h1>
          <p className="about-tagline">
            Connecting students with memorable campus experiences
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            We believe that campus life should be vibrant, inclusive, and accessible.
            Our platform connects students with events that matter to them,
            while helping organizers reach their intended audience.
            Through technology and community, we're building bridges that enhance
            the college experience for everyone.
          </p>
        </div>
      </section>

      {/* Founders Section */}
      <section className="founders-section">
        <h2>Meet Our Founders</h2>
        <div className="founders-grid">
          {founders.map((founder) => (
            <div key={founder.id} className="founder-card">
              <div className="founder-image-container">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="founder-image"
                />
              </div>
              <div className="founder-info">
                <h3 className="founder-name">{founder.name}</h3>
                <p className="founder-role">{founder.role}</p>
                <p className="founder-bio">{founder.bio}</p>
                <div className="founder-social">
                  {Object.entries(founder.social).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      aria-label={platform}
                    >
                      <i className={`fab fa-${platform}`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story Section */}
      <section className="about-story">
        <h2>Our Story</h2>
        <div className="story-content">
          <div className="story-text">
            <p>
              Our journey began in 2020 when four friends recognized a common problem:
              despite the abundance of campus events, many students struggled to discover
              activities that aligned with their interests and schedules.
            </p>
            <p>
              Alexandra, Marcus, Priya, and David met during a hackathon and decided to
              build a solution. What started as a simple events board quickly evolved into
              a comprehensive platform for connecting students with campus life.
            </p>
            <p>
              Today, our platform serves thousands of students across multiple campuses,
              helping them discover events, connect with peers, and make the most of their
              college experience.
            </p>
          </div>
          <div className="story-timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>2020</h4>
                <p>Founded at University Hackathon</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>2021</h4>
                <p>Launched Beta on First Campus</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>2022</h4>
                <p>Expanded to 5 Universities</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>2023</h4>
                <p>Introduced Personalized Recommendations</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>2024</h4>
                <p>Serving 50+ Campuses Nationwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <h2>Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🔍</div>
            <h3>Discovery</h3>
            <p>We help students discover new experiences and connections.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h3>Community</h3>
            <p>We believe in the power of belonging and shared experiences.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🌈</div>
            <h3>Diversity</h3>
            <p>We celebrate the unique perspectives each student brings.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💡</div>
            <h3>Innovation</h3>
            <p>We constantly improve our platform to better serve students.</p>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="about-cta">
        <h2>Join Our Community</h2>
        <p>Discover events, connect with peers, and make the most of your campus experience.</p>
        <div className="cta-buttons">
          <Link to="/register" className="cta-button primary">Join Now</Link>
          <Link to="/events" className="cta-button secondary">Browse Events</Link>
        </div>
      </section>
    </div>
  );
}

export default About;