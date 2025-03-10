// InstituteLoginForm.js

import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import './InstituteLogin.css';

const InstituteLoginForm = () => {
    const [formData, setFormData] = useState({
        instituteName: '',
        establishedYear: '',
        description: '',
        collegeStream: [],
        collegePicture: '',
    });

    const [file, setFile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    
    const navigate = useNavigate();

    const uploadFile = async () => {
        if (file && !isImageUploaded) {
            const storageRef = ref(storage, `images/${formData.instituteName}`);

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
                        collegePicture: downloadURL,
                    }));
                    setIsImageUploaded(true);
                }
            );
        }
    };

    useEffect(() => {
        uploadFile();
    }, [file, isImageUploaded, formData.instituteName]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file") {
            setFile(files[0]);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleStreamSelect = (stream) => {
        setFormData(prevState => {
            const newStreams = prevState.collegeStream.includes(stream)
                ? prevState.collegeStream.filter(s => s !== stream)
                : [...prevState.collegeStream, stream];
            return { ...prevState, collegeStream: newStreams };
        });
        setIsDropdownOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const instituteDocRef = doc(db, 'institutes', formData.instituteName);
            await setDoc(instituteDocRef, formData);
            navigate('/details/eventuploader');
        } catch (error) {
            console.error("Error saving institute data:", error);
        }
    };

    return (
        <div className="fullscreen-container">
            <div className="form-container">
                <h2>Institute Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="instituteName">Institute Name:</label>
                            <input
                                type="text"
                                id="instituteName"
                                name="instituteName"
                                value={formData.instituteName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group half-width">
                            <label htmlFor="establishedYear">Established Year:</label>
                            <input
                                type="number"
                                id="establishedYear"
                                name="establishedYear"
                                value={formData.establishedYear}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="description">Description:</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="collegeStream">College Stream:</label>
                            <div className="dropdown">
                                <button type="button" onClick={handleDropdownToggle}>
                                    {formData.collegeStream.length > 0 
                                        ? formData.collegeStream.join(', ') 
                                        : 'Select Streams'}
                                </button>
                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        {["Engineering", "Medical", "Commerce", "Arts"].map(stream => (
                                            <label key={stream}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.collegeStream.includes(stream)}
                                                    onChange={() => handleStreamSelect(stream)}
                                                />
                                                {stream}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group half-width">
                            <label htmlFor="collegePicture">College Picture:</label>
                            <input
                                type="file"
                                id="collegePicture"
                                name="collegePicture"
                                onChange={handleChange}
                                accept="image/*"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
};

export default InstituteLoginForm;
