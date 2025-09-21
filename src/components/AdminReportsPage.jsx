import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminReportsPage() {
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

  // Naya function status update karne ke liye
  async function handleStatusChange(issueId, newStatus) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .update({ status: newStatus })
        .eq('id', issueId);

      if (error) throw error;

      // UI mein bhi status turant update karein
      setIssues(currentIssues =>
        currentIssues.map(issue =>
          issue.id === issueId ? { ...issue, status: newStatus } : issue
        )
      );
      alert('Status updated successfully!');

    } catch (error) {
      alert(error.message);
    }
  }

  if (loading) return <p>Loading reports...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Reported Issues</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issues.map(issue => (
              <tr key={issue.id}>
                <td className="px-6 py-4 whitespace-nowrap">{issue.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                  }`}>{issue.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(issue.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* Status badalne ke liye dropdown */}
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    className="border border-gray-300 rounded-md p-1"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminReportsPage;