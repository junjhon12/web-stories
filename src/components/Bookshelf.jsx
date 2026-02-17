import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Bookshelf = () => {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login to view your bookshelf.");
            navigate('/login');
            return;
        }

        fetch('http://localhost:5000/api/bookshelf', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error(err));
    }, [navigate]);

    return (
        <div className="container">
            <div className="flex-between mb-4">
                <h2>❤️ My Bookshelf</h2>
                <span className="text-muted">{books.length} Saved</span>
            </div>

            {books.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h3>Your shelf is empty 🕸️</h3>
                    <p className="text-muted">
                        Go to the <Link to="/">Library</Link> and click the ❤️ button to save books here.
                    </p>
                </div>
            ) : (
                <div className="grid">
                    {books.map(book => (
                        <div key={book._id} className="card">
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{book.title}</h3>
                            
                            <div className="text-muted mb-4">
                                By {book.author?.username || "Unknown"}
                            </div>

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

export default Bookshelf;