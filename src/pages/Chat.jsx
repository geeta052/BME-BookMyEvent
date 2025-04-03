import React, { useState, useEffect, useContext, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";
import "./Chat.css";

function Chat() {
  const { chatRoomId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Fetch chat information
  useEffect(() => {
    if (!chatRoomId) return;
    
    const fetchChatInfo = async () => {
      try {
        // First try chats collection - this should be the primary source
        const chatRef = doc(db, "chats", chatRoomId);
        const chatSnap = await getDoc(chatRef);
        
        if (chatSnap.exists()) {
          setChatInfo(chatSnap.data());
          return;
        }
        
        // If not found in chats, try events collection
        const eventRef = doc(db, "events", chatRoomId);
        const eventSnap = await getDoc(eventRef);
        
        if (eventSnap.exists()) {
          setChatInfo(eventSnap.data());
          return;
        }
        
        // If we reach here, check if this is a payment ID format (pay_XXXX)
        if (chatRoomId.startsWith('pay_')) {
          // Try to find the event with this payment ID
          const eventsRef = collection(db, "events");
          const eventSnapshots = await getDoc(eventsRef);
          
          // If no direct match, try to find in users' purchased events
          if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const purchasedEvents = userSnap.data().purchasedEvents || [];
              const matchedEvent = purchasedEvents.find(event => event.paymentID === chatRoomId);
              
              if (matchedEvent) {
                setChatInfo({
                  eventName: matchedEvent.eventName,
                  description: `Chat for ${matchedEvent.eventName}`,
                  eventDate: matchedEvent.eventDate,
                  eventTime: matchedEvent.eventTime,
                  location: matchedEvent.eventLocation,
                  ticketPrice: matchedEvent.ticketPrice
                });
                return;
              }
            }
          }
        }
        
        console.error("Chat room not found");
      } catch (error) {
        console.error("Error fetching chat info:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatInfo();
  }, [chatRoomId, currentUser]);
  
  // Check user membership
  useEffect(() => {
    if (!chatRoomId || !currentUser) {
      setLoading(false);
      return;
    }

    const checkMembership = async () => {
      try {
        const memberRef = doc(db, "chats", chatRoomId, "members", currentUser.uid);
        const memberSnap = await getDoc(memberRef);

        if (memberSnap.exists()) {
          setIsMember(true);
        } else {
          // Auto-join for the creator of the event
          if (chatInfo && (chatInfo.participantEmail === currentUser.email || chatInfo.creatorEmail === currentUser.email)) {
            await joinChat();
          } else {
            setIsMember(false);
          }
        }
      } catch (error) {
        console.error("Error checking membership:", error);
      } finally {
        setLoading(false);
      }
    };

    if (chatInfo) {
      checkMembership();
    }
  }, [chatRoomId, currentUser, chatInfo]);

  // Fetch messages
  useEffect(() => {
    if (!chatRoomId || !isMember) return;

    const messagesRef = collection(db, "chats", chatRoomId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp
      }));
      setMessages(messageData);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [chatRoomId, isMember]);
  
  // Fetch members
  useEffect(() => {
    if (!chatRoomId) return;
    
    const membersRef = collection(db, "chats", chatRoomId, "members");
    
    const unsubscribe = onSnapshot(membersRef, (snapshot) => {
      setMembers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching members:", error);
    });
    
    return () => unsubscribe();
  }, [chatRoomId]);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinChat = async () => {
    if (!currentUser) return;

    try {
      // First ensure the chat document exists
      const chatDocRef = doc(db, "chats", chatRoomId);
      const chatDoc = await getDoc(chatDocRef);
      
      if (!chatDoc.exists()) {
        // Create the chat document if it doesn't exist
        await setDoc(chatDocRef, {
          name: chatInfo?.eventName || "Event Group Chat",
          description: `Chat for ${chatInfo?.eventName || "event"} participants`,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid,
          eventId: chatRoomId // Ensure eventId is stored
        });
      }
      
      // Now add the member
      const memberRef = doc(db, "chats", chatRoomId, "members", currentUser.uid);
      await setDoc(memberRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        userEmail: currentUser.email || "",
        photoURL: currentUser.photoURL || null,
        joinedAt: serverTimestamp(),
      });
      
      // Add welcome message if this is the first member
      if (members.length === 0) {
        await addDoc(collection(db, "chats", chatRoomId, "messages"), {
          text: `Welcome to the chat for ${chatInfo?.eventName || "this event"}!`,
          senderId: "system",
          senderName: "System",
          isSystemMessage: true,
          timestamp: serverTimestamp(),
        });
      }
      
      setIsMember(true);
    } catch (error) {
      console.error("Error joining chat:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !isMember) return;

    try {
      // Create message data
      const messageData = {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "Anonymous",
        senderEmail: currentUser.email || "",
        senderPhoto: currentUser.photoURL || null,
        timestamp: serverTimestamp(),
      };

      // Add message to Firestore
      await addDoc(collection(db, "chats", chatRoomId, "messages"), messageData);

      // Clear input field
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate();
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return "Recently";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString();
    } catch (error) {
      return "Recently";
    }
  };
  
  const getInitials = (name) => {
    if (!name) return "AN";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="login-required-container">
        <div className="login-required-content">
          <h2>Login Required</h2>
          <p>Please log in to join this chat room.</p>
          <Link to="/login" className="login-button">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <div className="header-title">
            <Link to="/chats" className="back-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="chat-avatar event-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="chat-title">{chatInfo?.eventName || chatInfo?.name || "Event Group Chat"}</h1>
              <p className="chat-subtitle">{members.length} participants</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-button" onClick={() => setShowSidebar(!showSidebar)} aria-label="Show group details">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* Message Area */}
        {!isMember ? (
          <div className="join-container">
            <div className="join-card">
              <div className="join-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2 className="join-title">{chatInfo?.eventName || chatInfo?.name || "Event Group Chat"}</h2>
              <p className="join-description">
                Join this group to connect with other participants and stay updated on event details.
                {chatInfo?.eventDate && (
                  <span className="event-date">Event date: {new Date(chatInfo.eventDate).toLocaleDateString()}</span>
                )}
              </p>
              <button 
                onClick={joinChat} 
                className="join-button"
              >
                Join Group Chat
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="messages-container">
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Be the first to say hello!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCurrentUser = msg.senderId === currentUser.uid;
                    const isSystemMessage = msg.isSystemMessage || msg.senderId === "system" || msg.senderId === "Admin";
                    
                    return (
                      <div 
                        key={msg.id} 
                        className={`message ${isCurrentUser ? 'outgoing' : ''} ${isSystemMessage ? 'system-message' : ''}`}
                      >
                        {!isCurrentUser && !isSystemMessage && (
                          <div className="message-avatar">
                            {msg.senderPhoto ? (
                              <img src={msg.senderPhoto} alt={msg.senderName} />
                            ) : (
                              <div className="avatar-initials">{getInitials(msg.senderName)}</div>
                            )}
                          </div>
                        )}
                        <div className="message-content">
                          {!isCurrentUser && !isSystemMessage && (
                            <div className="message-sender">{msg.senderName}</div>
                          )}
                          <div className="message-text">{msg.text}</div>
                          <div className="message-time">
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Message Input */}
            <div className="input-container">
              <form onSubmit={sendMessage} className="message-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!newMessage.trim()}
                  aria-label="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      
      {/* Sidebar for Members and Details */}
      <div className={`chat-sidebar ${showSidebar ? 'visible' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Group Details</h2>
          <button 
            className="close-sidebar-button" 
            onClick={() => setShowSidebar(false)}
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="sidebar-section">
          <h3 className="section-title">About</h3>
          <div className="event-details">
            <p className="section-content">
              {chatInfo?.description || `Event group chat for ${chatInfo?.eventName || "participants"}.`}
            </p>
            
            {chatInfo?.eventDate && (
              <div className="event-info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{new Date(chatInfo.eventDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {chatInfo?.eventTime && (
              <div className="event-info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{chatInfo.eventTime}</span>
              </div>
            )}
            
            {chatInfo?.location && (
              <div className="event-info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{chatInfo.location}</span>
              </div>
            )}
            
            {chatInfo?.ticketPrice && (
              <div className="event-info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span>{typeof chatInfo.ticketPrice === 'number' ? `$${chatInfo.ticketPrice}` : chatInfo.ticketPrice}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="sidebar-section">
          <h3 className="section-title">Members ({members.length})</h3>
          <div className="members-list">
            {members.length === 0 ? (
              <p className="no-members">No members have joined yet.</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar">
                    {member.photoURL ? (
                      <img src={member.photoURL} alt={member.userName} />
                    ) : (
                      <div className="avatar-initials">{getInitials(member.userName)}</div>
                    )}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{member.userName}</div>
                    <div className="member-joined">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Joined {formatDate(member.joinedAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;