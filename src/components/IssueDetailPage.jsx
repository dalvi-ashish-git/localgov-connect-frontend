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

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            fetchIssueAndComments();
        };
        fetchInitialData();
    }, [id]);

    // Real-time listener for new comments
    useEffect(() => {
        const channel = supabase
            .channel(`public:comments:issue_id=eq.${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'comments',
                filter: `issue_id=eq.${id}`
            }, (payload) => {
                setComments(currentComments => [...currentComments, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    async function fetchIssueAndComments() {
        setLoading(true);
        try {
            const { data: issueData, error: issueError } = await supabase
                .from('issues')
                .select('*, departments(name)') // Department ka naam bhi fetch karein
                .eq('id', id)
                .single();
            if (issueError) throw issueError;
            setIssue(issueData);

            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*')
                .eq('issue_id', id)
                .order('created_at', { ascending: true });
            if (commentsError) throw commentsError;
            setComments(commentsData);

        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddComment(e) {
        e.preventDefault();
        if (!user) { alert("You must be logged in to comment."); return; }
        if (!newComment.trim()) return;

        try {
            // Comment ke saath user ka naam aur avatar bhi save karein
            const { error } = await supabase
                .from('comments')
                .insert({ 
                    content: newComment, 
                    issue_id: id, 
                    user_id: user.id,
                    user_full_name: user.user_metadata.full_name,
                    user_avatar_url: user.user_metadata.avatar_url
                });

            if (error) throw error;
            setNewComment('');
            // Real-time listener apne aap UI update kar dega
        } catch (error) {
            alert(error.message);
        }
    }

    if (loading) return <p>Loading issue details...</p>;
    if (!issue) return <p>Issue not found.</p>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                {/* Issue Details */}
                <div className="border-b pb-4 mb-6">
                     <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold mb-2">{issue.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>{issue.status}</span>
                    </div>
                    {issue.departments && (
                        <p className="text-md text-gray-500 mb-4">Assigned to: <span className="font-semibold">{issue.departments.name}</span></p>
                    )}
                    <p className="text-gray-700">{issue.description}</p>
                </div>
                
                {issue.image_url && <img src={issue.image_url} alt={issue.title} className="w-full max-w-lg mx-auto rounded-lg mb-6 shadow" />}

                {/* Comments Section */}
                <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <img src={comment.user_avatar_url || 'https://placehold.co/40x40/EFEFEF/333333?text=U'} alt="avatar" className="w-10 h-10 rounded-full"/>
                            <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                <p className="font-semibold text-sm">{comment.user_full_name || 'Anonymous'}</p>
                                <p className="text-gray-800">{comment.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Comment Form */}
                {user ? (
                    <form onSubmit={handleAddComment}>
                        <textarea
                            className="w-full p-2 border rounded-lg"
                            rows="3"
                            placeholder="Write a public comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <button type="submit" className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Post Comment
                        </button>
                    </form>
                ) : (
                    <p className="text-center text-gray-500">Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to post a comment.</p>
                )}
            </div>
        </div>
    );
}

export default IssueDetailPage;
