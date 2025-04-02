import React, { useContext } from "react";
import { Link } from "react-router-dom";
import eve1 from "../../images/eve1.jpg";
import eve2 from "../../images/eve2.jpg";
import eve3 from "../../images/eve3.jpg";
import { AuthContext } from "../../context/AuthContext";
import './HomePage.css';

const HomePage = () => {
  const { currentUser } = useContext(AuthContext);

  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Conference 2025",
      date: "March 15, 2025",
      location: "Main Campus Auditorium",
      image: "https://th.bing.com/th/id/OIP.o8d0STltT9yqVBNZrR96DgHaE8?w=273&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7"
    },
    {
      id: 2,
      title: "Music Festival",
      date: "March 22, 2025",
      location: "Central Park",
      image: "https://th.bing.com/th/id/OIP.3bc1zvRgXWp5Mv3eIGX7BwHaEH?pid=ImgDet&w=474&h=263&rs=1"
    },
    {
      id: 3,
      title: "Career Fair",
      date: "April 5, 2025",
      location: "Business School Building",
      image: "https://th.bing.com/th/id/OIP.wkEPc18idrMPj2ZbqkWC6gHaE6?rs=1&pid=ImgDetMain"
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Student",
      text: "BookMyEvent has completely transformed how I discover campus events. The interface is intuitive and I never miss important happenings anymore!",
      avatar: "/images/avatar1.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Club President",
      text: "As a club organizer, this platform has made it so much easier to reach students and manage our event registrations. Highly recommended!",
      avatar: "/images/avatar2.jpg"
    },
    {
      id: 3,
      name: "Jessica Miller",
      role: "Faculty Member",
      text: "I use BookMyEvent to promote department seminars and workshops. The analytics provided help us understand our audience better.",
      avatar: "/images/avatar3.jpg"
    }
  ];

  return (
    <div className="homepage">
      <header className="header">
        <div className="logo-container">
          {/* <img src="/images/logo.svg" alt=" Logo" className="logo" /> */}
          <h1>BookMyEvent</h1>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="http://localhost:3000/dashboard/StudentDashboard/:userId">Events</Link>
          <Link to="http://localhost:3000/college">Colleges</Link>
          <Link to="http://localhost:3000/about">About</Link>
          {!currentUser ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
              <Link to="http://localhost:3000/dashboard/StudentDashboard/:userId" className="signup-btn">Explore</Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2>Discover Events, Connect with Communities</h2>
          <p>Join us to explore exciting events, clubs, and more on your campus. Register now and never miss an event again!</p>
          <div className="hero-buttons">
            {currentUser ? (
              <Link to="http://localhost:3000/dashboard/StudentDashboard/:userId" className="cta-btn">Explore Now</Link>
            ) : (
              <>
                <Link to="/signup" className="cta-btn">Get Started</Link>
                <Link to="/events" className="secondary-btn">Browse Events</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-images">
          <img src={eve1} alt="Event Illustration 1" />
          <img src={eve2} alt="Event Illustration 2" />
          <img src={eve3} alt="Event Illustration 3" />
        </div>
      </section>

      <section className="stats">
        <div className="stat-container">
          <div className="stat-item">
            <h3>500+</h3>
            <p>Events Hosted</p>
          </div>
          <div className="stat-item">
            <h3>10K+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-item">
            <h3>150+</h3>
            <p>Campus Clubs</p>
          </div>
          <div className="stat-item">
            <h3>98%</h3>
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </section>

      <section id="trending" className="trending-events">
        <h2>Trending This Week</h2>
        <div className="event-cards">
          {upcomingEvents.map(event => (
            <div className="event-card" key={event.id}>
              <div className="event-image">
                <img src={event.image} alt={event.title} />
              </div>
              <div className="event-details">
                <h3>{event.title}</h3>
                <div className="event-info">
                  <span className="event-date">📅 {event.date}</span>
                  <span className="event-location">📍 {event.location}</span>
                </div>
                <Link to="http://localhost:3000/dashboard/StudentDashboard/:userId" className="view-event">View Details</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all-container">
          <Link to="http://localhost:3000/dashboard/StudentDashboard/:userId" className="view-all">View All Events</Link>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Features</h2>
        <div className="feature-cards">
          {/* <div className="card">
            <div className="card-icon">🔍</div>
            <h3>Discover Events</h3>
            <p>Find events tailored to your preferences and location with advanced filtering options.</p>
          </div> */}
          <a href="http://localhost:3000/dashboard/StudentDashboard/:userId" style={{ textDecoration: "none" }}>
            <div className="card">
              <div className="card-icon">🔍</div>
              <h3>Discover Events</h3>
              <p>Find events tailored to your preferences and location with advanced filtering options.</p>
            </div>
          </a>


          <a href="http://localhost:3000/event/clean" style={{ textDecoration: "none" }}>

          <div className="card">
            <div className="card-icon">🎟️</div>
            <h3>Book Tickets</h3>
            <p>Easily register and book tickets for events with secure payment processing.</p>
          </div>
          </a>

          <div className="card">
            <div className="card-icon">🤖</div>
            <h3>AI Chatbot</h3>
            <p>Get instant assistance with our intelligent chatbot to help find perfect events.</p>
          </div>

          <a href="http://localhost:3000/chat/:chatRoomId" style={{ textDecoration: "none" }}>

          <div className="card">
            <div className="card-icon">🌐</div>
            <h3>Connect with Communities</h3>
            <p>Join clubs and societies to enhance your campus life and build networks.</p>
          </div>
          </a>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up and build your profile with preferences and interests.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Discover Events</h3>
            <p>Browse and search for events that match your interests.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Book & Pay</h3>
            <p>Reserve your spot and pay securely through our platform.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Attend & Enjoy</h3>
            <p>Get reminders and digital tickets for seamless entry.</p>
          </div>
        </div>
      </section>

      <section id="event-categories" className="event-categories">
  <h2>Event Categories</h2>
  <div className="category-container">
    <div className="category-item">
      <div className="category-icon">🎓</div>
      <h3>Academic</h3>
    </div>
    <div className="category-item">
      <div className="category-icon">🎭</div>
      <h3>Cultural</h3>
    </div>
    <div className="category-item">
      <div className="category-icon">⚽</div>
      <h3>Sports</h3>
    </div>
    <div className="category-item">
      <div className="category-icon">💻</div>
      <h3>Technology</h3>
    </div>
    <div className="category-item">
      <div className="category-icon">🎨</div>
      <h3>Arts</h3>
    </div>
    <div className="category-item">
      <div className="category-icon">💼</div>
      <h3>Career</h3>
    </div>
  </div>
</section>


      <section id="testimonials" className="testimonials">
        <h2>What Users Say</h2>
        <div className="testimonial-cards">
          {testimonials.map(testimonial => (
            <div className="testimonial-card" key={testimonial.id}>
              <div className="quote-icon">"</div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-user">
                {/* <img src={testimonial.avatar} alt={testimonial.name} className="user-avatar" /> */}
                <div className="user-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          <div className="faq-item">
            <h3>How do I create an account?</h3>
            <p>You can sign up using your email address or connect with your Google or Facebook account. Simply click on the "Sign Up" button at the top of the page to get started.</p>
          </div>
          <div className="faq-item">
            <h3>Is the service free to use?</h3>
            <p>Yes, BookMyEvent is completely free for students to use. Some premium events may charge a fee, but creating an account and browsing events is always free.</p>
          </div>
          <div className="faq-item">
            <h3>How do I organize my own event?</h3>
            <p>After creating an account, you can navigate to your dashboard and select "Create Event" to start the process. You'll need to provide details about your event and select your preferred settings.</p>
          </div>
          <div className="faq-item">
            <h3>Can I get a refund for a cancelled event?</h3>
            <p>Yes, if an event is cancelled by the organizer, you will automatically receive a full refund. Our platform ensures your money is protected.</p>
          </div>
        </div>
        <Link to="/faq" className="view-all-faq">View All FAQs</Link>
      </section>



      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            {/* <img src="/images/logo.svg" alt="BookMyEvent Logo" /> */}
            <h3>BookMyEvent</h3>
            <p>Connecting students with campus events since 2020</p>
          </div>
          <div className="footer-links">
            <div className="link-column">
              <h4>Quick Links</h4>
              <Link to="/">Home</Link>
              <Link to="/events">Events</Link>
              <Link to="/clubs">Clubs</Link>
              <Link to="/about">About Us</Link>
            </div>
            <div className="link-column">
              <h4>Resources</h4>
              <Link to="/faq">FAQ</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
            <div className="link-column">
              <h4>Connect</h4>
              <a href="#">Facebook</a>
              <a href="#">Twitter</a>
              <a href="#">Instagram</a>
              <a href="#">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 BookMyEvent. All rights reserved.</p>
        </div>
      </footer>


    </div>
  );
};

export default HomePage;