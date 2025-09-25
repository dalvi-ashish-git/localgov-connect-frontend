import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [issues, setIssues] = useState([]);
    const [trendingIssues, setTrendingIssues] = useState([]); // Trending issues ke liye naya state
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserAndInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            // Dono functions ko user milne ke baad call karein
            fetchIssues(user);
            fetchTrendingIssues();
        };
        fetchUserAndInitialData();
    }, []);
    
    useEffect(() => {
        if (!user) return;
        // Real-time listener ko alag rakhein taaki woh sirf zaroorat par chale
        const channel = supabase
            .channel('public-feed-final')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'issue_likes' }, () => {
                fetchIssues(user);
                fetchTrendingIssues(); // Likes badalne par trending issues bhi update karein
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchIssues(user))
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchIssues = async (currentUser) => {
        setLoading(true);
        try {
            let { data, error } = await supabase
                .from('issues')
                .select(`id, title, description, status, image_url, user_full_name, user_avatar_url, issue_likes(user_id), comments(count)`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const processedIssues = data.map(issue => ({
                ...issue,
                like_count: issue.issue_likes.length,
                comment_count: issue.comments[0]?.count || 0,
                is_liked_by_user: currentUser ? issue.issue_likes.some(like => like.user_id === currentUser.id) : false
            }));
            
            setIssues(processedIssues);
        } catch (error) {
            console.error('Error fetching issues:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Naya function jo trending issues fetch karega
    const fetchTrendingIssues = async () => {
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            
            let { data, error } = await supabase
                .from('issues')
                .select('id, title, issue_likes(count)')
                .gt('created_at', sevenDaysAgo) // Sirf pichhle 7 din ke issues
                .order('created_at', { ascending: false }); // Pehle naye issues layein

            if (error) throw error;

            // Likes ke hisab se sort karein aur top 3 lein
            const sortedByLikes = data.sort((a, b) => (b.issue_likes[0]?.count || 0) - (a.issue_likes[0]?.count || 0));
            setTrendingIssues(sortedByLikes.slice(0, 3));

        } catch(error) {
            console.error("Error fetching trending issues:", error.message);
        }
    };
    
    const handleLikeToggle = async (issueId, isLiked) => {
        if (!user) {
            alert("You must be logged in to like a post.");
            return;
        }

        setIssues(currentIssues => 
            currentIssues.map(issue => {
                if (issue.id === issueId) {
                    return { ...issue, is_liked_by_user: !isLiked, like_count: isLiked ? issue.like_count - 1 : issue.like_count + 1 };
                }
                return issue;
            })
        );
        
        if (isLiked) {
            await supabase.from('issue_likes').delete().match({ issue_id: issueId, user_id: user.id });
        } else {
            await supabase.from('issue_likes').insert({ issue_id: issueId, user_id: user.id });
        }
    };

    if (loading) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    return (
        <div className="min-h-full rounded-lg" style={{backgroundImage: `url('https://www.toptal.com/designers/subtlepatterns/uploads/double-bubble-outline.png')`}}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
                {/* Left Column: Issues Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {issues.map(issue => (
                        <div key={issue.id} className="bg-white p-4 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
                            <div className="flex items-center mb-4">
                                <img src={issue.user_avatar_url || 'https://placehold.co/40x40/EFEFEF/333333?text=U'} alt="user avatar" className="w-12 h-12 rounded-full mr-4 object-cover"/>
                                <div>
                                    <p className="font-semibold text-gray-800">{issue.user_full_name || 'Anonymous'}</p>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${issue.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{issue.status}</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">{issue.title}</h3>
                            <p className="text-gray-600 mb-4 break-words">{issue.description}</p>
                            {issue.image_url && <div className="mb-4 rounded-lg overflow-hidden"><img src={issue.image_url} alt={issue.title} className="w-full max-h-96 object-cover" /></div>}
                            <div className="flex justify-between items-center text-gray-500 text-sm border-t pt-3">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleLikeToggle(issue.id, issue.is_liked_by_user)} className="flex items-center gap-1.5 transition-transform duration-200 ease-in-out transform hover:scale-110">
                                        <span className={`text-2xl ${issue.is_liked_by_user ? 'text-red-500' : 'text-gray-300'}`}>❤️</span>
                                        <span className="font-semibold">{issue.like_count}</span>
                                    </button>
                                    <Link to={`/dashboard/issue/${issue.id}`} className="flex items-center gap-1.5"><span>💬</span><span className="font-semibold">{issue.comment_count}</span></Link>
                                </div>
                                <Link to={`/dashboard/issue/${issue.id}`} className="text-blue-600 font-semibold hover:underline">View Details</Link>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Right Column: Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-4">Community Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span className="font-semibold">Total Issues:</span><span>{issues.length}</span></div>
                            <div className="flex justify-between"><span className="font-semibold text-green-600">Resolved:</span><span>{issues.filter(i => i.status === 'Resolved').length}</span></div>
                        </div>
                    </div>
                    {/* Trending Issues Card (Naya section) */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-4">🔥 Trending Issues</h3>
                        <ul className="space-y-3">
                            {trendingIssues.map(issue => (
                                <li key={issue.id} className="text-sm">
                                    <Link to={`/dashboard/issue/${issue.id}`} className="text-gray-700 hover:text-blue-600 hover:underline">
                                        <p className="font-semibold truncate">{issue.title}</p>
                                        <p className="text-xs text-gray-500">{issue.issue_likes[0]?.count || 0} Likes</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                           <li><Link to="/dashboard/report-issue" className="text-blue-600 hover:underline">➕ Report a New Issue</Link></li>
                           <li><Link to="/dashboard/my-activity" className="text-blue-600 hover:underline">📊 View My Activity</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

