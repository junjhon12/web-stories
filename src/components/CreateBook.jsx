import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateBook = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            alert("Please login first!");
            navigate('/login');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5000/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description }),
            });

            if (response.ok) {
                navigate('/'); 
            } else {
                alert("Failed to create book");
            }
        } catch (error) { console.error("Error:", error); }
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <div className="card">
                <h2 className="mb-4">Create New Book</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Book Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. The Martian" />
                    </div>
                    <div>
                        <label>Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" placeholder="What is this story about?" />
                    </div>
                    <div className="flex-between">
                        <button type="submit" className="btn btn-primary">Create Jacket</button>
                        <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBook;