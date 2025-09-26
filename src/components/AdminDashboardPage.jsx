import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminDashboardPage() {
  const [recentIssues, setRecentIssues] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null); // For Modal

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data, error, count } = await supabase
          .from('issues')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentIssues(data);

        const pending = data.filter(i => i.status === 'Pending').length;
        const resolved = data.filter(i => i.status === 'Resolved').length;
        setStats({ total: count, pending, resolved });
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading dashboard...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-white font-sans">

      <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-xl shadow-md text-center transition hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-600">Total Issues</h3>
          <p className="text-4xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-xl shadow-md text-center transition hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-600">Recently Pending</h3>
          <p className="text-4xl font-bold mt-2 text-yellow-500">{stats.pending}</p>
        </div>
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-xl shadow-md text-center transition hover:shadow-xl">
          <h3 className="text-lg font-semibold text-gray-600">View Full Analytics</h3>
          <a href="/admin/analytics" className="mt-2 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition">
            Go to Analytics →
          </a>
        </div>
      </div>

      {/* Recent Issues */}
      <h2 className="text-2xl font-bold mb-4">Recent 5 Issues</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentIssues.map(issue => (
          <div
            key={issue.id}
            onClick={() => setSelectedIssue(issue)}
            className="cursor-pointer bg-white/40 backdrop-blur-md p-4 rounded-xl shadow-md hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">{issue.title}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>{issue.status}</span>
            </div>
            <p className="text-sm text-gray-500 truncate">{issue.description}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 w-11/12 max-w-2xl shadow-xl relative">
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-xl"
            >
              &times;
            </button>

            <h3 className="text-2xl font-bold mb-2">{selectedIssue.title}</h3>
            <p className="text-gray-700 mb-4">{selectedIssue.description}</p>
            {selectedIssue.image_url && (
              <img
                src={selectedIssue.image_url}
                alt={selectedIssue.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex justify-between items-center text-gray-600 mb-2">
              <span>Reporter: {selectedIssue.user_full_name || 'Anonymous'}</span>
              <span>Status: {selectedIssue.status}</span>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                onClick={() => {
                  // Optional: mark as resolved logic
                  setSelectedIssue(null);
                }}
              >
                Mark as Resolved
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setSelectedIssue(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboardPage;
