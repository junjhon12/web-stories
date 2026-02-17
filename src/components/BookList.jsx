import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'popular'
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all books for the library view
        fetch('http://localhost:5000/api/books')
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error("Error fetching books:", err));
    }, []);

    // Sorting logic for the library
    const sortedBooks = [...books].sort((a, b) => {
        if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (books.length === 0) return <div className="spinner"></div>;

    return (
        <div className="container">
            <div className="flex-between mb-4">
                <h1 style={{ margin: 0 }}>Library</h1>
                
                {/* Sorting Toggle */}
                <div className="btn-group">
                    <button 
                        onClick={() => setSortBy('newest')} 
                        className={`btn ${sortBy === 'newest' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    >
                        Newest
                    </button>
                    <button 
                        onClick={() => setSortBy('popular')} 
                        className={`btn ${sortBy === 'popular' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                        Most Popular
                    </button>
                </div>
            </div>

            <div className="grid">
                {sortedBooks.map(book => (
                    <div key={book._id} className="card flex-column" style={{ justifyContent: 'space-between' }}>
                        <div>
                            <div className="flex-between">
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    By {book.author?.username || 'Unknown'}
                                </span>
                                <span style={{ fontSize: '0.85rem' }}>👁️ {book.views || 0}</span>
                            </div>
                            <h3 style={{ margin: '10px 0', fontSize: '1.4rem' }}>{book.title}</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                                {book.description?.substring(0, 100)}...
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => navigate(`/books/${book._id}`)} 
                            className="btn btn-primary btn-block"
                        >
                            Read Story
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookList;