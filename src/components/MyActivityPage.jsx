import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function MyActivityPage() {
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyIssues();
  }, []);

  async function fetchMyIssues() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setMyIssues(data);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading your reported issues...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Activity - Your Reported Issues</h1>
      
      {myIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myIssues.map(issue => (
            <div key={issue.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image Placeholder */}
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-400">Issue Image</p>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{issue.title}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    issue.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {issue.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-1">📅 {new Date(issue.created_at).toLocaleDateString()}</p>
                {issue.location && <p className="text-sm text-gray-500">📍 Near City Park</p>}
                
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p>You have not reported any issues yet.</p>
        </div>
      )}
    </div>
  );
}

export default MyActivityPage;