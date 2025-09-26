import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const MyActivityPage = () => {
    const [allMyIssues, setAllMyIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDataAndIssues = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                fetchMyIssues(user.id);
            } else {
                setLoading(false);
            }
        };
        fetchUserDataAndIssues();
    }, []);

    // Real-time listener for any changes to the user's issues
    useEffect(() => {
        if (!user) return;
        const channel = supabase
            .channel(`my-issues-channel-${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'issues',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchMyIssues(user.id);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchMyIssues = async (userId) => {
        setLoading(true);
        try {
            let { data, error } = await supabase
                .from('issues')
                .select('id, title, status, created_at, image_url, location')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setAllMyIssues(data || []);
        } catch (error) {
            console.error('Error fetching your issues:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    useEffect(() => {
        if (filterStatus === 'All') {
            setFilteredIssues(allMyIssues);
        } else {
            const filtered = allMyIssues.filter(issue => issue.status === filterStatus);
            setFilteredIssues(filtered);
        }
    }, [filterStatus, allMyIssues]);

    const handleDelete = async (issueId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this issue? This action cannot be undone.");
        if (!isConfirmed) return;
        try {
            const { error } = await supabase.from('issues').delete().eq('id', issueId);
            if (error) throw error;
            setAllMyIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));
        } catch (error) {
            console.error("Error deleting issue:", error.message);
            alert("Failed to delete issue.");
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading your reported issues...</div>;
    }

    const StatusBadge = ({ status }) => {
        const colors = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Resolved: 'bg-green-100 text-green-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            Rejected: 'bg-red-100 text-red-800'
        };
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
    };
    
    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">My Activity</h1>
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(status => (
                        <button 
                            key={status} 
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${filterStatus === status ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            
            {allMyIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIssues.map(issue => (
                        <div key={issue.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform hover:scale-105">
                            {issue.image_url ? (
                                <img src={issue.image_url} alt={issue.title} className="w-full h-48 object-cover" />
                            ) : (
                                <div className="h-48 bg-gray-200 flex items-center justify-center">
                                    <p className="text-gray-400">No Image Provided</p>
                                </div>
                            )}
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg leading-tight">{issue.title}</h3>
                                    <StatusBadge status={issue.status} />
                                </div>
                                <p className="text-sm text-gray-500 mb-2">📅 {new Date(issue.created_at).toLocaleDateString()}</p>
                                {issue.location && <p className="text-sm text-gray-500 truncate">📍 {issue.location}</p>}
                                <div className="mt-auto pt-4 flex gap-2">
                                    <Link to={`/dashboard/issue/${issue.id}`} className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
                                        View
                                    </Link>
                                    <button onClick={() => handleDelete(issue.id)} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-semibold mb-2">No issues reported yet!</h2>
                    <p className="text-gray-600 mb-4">Click the button below to report your first issue and help improve your community.</p>
                    <button onClick={() => navigate('/dashboard/report-issue')} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
                        Report Your First Issue
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyActivityPage;

