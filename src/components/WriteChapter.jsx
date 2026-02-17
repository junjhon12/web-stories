import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css';
import MoodMap from './MoodMap'; // Ensure you have this component!

const WriteChapter = () => {
    const { bookId, chapterId } = useParams(); 
    const navigate = useNavigate();
    
    // Story State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const isEditMode = Boolean(chapterId);

    // AI State
    const [critique, setCritique] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Quill Configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'clean']
        ],
    };

    useEffect(() => {
        if (isEditMode) {
            fetch(`http://localhost:5000/api/chapters/${chapterId}`)
                .then(res => res.json())
                .then(data => {
                    setTitle(data.title);
                    setContent(data.content);
                })
                .catch(err => console.error(err));
        }
    }, [isEditMode, chapterId]);

    // --- AI CRITIQUE FUNCTION ---
    const handleCritique = async () => {
        const token = localStorage.getItem('token');
        if (content.length < 100) return alert("Please write at least 100 characters first!");
        
        setAnalyzing(true);
        setCritique(null); // Clear previous results

        try {
            const response = await fetch('http://localhost:5000/api/ai/critique', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ content, bookTitle: title || "Untitled Story" }),
            });

            const data = await response.json();
            if (response.ok) {
                setCritique(data);
            } else {
                alert(data.message || "AI Error");
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("The AI is currently unavailable.");
        }
        setAnalyzing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = isEditMode ? `http://localhost:5000/api/chapters/${chapterId}` : `http://localhost:5000/api/books/${bookId}/chapters`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, content }),
            });

            if (response.ok) {
                navigate(-1); 
            }
        } catch (error) { console.error("Error:", error); }
    };

    return (
        <div className="container" style={{ maxWidth: '1000px', display: 'flex', gap: '20px' }}>
            
            {/* LEFT COLUMN: WRITING AREA */}
            <div className="card" style={{ flex: 2 }}>
                <h2>{isEditMode ? "Edit Chapter" : "Write New Chapter"}</h2>
                <form onSubmit={handleSubmit}>
                    <label>Chapter Title:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    
                    <label>Story Content:</label>
                    <div style={{ backgroundColor: '#fff', color: '#000', borderRadius: '4px', marginBottom: '20px' }}>
                        <ReactQuill 
                            theme="snow" 
                            value={content} 
                            onChange={setContent} 
                            modules={modules}
                            style={{ height: '400px', marginBottom: '50px' }} 
                        />
                    </div>
                    
                    <div className="flex-between">
                        <button type="submit" className="btn btn-primary">
                            {isEditMode ? "Update Chapter" : "Publish Chapter"}
                        </button>
                        
                        {/* AI BUTTON */}
                        <button 
                            type="button" 
                            onClick={handleCritique} 
                            className="btn btn-secondary"
                            disabled={analyzing}
                            style={{ background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)', border: 'none' }}
                        >
                            {analyzing ? "Reading..." : "✨ Get AI Feedback"}
                        </button>
                    </div>
                </form>
            </div>

            {/* RIGHT COLUMN: AI FEEDBACK PANEL */}
            {critique && (
                <div className="card" style={{ flex: 1, height: 'fit-content', border: '1px solid #444c56' }}>
                    <h3 style={{ borderBottom: '1px solid #444c56', paddingBottom: '10px' }}>🤖 Ghostwriter's Report</h3>
                    
                    {/* The Radar Chart */}
                    <div style={{ margin: '20px 0' }}>
                        <MoodMap grades={critique.grades} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h4>📈 Quick Grades</h4>
                        <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#c9d1d9' }}>
                            <li><strong>Structure:</strong> {critique.grades.structure}</li>
                            <li><strong>Pacing:</strong> {critique.grades.pacing}</li>
                            <li><strong>Characters:</strong> {critique.grades.characters}</li>
                        </ul>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h4>💡 Top 3 Tips</h4>
                        <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#c9d1d9' }}>
                            {critique.tips.map((tip, i) => (
                                <li key={i} style={{ marginBottom: '8px' }}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                    
                    <button onClick={() => setCritique(null)} className="btn btn-secondary btn-block" style={{ fontSize: '0.8rem' }}>
                        Close Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default WriteChapter;