import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function AdminDashboardPage() {
  const [recentIssues, setRecentIssues] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Sirf 5 naye issues aur total stats fetch karein
            const { data, error, count } = await supabase
                .from('issues')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            
            setRecentIssues(data);

            // Stats calculate karein
            const pending = data.filter(i => i.status === 'Pending').length;
            const resolved = data.filter(i => i.status === 'Resolved').length;
            // Note: `count` aapke saare issues ka total dega, naaki sirf 5 ka
            setStats({ total: count, pending, resolved: "N/A" }); // Yahan resolved ka aakda seedha nahi milega

        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };
    fetchDashboardData();
  }, []);


  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, Admin!</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-500">Total Issues</h3>
            <p className="text-4xl font-bold mt-2">{stats.total}</p>
        </div>
         <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-500">Recently Pending</h3>
            <p className="text-4xl font-bold mt-2 text-yellow-500">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold text-gray-500">View Full Analytics</h3>
            <Link to="/admin/analytics" className="mt-2 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">
                Go to Analytics →
            </Link>
        </div>
      </div>

      {/* Recent Issues */}
      <h2 className="text-2xl font-bold mb-4">Recent 5 Issues</h2>
      <div className="bg-white p-4 rounded-lg shadow">
        {recentIssues.map(issue => (
          <div key={issue.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
            <div>
                <p className="font-semibold">{issue.title}</p>
                <p className="text-sm text-gray-500">{new Date(issue.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>{issue.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
