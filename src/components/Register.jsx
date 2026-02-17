import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            
            if (response.ok) {
                alert("Registration successful! Please login.");
                navigate('/login'); 
            } else {
                alert(data.message);
            }
        } catch (error) { console.error("Error:", error); }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '60px' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Join WebStories 🚀</h2>
                <form onSubmit={handleRegister}>
                    <div>
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Sign Up</button>
                </form>
                <p className="text-muted" style={{ textAlign: 'center', marginTop: '20px' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;