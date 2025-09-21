import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminDashboardPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  async function fetchIssues() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading issues...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map(issue => (
          <div key={issue.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">{issue.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{issue.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{new Date(issue.created_at).toLocaleDateString()}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
              }`}>{issue.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboardPage;