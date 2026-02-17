import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('userId', data.userId);
                navigate('/'); 
                window.location.reload(); 
            } else {
                alert(data.message);
            }
        } catch (error) { console.error("Error:", error); }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '60px' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome Back 👋</h2>
                <form onSubmit={handleLogin}>
                    <div>
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Login</button>
                    <button 
                        type="button" 
                        onClick={() => {
                            setUsername("GuestUser"); // Make sure you register this user manually once!
                            setPassword("guest123");
                        }}
                        className="btn btn-secondary btn-block"
                        style={{ marginTop: '10px', background: '#6c757d', border: 'none' }}
                    >
                        🔑 Login as Guest (Demo)
                    </button>
                </form>
                <p className="text-muted" style={{ textAlign: 'center', marginTop: '20px' }}>
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;