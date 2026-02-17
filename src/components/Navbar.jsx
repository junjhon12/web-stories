import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    // 1. You MUST retrieve the userId from localStorage to use it below
    const userId = localStorage.getItem('userId'); 

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId'); // Clear userId on logout
        alert("Logged out!");
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <div className="container flex-between">
                <Link to="/" className="logo">📖 WebStories</Link>
                
                <div className="nav-links">
                    <Link to="/" className="nav-item">Library</Link>
                    
                    {token ? (
                        <>
                            <Link to="/create" className="nav-item">Write</Link>
                            <Link to="/bookshelf" className="nav-item">Bookshelf</Link>
                            
                            {/* 2. FIXED: Use backticks and the correct path /profile/ */}
                            <Link to={`/profile/${userId}`} className="nav-item">My Profile</Link>
                            
                            <span className="user-badge">{username}</span>
                            <button onClick={handleLogout} className="btn btn-danger" style={{marginLeft: '10px'}}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-item">Login</Link>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
            
            <style>{`
                .navbar { background-color: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 10px 0; }
                .logo { font-size: 1.5rem; font-weight: bold; color: #fff; text-decoration: none; }
                .nav-links { display: flex; align-items: center; gap: 20px; }
                .nav-item { color: var(--text-muted); font-weight: 500; text-decoration: none; }
                .nav-item:hover { color: var(--text-main); }
                .user-badge { background: #21262d; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; border: 1px solid var(--border-color); }
            `}</style>
        </nav>
    );
};

export default Navbar;