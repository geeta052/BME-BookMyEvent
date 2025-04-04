import React, { useState, useContext, useEffect } from "react";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import './StudentLoginForm.css';

const StudentLoginForm = () => {
    const [formData, setFormData] = useState({
        studentName: '',
        department: '',
        degree: '',
        yearOfStudy: '',
        eventPreferences: [],
        dateOfBirth: '',
        gender: '',
        profilePicture: '',
        clubsMembership: '',
        instituteName: '',
        latitude: '',  // Added latitude
        longitude: ''  // Added longitude
    });

    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    // List of possible events for selection
    const eventsList = [
        'Tech Conference', 
        'Cultural Fest', 
        'Sports Tournament', 
        'Hackathon', 
        'Workshop', 
        'Seminar'
    ];

    // List of departments
    const departments = [
        'Computer Science', 
        'Electrical Engineering', 
        'Mechanical Engineering', 
        'Civil Engineering', 
        'Business Administration', 
        'Arts & Humanities', 
        'Medical Sciences', 
        'Law'
    ];

    const uploadFile = async () => {
        if (file && !isImageUploaded) {
            const name = `${currentUser.uid}`;
            const storageRef = ref(storage, `images/${name}`);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Error uploading file:", error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setFormData((prevData) => ({
                        ...prevData,
                        profilePicture: downloadURL,
                    }));
                    setIsImageUploaded(true);
                }
            );
        }
    };

    useEffect(() => {
        uploadFile();
    }, [file, currentUser, isImageUploaded]);

    // Get user's location when component mounts
    useEffect(() => {
        getUserLocation();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            const selectedFile = files[0];
            setFile(selectedFile);
            
            // Create preview
            if (selectedFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            }
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setFormData({
                ...formData,
                eventPreferences: [...formData.eventPreferences, value]
            });
        } else {
            setFormData({
                ...formData,
                eventPreferences: formData.eventPreferences.filter(event => event !== value)
            });
        }
    };

    // Get user's location
    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData((prevData) => ({
                        ...prevData,
                        latitude: position.coords.latitude.toFixed(6),
                        longitude: position.coords.longitude.toFixed(6)
                    }));
                },
                (error) => {
                    console.error("Error fetching location:", error);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const userDocRef = doc(db, "users", currentUser.uid);

        try {
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await updateDoc(userDocRef, {
                    Student: formData,
                });
                
                setIsSubmitting(false);
                setSubmitSuccess(true);
                
                // Navigate after showing success message
                setTimeout(() => {
                    navigate("../dashboard/StudentDashboard/:userId");
                }, 2000);
            } else {
                console.error("User document does not exist.");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error updating user document:", error);
            setIsSubmitting(false);
        }
    };

    

    return (
        <div className="fullscreen-container">

        <div className="student-profile-form-container">
            <div className="student-profile-form-header">
                <h1>Student Profile</h1>
                <p>Complete your profile to join campus events and activities</p>
            </div>
            
            {submitSuccess ? (
                <div className="student-profile-success-message">
                    <div className="student-profile-success-icon">✓</div>
                    <h2>Profile Updated Successfully!</h2>
                    <p>You're being redirected to your dashboard...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="student-profile-form-grid">
                        <div className="student-profile-form-left">
                            <div className="student-profile-form-group">
                                <label htmlFor="studentName">Full Name</label>
                                <input
                                    type="text"
                                    id="studentName"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            
                            <div className="student-profile-form-row">
                                <div className="student-profile-form-group">
                                    <label htmlFor="dateOfBirth">Date of Birth</label>
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="student-profile-form-group">
                                    <label htmlFor="gender">Gender</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-binary</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="student-profile-form-group">
                                <label htmlFor="instituteName">City</label>
                                <input
                                    type="text"
                                    id="instituteName"
                                    name="instituteName"
                                    value={formData.instituteName}
                                    onChange={handleChange}
                                    placeholder="City name"
                                    required
                                />
                            </div>
                            
                            <div className="student-profile-form-row">
                                <div className="student-profile-form-group">
                                    <label htmlFor="department">Department</label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept, index) => (
                                            <option key={index} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="student-profile-form-group">
                                    <label htmlFor="yearOfStudy">Year of Study</label>
                                    <select
                                        id="yearOfStudy"
                                        name="yearOfStudy"
                                        value={formData.yearOfStudy}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1st Year">First Year</option>
                                        <option value="2nd Year">Second Year</option>
                                        <option value="3rd Year">Third Year</option>
                                        <option value="4th Year">Fourth Year</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="student-profile-form-group">
                                <label htmlFor="degree">Degree Program</label>
                                <input
                                    type="text"
                                    id="degree"
                                    name="degree"
                                    value={formData.degree}
                                    onChange={handleChange}
                                    placeholder="E.g., B.Tech, BBA, MA, Ph.D."
                                    required
                                />
                            </div>
                            
                            <div className="student-profile-form-group">
                                <label htmlFor="clubsMembership">Clubs Membership (Optional)</label>
                                <input
                                    type="text"
                                    id="clubsMembership"
                                    name="clubsMembership"
                                    value={formData.clubsMembership}
                                    onChange={handleChange}
                                    placeholder="List clubs you're a member of"
                                />
                            </div>
                        </div>
                        
                        <div className="student-profile-form-right">
                            <div className="student-profile-form-group student-profile-upload">
                                <label>Profile Picture</label>
                                <div className="student-profile-upload-container">
                                    <div 
                                        className="student-profile-upload-area" 
                                        onClick={() => document.getElementById('profilePicture').click()}
                                    >
                                        {previewImage ? (
                                            <img src={previewImage} alt="Profile preview" className="student-profile-preview-image" />
                                        ) : formData.profilePicture ? (
                                            <img src={formData.profilePicture} alt="Profile" className="student-profile-preview-image" />
                                        ) : (
                                            <>
                                                <div className="student-profile-upload-icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                        <polyline points="17 8 12 3 7 8"></polyline>
                                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                                    </svg>
                                                </div>
                                                <span>Click to upload image</span>
                                                <span className="student-profile-upload-hint">JPG, PNG (max 2MB)</span>
                                            </>
                                        )}
                                        
                                        {uploadProgress !== null && uploadProgress < 100 && (
                                            <div className="student-profile-upload-progress">
                                                <div 
                                                    className="student-profile-progress-bar" 
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                                <span>{Math.round(uploadProgress)}%</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="profilePicture"
                                        name="profilePicture"
                                        onChange={handleChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            
                            <div className="student-profile-form-group">
                                <label>Event Preferences</label>
                                <div className="student-profile-checkbox-group">
                                    {eventsList.map((event, index) => (
                                        <div className="student-profile-checkbox-item" key={index}>
                                            <input
                                                type="checkbox"
                                                id={`event-${index}`}
                                                name="eventPreferences"
                                                value={event}
                                                checked={formData.eventPreferences.includes(event)}
                                                onChange={handleCheckboxChange}
                                            />
                                            <label htmlFor={`event-${index}`}>{event}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="student-profile-form-group student-profile-location-group">
                                <label>Your Location</label>
                                <div className="student-profile-location-inputs">
                                    <div className="student-profile-location-input">
                                        <label htmlFor="latitude">Latitude</label>
                                        <input
                                            type="text"
                                            id="latitude"
                                            name="latitude"
                                            value={formData.latitude}
                                            onChange={handleChange}
                                            placeholder="Latitude"
                                            required
                                        />
                                    </div>
                                    <div className="student-profile-location-input">
                                        <label htmlFor="longitude">Longitude</label>
                                        <input
                                            type="text"
                                            id="longitude"
                                            name="longitude"
                                            value={formData.longitude}
                                            onChange={handleChange}
                                            placeholder="Longitude"
                                            required
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    className="student-profile-location-btn" 
                                    onClick={getUserLocation}
                                >
                                    Get My Location
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="student-profile-form-footer">
                        <button type="submit" className="student-profile-submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className="student-profile-loading-spinner"></span>
                            ) : 'Save Profile'}
                        </button>
                    </div>
                </form>
            )}
        </div>
        </div>
    );







};

export default StudentLoginForm;