import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify'; // Security import
import CommentsSection from './CommentsSection';

const ReadChapter = () => {
    const { id } = useParams(); 
    const [chapter, setChapter] = useState(null);
    const hasCountedView = useRef(false);

    useEffect(() => {
        fetch(`http://localhost:5000/api/chapters/${id}`)
            .then(res => res.json())
            .then(data => {
                setChapter(data);
                // View tracking logic
                if (data.book?._id && !hasCountedView.current) {
                    fetch(`http://localhost:5000/api/books/${data.book._id}/view`, { method: 'POST' });
                    hasCountedView.current = true;
                }
            })
            .catch(err => console.error("Error loading chapter:", err));
            
        return () => { hasCountedView.current = false; };
    }, [id]);

    if (!chapter) return <div className="container text-center mt-4">Loading Story...</div>;

    // Clean the HTML content before rendering for security
    const cleanHTML = DOMPurify.sanitize(chapter.content);

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
            <div className="card">
                <Link to={`/books/${chapter.book?._id}`} className="text-muted" style={{ fontSize: '0.9rem' }}>
                    ← Back to Table of Contents
                </Link>

                <h1 style={{ textAlign: 'center', fontSize: '3rem', marginTop: '20px', fontFamily: 'Georgia, serif', borderBottom: '1px solid #30363d', paddingBottom: '20px' }}>
                    {chapter.title}
                </h1>
                
                {/* Render the sanitized HTML */}
                <div 
                    className="story-content"
                    style={{ fontSize: '1.25rem', lineHeight: '1.8', fontFamily: 'Georgia, serif', color: '#c9d1d9', marginTop: '30px' }}
                    dangerouslySetInnerHTML={{ __html: cleanHTML }} 
                />
            </div>
            <CommentsSection chapterId={id} />
        </div>
    );
};

export default ReadChapter;