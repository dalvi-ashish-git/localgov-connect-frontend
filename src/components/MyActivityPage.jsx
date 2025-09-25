import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate ko import kiya

const MyActivityPage = () => {
    const [allMyIssues, setAllMyIssues] = useState([]); // Saare issues yahan store honge
    const [filteredIssues, setFilteredIssues] = useState([]); // Filter hone ke baad issues yahan store honge
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All'); // Filter ke liye state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUserData();
    }, []);

    const fetchMyIssues = async () => {
        if (!user) return; 
        setLoading(true);
        try {
            // FEATURE 4: Location bhi select kiya
            let { data, error } = await supabase
                .from('issues')
                .select('id, title, status, created_at, image_url, location') 
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            setAllMyIssues(data);
            setFilteredIssues(data); // Shuruaat mein saare issues dikhayein

        } catch (error) {
            console.error('Error fetching your issues:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(user) {
            fetchMyIssues();
        }
    }, [user]);

    // FEATURE 2: Status ke hisab se filter karne ka logic
    useEffect(() => {
        if (filterStatus === 'All') {
            setFilteredIssues(allMyIssues);
        } else {
            const filtered = allMyIssues.filter(issue => issue.status === filterStatus);
            setFilteredIssues(filtered);
        }
    }, [filterStatus, allMyIssues]);

    // FEATURE 1: Issue ko delete karne ka function
    const handleDelete = async (issueId) => {
        // Note: window.confirm ek basic tareeka hai. Professional apps mein custom modal use hota hai.
        const isConfirmed = window.confirm("Are you sure you want to delete this issue? This action cannot be undone.");
        if (!isConfirmed) return;

        try {
            const { error } = await supabase.from('issues').delete().eq('id', issueId);
            if (error) throw error;
            // Page refresh kiye bina list se issue hata dein
            setAllMyIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));
        } catch (error) {
            console.error("Error deleting issue:", error.message);
            alert("Failed to delete issue.");
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading your reported issues...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Activity</h1>
                {/* FEATURE 2: Filter buttons */}
                <div className="flex gap-2">
                    {['All', 'Pending', 'Resolved'].map(status => (
                        <button 
                            key={status} 
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            
            {allMyIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIssues.map(issue => (
                        <div key={issue.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                            {issue.image_url ? (
                                <img src={issue.image_url} alt={issue.title} className="w-full h-40 object-cover" />
                            ) : (
                                <div className="h-40 bg-gray-200 flex items-center justify-center">
                                    <p className="text-gray-400">No Image Provided</p>
                                </div>
                            )}
                            
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{issue.title}</h3>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                        issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {issue.status}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-1">📅 {new Date(issue.created_at).toLocaleDateString()}</p>
                                {/* FEATURE 4: Location yahan dikhega */}
                                {issue.location && <p className="text-sm text-gray-500">📍 {issue.location}</p>}
                                
                                <div className="mt-auto pt-4 flex gap-2">
                                    <Link to={`/dashboard/issue/${issue.id}`} className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                                        View
                                    </Link>
                                    {/* FEATURE 1: Delete button */}
                                    <button onClick={() => handleDelete(issue.id)} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // FEATURE 3: Shortcut button
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

