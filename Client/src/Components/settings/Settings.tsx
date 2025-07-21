// @ts-nocheck
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings: React.FC = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        contactNumber: '',
        password: '',
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId'); // Get userId from localStorage
            const token = localStorage.getItem('token'); // retrieve from storage
            if (!userId) {
                setErrorMessage('User not logged in.');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3000/api/user/${userId}`,{
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });; // Append userId in the URL
                setUserData(response.data.user);
            } catch (err: any) {
                console.error('Error fetching user data:', err);
                setErrorMessage('Failed to fetch user data.');
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        setErrorMessage(null);

        const userId = localStorage.getItem('userId'); // Get userId from localStorage
        if (!userId) {
            setErrorMessage('User not logged in.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3000/api/user/${userId}`, userData); // Append userId in the URL

            if (response.data.success) {
                setSuccessMessage('Profile updated successfully.');
            }
        } catch (err: any) {
            console.error('Error updating user:', err);
            setErrorMessage('Failed to update profile.');
        }
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center',  fontSize:'4em', fontFamily:'Georgia'}}>Settings</h1>

            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contactNumber">Contact Number:</label>
                    <input
                        type="text"
                        id="contactNumber"
                        name="contactNumber"
                        value={userData.contactNumber}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={userData.password}
                        onChange={handleInputChange}
                        className="form-control"
                    />
                </div>

                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                <button type="submit" className="btn btn-primary">Update Profile</button>
            </form>
        </div>
    );
};

export default Settings;
