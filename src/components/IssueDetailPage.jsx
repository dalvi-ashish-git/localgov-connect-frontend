import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function IssueDetailPage() {
    const { id } = useParams();
    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); // Admin status ke liye naya state

    // Edit functionality ke liye states
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedContent, setEditedContent] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user && user.user_metadata?.role === 'admin') {
                setIsAdmin(true);
            }
            fetchIssueAndComments(user);
        };
        fetchInitialData();
    }, [id]);

    useEffect(() => {
        const channel = supabase
            .channel(`public-comments-and-likes-for-issue-${id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `issue_id=eq.${id}`}, () => fetchIssueAndComments(user))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'issue_likes', filter: `issue_id=eq.${id}`}, () => fetchIssueAndComments(user))
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, user]);

    async function fetchIssueAndComments(currentUser) {
        setLoading(true);
        try {
            // Ab yeh likes bhi fetch karega
            const { data: issueData, error: issueError } = await supabase
                .from('issues')
                .select('*, departments(name), issue_likes(user_id)')
                .eq('id', id)
                .single();
            if (issueError) throw issueError;
            
            // Like ka data process karein
            const processedIssue = {
                ...issueData,
                like_count: issueData.issue_likes.length,
                is_liked_by_user: currentUser ? issueData.issue_likes.some(like => like.user_id === currentUser.id) : false
            };
            setIssue(processedIssue);

            const { data: commentsData, error: commentsError } = await supabase.from('comments').select('*').eq('issue_id', id).order('created_at', { ascending: true });
            if (commentsError) throw commentsError;
            setComments(commentsData);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    }
    
    // Naya function Like karne ke liye
    const handleLikeToggle = async () => {
        if (!user) { alert("You must be logged in to like."); return; }
        
        const isLiked = issue.is_liked_by_user;
        // Optimistic UI update
        setIssue({ ...issue, is_liked_by_user: !isLiked, like_count: isLiked ? issue.like_count - 1 : issue.like_count + 1 });

        if (isLiked) {
            await supabase.from('issue_likes').delete().match({ issue_id: id, user_id: user.id });
        } else {
            await supabase.from('issue_likes').insert({ issue_id: id, user_id: user.id });
        }
    };

    async function handleAddComment(e) {
        e.preventDefault();
        if (!user) { alert("You must be logged in to comment."); return; }
        if (!newComment.trim()) return;
        try {
            const { error } = await supabase.from('comments').insert({ 
                content: newComment, issue_id: id, user_id: user.id,
                user_full_name: user.user_metadata.full_name,
                user_avatar_url: user.user_metadata.avatar_url
            });
            if (error) throw error;
            setNewComment('');
        } catch (error) {
            alert(error.message);
        }
    }
    
    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                const { error } = await supabase.from('comments').delete().eq('id', commentId);
                if (error) throw error;
            } catch (error) {
                alert("Error deleting comment: " + error.message);
            }
        }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editedContent.trim()) return;
        try {
            const { error } = await supabase.from('comments').update({ content: editedContent }).eq('id', commentId);
            if (error) throw error;
            setEditingCommentId(null);
            setEditedContent('');
        } catch (error) {
            alert("Error updating comment: " + error.message);
        }
    };
    
    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditedContent(comment.content);
    };

    // Helper function for status colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (loading) return <p>Loading issue details...</p>;
    if (!issue) return <p>Issue not found.</p>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="border-b pb-4 mb-6">
                     <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold mb-2">{issue.title}</h1>
                        {/* UPDATED: Status color logic ab yahan se aayega */}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(issue.status)}`}>
                            {issue.status}
                        </span>
                    </div>
                    {issue.departments && <p className="text-md text-gray-500 mb-4">Assigned to: <span className="font-semibold">{issue.departments.name}</span></p>}
                    <p className="text-gray-700">{issue.description}</p>
                    {/* Like Button */}
                    <div className="flex items-center gap-2 mt-4">
                        <button onClick={handleLikeToggle} className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${issue.is_liked_by_user ? 'bg-red-100' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            <span className={`text-xl ${issue.is_liked_by_user ? 'text-red-500' : 'text-gray-400'}`}>❤️</span>
                        </button>
                        <span className="font-semibold text-gray-600">{issue.like_count} {issue.like_count === 1 ? 'Like' : 'Likes'}</span>
                    </div>
                </div>
                
                {issue.image_url && <img src={issue.image_url} alt={issue.title} className="w-full max-w-lg mx-auto rounded-lg mb-6 shadow" />}
                
                <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-4 items-start">
                            <img src={comment.user_avatar_url || 'https://placehold.co/40x40/EFEFEF/333333?text=U'} alt="avatar" className="w-10 h-10 rounded-full"/>
                            <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm">{comment.user_full_name || 'Anonymous'}</p>
                                    {/* Edit/Delete buttons */}
                                    {user && (user.id === comment.user_id || isAdmin) && !editingCommentId && (
                                        <div className="flex gap-2 text-xs">
                                            {user.id === comment.user_id && <button onClick={() => startEditing(comment)} className="text-blue-500 hover:underline">Edit</button>}
                                            <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:underline">Delete</button>
                                        </div>
                                    )}
                                </div>
                                {editingCommentId === comment.id ? (
                                    <div className="mt-2">
                                        <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full p-2 border rounded-md text-sm"/>
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => handleUpdateComment(comment.id)} className="bg-green-500 text-white px-2 py-1 text-xs rounded">Save</button>
                                            <button onClick={() => setEditingCommentId(null)} className="bg-gray-200 px-2 py-1 text-xs rounded">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-800 mt-1">{comment.content}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {user ? (
                    <form onSubmit={handleAddComment}>
                        <textarea className="w-full p-2 border rounded-lg" rows="3" placeholder="Write a public comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
                        <button type="submit" className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Post Comment</button>
                    </form>
                ) : (
                    <p className="text-center text-gray-500">Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to post a comment.</p>
                )}
            </div>
        </div>
    );
}

export default IssueDetailPage;

