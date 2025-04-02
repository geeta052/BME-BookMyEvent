import React, { useState } from 'react';
import { db, storage } from '../firebase'; // Adjust the path as needed
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const EventRegistrationForm = () => {
    const [formData, setFormData] = useState({
        eventName: '',
        eventDate: '',
        eventTime: '',
        location: '', // Added Location Field
        participantName: '',
        participantEmail: '',
        ticketPrice: '',
        images: [],
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        setImageFiles(Array.from(e.target.files).slice(0, 4));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const uploadedImages = await Promise.all(
                imageFiles.map(async (file, index) => {
                    const storageRef = ref(storage, `events/${formData.eventName}/image${index + 1}`);
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
                                resolve(downloadURL);
                            }
                        );
                    });
                })
            );

            const eventDocRef = doc(db, 'events', formData.eventName);
            await setDoc(eventDocRef, {
                ...formData,
                images: uploadedImages,
            });

            // **Create a Group Chat for the Event**
            const chatRef = collection(db, `chats/${formData.eventName}/messages`);
            await addDoc(chatRef, {
                sender: "Admin",
                message: `Welcome to the chat for ${formData.eventName}!`,
                timestamp: serverTimestamp()
            });

            // Redirect to the chat page after event creation
            navigate(`/chat/${formData.eventName}`);
        } catch (error) {
            console.error("Error saving event registration:", error);
        }
    };

    return (
        <div className="fullscreen-container">
            <div className="form-container">
                <h2>Event Registration</h2>
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
                            <label htmlFor="ticketPrice">Ticket Price:</label>
                            <input
                                type="number"
                                id="ticketPrice"
                                name="ticketPrice"
                                value={formData.ticketPrice}
                                onChange={handleChange}
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
                        <div className="form-group full-width">
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
                    <button type="submit">Register & Create Chat</button>
                </form>
            </div>
        </div>
    );
};

export default EventRegistrationForm;
