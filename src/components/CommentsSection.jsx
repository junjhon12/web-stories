import React, { useState, useEffect } from 'react';

const CommentsSection = ({ chapterId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    
    // Get current user to show/hide delete buttons
    const currentUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    // Fetch comments when component loads
    useEffect(() => {
        fetch(`http://localhost:5000/api/chapters/${chapterId}/comments`)
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(err => console.error("Error loading comments:", err));
    }, [chapterId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            alert("Please login to comment!");
            return;
        }
        console.log("Submitting comment for Chapter ID:", chapterId);
        try {
            const response = await fetch(`http://localhost:5000/api/chapters/${chapterId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (response.ok) {
                const savedComment = await response.json();
                setComments([savedComment, ...comments]); // Add new comment to top of list
                setNewComment(''); // Clear input
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setComments(comments.filter(c => c._id !== commentId));
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    return (
        <div style={{ marginTop: '50px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <h3>Comments ({comments.length})</h3>

            {/* Comment Form */}
            {token ? (
                <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        required
                        rows="3"
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Post Comment
                    </button>
                </form>
            ) : (
                <p style={{ marginBottom: '30px', color: '#666' }}>
                    <a href="/login">Login</a> to leave a comment.
                </p>
            )}

            {/* Comments List */}
            {comments.map(comment => (
                <div key={comment._id} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong>{comment.author?.username || 'Anonymous'}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p style={{ margin: '5px 0' }}>{comment.content}</p>
                    
                    {/* Delete Button (Only for Author) */}
                    {comment.author?._id === currentUserId && (
                        <button 
                            onClick={() => handleDelete(comment._id)}
                            style={{ fontSize: '0.8rem', color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '5px' }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CommentsSection;