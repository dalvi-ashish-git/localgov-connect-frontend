import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminReportsPage() {
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All"); // Filter state

  // Fetch issues and departments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [issuesRes, deptRes] = await Promise.all([
          supabase.from('issues').select('*, departments(name)').order('created_at', { ascending: false }),
          supabase.from('departments').select('*')
        ]);

        if (issuesRes.error) console.error(issuesRes.error.message);
        else setIssues(issuesRes.data);

        if (deptRes.error) console.error(deptRes.error.message);
        else setDepartments(deptRes.data);

      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update status
  const handleStatusChange = async (issueId, newStatus) => {
    if(newStatus === "All") return; // "All" option se koi update nahi
    try {
      const { error } = await supabase.from('issues').update({ status: newStatus }).eq('id', issueId);
      if (error) throw error;

      setIssues(cur => cur.map(issue => issue.id === issueId ? { ...issue, status: newStatus } : issue));
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  // Update department
  const handleDepartmentChange = async (issueId, deptId) => {
    const deptIdToSave = deptId === "" ? null : deptId;
    try {
      const { error } = await supabase.from('issues').update({ department_id: deptIdToSave }).eq('id', issueId);
      if (error) throw error;

      setIssues(cur => cur.map(issue => issue.id === issueId ? { 
        ...issue, 
        department_id: deptIdToSave, 
        departments: departments.find(d => d.id == deptIdToSave) || null 
      } : issue));

    } catch (err) {
      alert("Department update failed: " + err.message);
    }
  };

  // Filtered issues based on status
  const filteredIssues = statusFilter === "All" ? issues : issues.filter(i => i.status === statusFilter);

  if (loading) return <p className="text-center mt-10">Loading reports...</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-white font-sans">
      <h1 className="text-3xl font-bold mb-6">All Reported Issues</h1>

      {/* Status Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-1 rounded-md"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 backdrop-blur-md bg-white/40 rounded-xl shadow-lg">
          <thead className="bg-white/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredIssues.map(issue => (
              <tr key={issue.id} className="cursor-pointer hover:bg-white/50 transition" onClick={() => setSelectedIssue(issue)}>
                <td className="px-6 py-4">{issue.title}</td>
                <td className="px-6 py-4">
                  <select
                    value={issue.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    className="border p-1 rounded-md text-sm"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={issue.department_id || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleDepartmentChange(issue.id, e.target.value)}
                    className="border p-1 rounded-md text-sm"
                  >
                    <option value="">Not Assigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4">{new Date(issue.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg relative">
            <button className="absolute top-3 right-3 text-gray-600 text-xl font-bold" onClick={() => setSelectedIssue(null)}>×</button>
            <h2 className="text-2xl font-bold mb-2">{selectedIssue.title}</h2>
            {selectedIssue.image_url && (
              <img src={selectedIssue.image_url} alt={selectedIssue.title} className="mb-4 rounded-md max-h-64 w-full object-cover" />
            )}
            <p className="mb-2"><strong>Description:</strong> {selectedIssue.description}</p>
            <p className="mb-1"><strong>Status:</strong> {selectedIssue.status}</p>
            <p className="mb-1"><strong>Department:</strong> {selectedIssue.departments?.name || "Not Assigned"}</p>
            <p><strong>Date:</strong> {new Date(selectedIssue.created_at).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReportsPage;
