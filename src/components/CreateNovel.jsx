import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CreateNovel = () => {
    const [title, setTitle] = useState('');
    const [chapter, setChapter] = useState('');
    
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // 1. Redirect if not logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You must be logged in to write a story!");
            navigate('/login');
        }
    }, [navigate]);

    // 2. Fetch data if editing
    useEffect(() => {
        if (isEditMode) {
            fetch(`http://localhost:5000/api/novels/${id}`)
                .then(res => res.json())
                .then(data => {
                    setTitle(data.title);
                    setChapter(data.chapter);
                })
                .catch(err => console.error("Error loading novel:", err));
        }
    }, [id, isEditMode]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const novelData = { title, chapter };
        
        const url = isEditMode 
            ? `http://localhost:5000/api/novels/${id}` 
            : 'http://localhost:5000/api/novels';
            
        const method = isEditMode ? 'PUT' : 'POST';

        // 3. Get token inside the function
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <--- Authorization Header Added Here
                },
                body: JSON.stringify(novelData),
            });

            if (response.ok) {
                alert(isEditMode ? "Novel Updated!" : "Novel Created!");
                navigate('/'); 
            } else {
                alert("Failed to save. Are you logged in?");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h2>{isEditMode ? "Edit Novel" : "Create New Novel"}</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Title:</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        style={{ width: '100%', display: 'block' }} 
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Chapter:</label>
                    <textarea 
                        value={chapter} 
                        onChange={(e) => setChapter(e.target.value)} 
                        rows="10" 
                        style={{ width: '100%', display: 'block' }} 
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
                    {isEditMode ? "Update" : "Publish"}
                </button>
            </form>
        </div>
    );
};

export default CreateNovel;