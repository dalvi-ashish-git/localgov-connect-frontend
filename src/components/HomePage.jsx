import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function HomePage() {
  const [issues, setIssues] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
    
    // Listen for new issues and comments in real-time
    const channel = supabase
      .channel('realtime feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, fetchIssues)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'upvotes' }, fetchIssues)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchIssues)
      .subscribe();

    fetchIssues();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchIssues() {
    // Ab hum issues ke saath unka upvote aur comment count dono fetch kar rahe hain
    const { data, error } = await supabase
      .from('issues')
      .select('*, upvotes(count), comments(count)') // Yeh upvote aur comment count laayega
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching issues:", error);
    } else {
      setIssues(data);
    }
  }

  async function handleUpvote(issueId) {
    if (!user) {
      alert("Please login to upvote.");
      return;
    }
    try {
        const { data: existingUpvote } = await supabase
            .from('upvotes').select('*').eq('issue_id', issueId).eq('user_id', user.id).single();
        if (existingUpvote) {
            await supabase.from('upvotes').delete().eq('issue_id', issueId).eq('user_id', user.id);
        } else {
            await supabase.from('upvotes').insert({ issue_id: issueId, user_id: user.id });
        }
    } catch (error) {
        // Handle error silently for better UX
        console.error("Upvote error:", error);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {issues.map((issue) => (
          <div key={issue.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
                <img src={issue.user_avatar_url || `https://via.placeholder.com/150`} alt={issue.user_full_name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                <div>
                  <p className="font-semibold">{issue.user_full_name || 'User'}</p>
                  <p className={`text-xs px-2 py-1 rounded-full inline-block bg-yellow-100 text-yellow-700`}>{issue.status}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{issue.title}</h3>
              <p className="text-gray-600 mb-4">{issue.description}</p>
              {issue.image_url && <img src={issue.image_url} alt={issue.title} className="w-full h-64 object-cover rounded-lg mb-4" />}
            
            <div className="flex justify-between text-gray-500">
              <button onClick={() => handleUpvote(issue.id)} className="flex items-center gap-2 hover:text-red-500">
                ❤️ {issue.upvotes[0]?.count || 0} Likes
              </button>
              {/* Yahan comment count ab sahi dikhega */}
              <Link to={`/dashboard/issue/${issue.id}`} className="flex items-center gap-2 hover:text-blue-500">
                💬 {issue.comments[0]?.count || 0} Comments
              </Link>
            </div>
          </div>
        ))}
      </div>
      {/* ... Right Sidebar ... */}
    </div>
  );
}

export default HomePage;