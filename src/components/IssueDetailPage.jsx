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
    const [isAdmin, setIsAdmin] = useState(false);

    // Edit functionality states
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedContent, setEditedContent] = useState('');

    // Step 1: Get the current user
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user && user.user_metadata?.role === 'admin') {
                setIsAdmin(true);
            }
        };
        getCurrentUser();
    }, []);

    // Step 2: Fetch data after we have the user info
    useEffect(() => {
        if (id) {
            fetchIssueAndComments();
        }
    }, [id, user]);

    // Step 3: Set up real-time subscriptions
    useEffect(() => {
        const channel = supabase
            .channel(`public-comments-and-likes-for-issue-${id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `issue_id=eq.${id}` }, () => fetchIssueAndComments())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'issue_likes', filter: `issue_id=eq.${id}` }, () => fetchIssueAndComments())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, user]);

    async function fetchIssueAndComments() {
        setLoading(true);
        try {
            // Using the correct foreign key column name: 'department_id'
            const { data: issueData, error: issueError } = await supabase
                .from('issues')
                .select('*, department:department_id(name), issue_likes(user_id)')
                .eq('id', id)
                .single();

            if (issueError) throw issueError;
            
            const processedIssue = {
                ...issueData,
                departments: issueData.department, // Keep data structure consistent
                like_count: issueData.issue_likes.length,
                is_liked_by_user: user ? issueData.issue_likes.some(like => like.user_id === user.id) : false
            };
            setIssue(processedIssue);

            const { data: commentsData, error: commentsError } = await supabase.from('comments').select('*').eq('issue_id', id).order('created_at', { ascending: true });
            if (commentsError) throw commentsError;
            setComments(commentsData);

        } catch (error) {
            console.error("Error fetching data:", error.message);
            setIssue(null);
        } finally {
            setLoading(false);
        }
    }
    
    // ... (rest of the component's functions: handleLikeToggle, handleAddComment, etc. are the same) ...

    const handleLikeToggle = async () => {
        if (!user) { alert("You must be logged in to like."); return; }
        const isLiked = issue.is_liked_by_user;
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        }
    };

    if (loading) return <div className="dark:text-white p-8">Loading issue details...</div>;
    if (!issue) return <div className="dark:text-white p-8">Issue not found.</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="border-b dark:border-gray-700 pb-4 mb-6">
                     <div className="flex justify-between items-start">
                         <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{issue.title}</h1>
                         <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(issue.status)}`}>
                             {issue.status}
                         </span>
                     </div>
                     {issue.departments && <p className="text-md text-gray-500 dark:text-gray-400 mb-4">Assigned to: <span className="font-semibold">{issue.departments.name}</span></p>}
                     <p className="text-gray-700 dark:text-gray-300">{issue.description}</p>
                     <div className="flex items-center gap-2 mt-4">
                         <button onClick={handleLikeToggle} className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${issue.is_liked_by_user ? 'bg-red-100 dark:bg-red-900/20' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'}`}>
                             <span className={`text-xl ${issue.is_liked_by_user ? 'text-red-500' : 'text-gray-400'}`}>❤️</span>
                         </button>
                         <span className="font-semibold text-gray-600 dark:text-gray-300">{issue.like_count} {issue.like_count === 1 ? 'Like' : 'Likes'}</span>
                     </div>
                </div>
                
                {issue.image_url && <img src={issue.image_url} alt={issue.title} className="w-full max-w-lg mx-auto rounded-lg mb-6 shadow" />}
                
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Comments ({comments.length})</h2>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-4 items-start">
                            <img src={comment.user_avatar_url || 'https://placehold.co/40x40/EFEFEF/333333?text=U'} alt="avatar" className="w-10 h-10 rounded-full"/>
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{comment.user_full_name || 'Anonymous'}</p>
                                    {user && (user.id === comment.user_id || isAdmin) && !editingCommentId && (
                                        <div className="flex gap-2 text-xs">
                                            {user.id === comment.user_id && <button onClick={() => startEditing(comment)} className="text-blue-500 hover:underline">Edit</button>}
                                            <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:underline">Delete</button>
                                        </div>
                                    )}
                                </div>
                                {editingCommentId === comment.id ? (
                                    <div className="mt-2">
                                        <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"/>
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => handleUpdateComment(comment.id)} className="bg-green-500 text-white px-2 py-1 text-xs rounded">Save</button>
                                            <button onClick={() => setEditingCommentId(null)} className="bg-gray-200 dark:bg-gray-600 px-2 py-1 text-xs rounded">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-800 dark:text-gray-200 mt-1">{comment.content}</p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {user ? (
                    <form onSubmit={handleAddComment}>
                        <textarea className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600" rows="3" placeholder="Write a public comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
                        <button type="submit" className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Post Comment</button>
                    </form>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to post a comment.</p>
                )}
            </div>
        </div>
    );
}

export default IssueDetailPage;