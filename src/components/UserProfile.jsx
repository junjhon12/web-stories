import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        // 1. Fetch User Details
        fetch(`http://localhost:5000/api/users/${userId}`)
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(err => console.error(err));

        // 2. Fetch Books by this Author
        fetch(`http://localhost:5000/api/books?author=${userId}`)
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error(err));
    }, [userId]);

    if (!user) return <div className="container text-center mt-4">Loading Profile...</div>;
    if (!user._id) return <div className="container text-center mt-4">User not found.</div>;

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            
            {/* --- PROFILE HEADER --- */}
            <div className="card" style={{ textAlign: 'center', marginBottom: '40px', padding: '40px' }}>
                <div style={{ 
                    width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary)', 
                    color: '#000', fontSize: '3rem', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', margin: '0 auto 20px auto', fontWeight: 'bold' 
                }}>
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <h1>{user.username}</h1>
                <p className="text-muted">
                    Member since {new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString()}
                </p>
            </div>

            {/* --- USER'S BOOKS --- */}
            <h2 className="mb-4">Published Books ({books.length})</h2>

            {books.length === 0 ? (
                <p className="text-muted">No books published yet.</p>
            ) : (
                <div className="grid">
                    {books.map(book => (
                        <div key={book._id} className="card">
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{book.title}</h3>
                            <button 
                                onClick={() => navigate(`/books/${book._id}`)}
                                className="btn btn-primary btn-block"
                            >
                                Read
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserProfile;