import React, { useState } from 'react';
import { db, storage } from '../firebase'; // Adjust the path as needed
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const EventRegistrationForm = () => {
    const { currentUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        eventName: '',
        eventDate: '',
        eventTime: '',
        location: '',
        participantName: currentUser?.displayName || '',
        participantEmail: currentUser?.email || '',
        ticketPrice: '',
        description: '',
        images: [],
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 4);
        setImageFiles(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            setErrorMessage("You must be logged in to create an event");
            return;
        }
        
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            // Create unique event ID based on name and timestamp
            const eventId = formData.eventName.toLowerCase().replace(/[^a-z0-9]/g, '-') + 
                '-' + Date.now().toString();

            // Upload images if any
            const uploadedImages = [];
            if (imageFiles.length > 0) {
                await Promise.all(
                    imageFiles.map(async (file, index) => {
                        const storageRef = ref(storage, `events/${eventId}/image${index + 1}`);
                        const uploadTask = uploadBytesResumable(storageRef, file);

                        return new Promise((resolve, reject) => {
                            uploadTask.on(
                                'state_changed',
                                (snapshot) => {
                                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                    setUploadProgress(progress);
                                },
                                (error) => {
                                    console.error("Error uploading image:", error);
                                    reject(error);
                                },
                                async () => {
                                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                    uploadedImages.push(downloadURL);
                                    resolve();
                                }
                            );
                        });
                    })
                );
            }

            // Store event details in Firestore
            const eventData = {
                ...formData,
                eventId,
                createdBy: currentUser.uid,
                creatorName: currentUser.displayName || "Anonymous",
                creatorEmail: currentUser.email,
                createdAt: serverTimestamp(),
                images: uploadedImages,
            };

            // Store in events collection
            await setDoc(doc(db, 'events', eventId), eventData);

            // Create a chat document in chats collection
            const chatData = {
                name: formData.eventName,
                description: formData.description || `Chat for ${formData.eventName} participants`,
                eventId: eventId,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid,
            };
            
            await setDoc(doc(db, 'chats', eventId), chatData);

            // Add creator as the first member of the chat
            await setDoc(doc(db, `chats/${eventId}/members`, currentUser.uid), {
                userId: currentUser.uid,
                userName: currentUser.displayName || "Anonymous",
                userEmail: currentUser.email,
                photoURL: currentUser.photoURL || null,
                isCreator: true,
                joinedAt: serverTimestamp(),
            });

            // Create welcome message
            await addDoc(collection(db, `chats/${eventId}/messages`), {
                text: `Welcome to the chat for ${formData.eventName}!`,
                senderId: "system",
                senderName: "System",
                isSystemMessage: true,
                timestamp: serverTimestamp()
            });

            // Redirect to the chat page after event creation
            navigate(`/chat/${eventId}`);
        } catch (error) {
            console.error("Error creating event:", error);
            setErrorMessage("Failed to create event. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="login-required-container">
                <div className="login-required-content">
                    <h2>Login Required</h2>
                    <p>Please log in to create an event.</p>
                    <button onClick={() => navigate('/login')} className="login-button">Go to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fullscreen-container">
            <div className="form-container">
                <h2>Create Event & Chat</h2>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="eventName">Event Name:</label>
                            <input
                                type="text"
                                id="eventName"
                                name="eventName"
                                value={formData.eventName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group half-width">
                            <label htmlFor="eventDate">Event Date:</label>
                            <input
                                type="date"
                                id="eventDate"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="eventTime">Event Time:</label>
                            <input
                                type="time"
                                id="eventTime"
                                name="eventTime"
                                value={formData.eventTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group half-width">
                            <label htmlFor="location">Location:</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="ticketPrice">Ticket Price ($):</label>
                            <input
                                type="number"
                                id="ticketPrice"
                                name="ticketPrice"
                                value={formData.ticketPrice}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div className="form-group half-width">
                            <label htmlFor="participantName">Your Name:</label>
                            <input
                                type="text"
                                id="participantName"
                                name="participantName"
                                value={formData.participantName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="participantEmail">Your Email:</label>
                            <input
                                type="email"
                                id="participantEmail"
                                name="participantEmail"
                                value={formData.participantEmail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group half-width">
                            <label htmlFor="images">Upload Images (Max 4):</label>
                            <input
                                type="file"
                                id="images"
                                name="images"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {uploadProgress > 0 && <p>Upload progress: {uploadProgress.toFixed(2)}%</p>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="description">Event Description:</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Describe your event..."
                            />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={isSubmitting ? "submit-button loading" : "submit-button"}
                    >
                        {isSubmitting ? "Creating..." : "Create Event & Chat"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EventRegistrationForm;