// AdminLoginForm.js

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // import your Firebase auth instance
import './AdminLogin.css';

const AdminLoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
        twoFactorCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            // You can add two-factor verification here if needed
            console.log("Login successful");
        } catch (err) {
            setError("Login failed. Check your credentials and try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fullscreen-container">
            <div className="form-container">
                <h2>Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-text">{error}</p>}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                Remember Me
                            </label>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="twoFactorCode">Two-Factor Code (if enabled):</label>
                            <input
                                type="text"
                                id="twoFactorCode"
                                name="twoFactorCode"
                                value={formData.twoFactorCode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                    <a href="/forgot-password">Forgot Password?</a>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginForm;
