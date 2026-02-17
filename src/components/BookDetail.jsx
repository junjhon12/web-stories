import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
    
    const currentUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    // Helper to check if the current user is the author
    const isOwner = book && book.author && (book.author._id === currentUserId || book.author === currentUserId);

    useEffect(() => {
        // Fetch Book & Chapters
        fetch(`http://localhost:5000/api/books/${id}`)
            .then(res => res.json())
            .then(data => {
                setBook(data.book);
                setChapters(data.chapters);
            })
            .catch(err => console.error(err));

        // Check if saved (Bookshelf)
        if (token) {
            fetch('http://localhost:5000/api/bookshelf', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(savedBooks => {
                const found = savedBooks.find(b => b._id === id);
                setIsSaved(!!found);
            });
        }
    }, [id, token]);

    // --- NEW: DELETE BOOK FUNCTION ---
    const handleDeleteBook = async () => {
        if (!window.confirm("⚠️ WARNING: This will delete the entire book, all chapters, and all comments. This cannot be undone. Are you sure?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/books/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert("Book deleted successfully.");
                navigate('/'); // Send them back to the library
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const toggleSave = async () => {
        if (!token) return alert("Please login to save books!");
        const response = await fetch(`http://localhost:5000/api/books/${id}/save`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setIsSaved(data.isSaved);
    };

    if (!book) return <div className="container text-center mt-4">Loading Book...</div>;

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            
            {/* BOOK HEADER CARD */}
            <div className="card" style={{ textAlign: 'center', marginBottom: '40px', padding: '40px', position: 'relative' }}>
                
                {/* Save Button (Heart) */}
                <button 
                    onClick={toggleSave}
                    style={{ 
                        position: 'absolute', top: '20px', right: '20px', 
                        fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' 
                    }}
                    title={isSaved ? "Remove from Bookshelf" : "Add to Bookshelf"}
                >
                    {isSaved ? "❤️" : "🤍"}
                </button>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{book.title}</h1>
                <p className="text-muted" style={{ fontSize: '1.1rem' }}>
                    By {book.author?.username || "Unknown Author"} • 👁️ {book.views} Views
                </p>
                <p style={{ marginTop: '20px', color: '#c9d1d9', lineHeight: '1.6' }}>{book.description}</p>
                
                {/* --- NEW: OWNER ACTIONS (Delete Book) --- */}
                {isOwner && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '20px' }}>
                        <button 
                            onClick={() => navigate(`/books/${book._id}/new-chapter`)} 
                            className="btn btn-primary"
                            style={{ marginRight: '10px' }}
                        >
                            + Write New Chapter
                        </button>
                        
                        <button 
                            onClick={handleDeleteBook}
                            className="btn btn-danger"
                            style={{ backgroundColor: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d' }}
                        >
                            🗑️ Delete Entire Book
                        </button>
                    </div>
                )}
            </div>

            {/* TABLE OF CONTENTS */}
            <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px' }}>
                Table of Contents ({chapters.length})
            </h3>

            {chapters.length === 0 ? (
                <div className="text-muted text-center">No chapters yet. Start writing!</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {chapters.map((chapter, index) => (
                        <div key={chapter._id} className="card flex-between" style={{ padding: '15px' }}>
                            <span style={{ fontWeight: 500 }}>
                                <span className="text-muted" style={{ marginRight: '10px' }}>Chapter {index + 1} |</span>
                                {chapter.title}
                            </span>
                            
                            <div>
                                <button onClick={() => navigate(`/read/${chapter._id}`)} className="btn btn-primary" style={{ marginRight: '10px', padding: '5px 10px' }}>Read</button>

                                {/* Chapter-Level Edit/Delete */}
                                {isOwner && (
                                    <>
                                        <button onClick={() => navigate(`/chapters/${chapter._id}/edit`)} className="btn btn-secondary" style={{ marginRight: '10px', padding: '5px 10px' }}>Edit</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookDetail;