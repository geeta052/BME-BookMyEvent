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
      const chatRef = doc(db, "chats", chatRoomId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        setChatInfo(chatSnap.data());
      }
    };
    
    fetchChatInfo();
  }, [chatRoomId]);
  
  // Check user membership
  useEffect(() => {
    if (!chatRoomId || !currentUser) return;

    const checkMembership = async () => {
      const memberRef = doc(db, "chats", chatRoomId, "members", currentUser.uid);
      const memberSnap = await getDoc(memberRef);

      if (memberSnap.exists()) {
        setIsMember(true);
      } else {
        setIsMember(false);
      }
      setLoading(false);
    };

    checkMembership();
  }, [chatRoomId, currentUser]);

  // Fetch messages
  useEffect(() => {
    if (!chatRoomId || !isMember) return;

    const messagesRef = collection(db, "chats", chatRoomId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [chatRoomId, isMember]);
  
  // Fetch members
  useEffect(() => {
    if (!chatRoomId) return;
    
    const membersRef = collection(db, "chats", chatRoomId, "members");
    
    const unsubscribe = onSnapshot(membersRef, (snapshot) => {
      setMembers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
      const memberRef = doc(db, "chats", chatRoomId, "members", currentUser.uid);
      await setDoc(memberRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        photoURL: currentUser.photoURL || null,
        joinedAt: serverTimestamp(),
      });
      setIsMember(true);
    } catch (error) {
      console.error("Error joining chat:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "chats", chatRoomId, "messages"), {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "Anonymous",
        senderPhoto: currentUser.photoURL || null,
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getInitials = (name) => {
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
            <div className="chat-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="chat-title">{chatInfo?.name || "Event Group Chat"}</h1>
              <p className="chat-subtitle">{members.length} participants</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-button" onClick={() => setShowSidebar(!showSidebar)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </button>
            <button className="icon-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* Message Area */}
        {!isMember ? (
          <div className="join-container">
            <div className="join-card">
              <div className="join-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2 className="join-title">{chatInfo?.name || "Event Group Chat"}</h2>
              <p className="join-description">Join this group to connect with other participants and stay updated on event details.</p>
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
                {messages.map((msg) => {
                  const isCurrentUser = msg.senderId === currentUser.uid;
                  
                  return (
                    <div key={msg.id} className={`message ${isCurrentUser ? 'outgoing' : ''}`}>
                      {!isCurrentUser && (
                        <div className="message-avatar">
                          {msg.senderPhoto ? (
                            <img src={msg.senderPhoto} alt={msg.senderName} />
                          ) : (
                            getInitials(msg.senderName)
                          )}
                        </div>
                      )}
                      <div className="message-content">
                        {!isCurrentUser && (
                          <div className="message-sender">{msg.senderName}</div>
                        )}
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
        </div>
        
        <div className="sidebar-section">
          <h3 className="section-title">About</h3>
          <p className="section-content">{chatInfo?.description || "Event group chat for participants."}</p>
        </div>
        
        <div className="sidebar-section">
          <h3 className="section-title">Members ({members.length})</h3>
          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-item">
                <div className="member-avatar">
                  {member.photoURL ? (
                    <img src={member.photoURL} alt={member.userName} />
                  ) : (
                    getInitials(member.userName)
                  )}
                </div>
                <div className="member-info">
                  <div className="member-name">{member.userName}</div>
                  <div className="member-joined">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {member.joinedAt ? 
                      new Date(member.joinedAt.toDate()).toLocaleDateString() : 
                      "Recently joined"
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;