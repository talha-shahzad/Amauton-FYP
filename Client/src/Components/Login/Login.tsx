// @ts-nocheck
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import LoginImage from '../../assets/LoginPage.jpg'; 
import Logo from '../../assets/Logo.png'; 
const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
    
        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                email,
                password,
            });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                console.log('Login successful:', response.data.message);
    
                // Store the user ID in localStorage
                localStorage.setItem('userId', response.data.userId);
    
                // Redirect to the dashboard
                window.location.href = '/dashboard';
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            console.error('Error during login:', err);
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        }
    };
    

    const handleSignUpRedirect = () => {
        window.location.href = '/signup';
    };

    return (
        <div className="login-container">
            <div className="login-image" >
                <img src={LoginImage} alt="Login Visual" />
            </div>
            <div className="login-form">
            <img src={Logo} alt="Logo" style={{ height: 50, marginBottom:20 }} />
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-button">
                        Login
                    </button>
                </form>
                <button onClick={handleSignUpRedirect} className="signup">
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default Login;
