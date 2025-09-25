import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminReportsPage() {
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]); // Departments ki list ke liye
  const [loading, setLoading] = useState(true);

  // Initial data fetch
  useEffect(() => {
    // Dono (issues aur departments) ko ek saath fetch karein
    const fetchInitialData = async () => {
        setLoading(true);
        // Promise.all se dono request ek saath jaayengi, jisse speed badhegi
        const [issuesResponse, deptsResponse] = await Promise.all([
            supabase.from('issues').select('*, departments(name)').order('created_at', { ascending: false }),
            supabase.from('departments').select('*')
        ]);

        if (issuesResponse.error) console.error("Error fetching issues:", issuesResponse.error.message);
        else setIssues(issuesResponse.data);

        if (deptsResponse.error) console.error("Error fetching departments:", deptsResponse.error.message);
        else setDepartments(deptsResponse.data);
        
        setLoading(false);
    };
    fetchInitialData();
  }, []);
  
  // Function to update issue status
  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const { error } = await supabase.from('issues').update({ status: newStatus }).eq('id', issueId);
      if (error) throw error;
      
      // UI mein turant update karein
      setIssues(currentIssues =>
        currentIssues.map(issue =>
          issue.id === issueId ? { ...issue, status: newStatus } : issue
        )
      );
      alert('Status updated!');
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };
  
  // Naya function department assign karne ke liye
  const handleDepartmentChange = async (issueId, newDeptId) => {
    // Agar user "Select Department" par click kare to null save karein
    const deptIdToSave = newDeptId === "" ? null : newDeptId;
    
    try {
      const { error } = await supabase.from('issues').update({ department_id: deptIdToSave }).eq('id', issueId);
      if (error) throw error;
      
      // UI ko update karne ke liye data dobara fetch karein
       const { data: updatedIssues, error: fetchError } = await supabase.from('issues').select('*, departments(name)').order('created_at', { ascending: false });
       if (fetchError) throw fetchError;
       setIssues(updatedIssues);

      alert('Department assigned!');
    } catch (error) {
      alert("Error assigning department: " + error.message);
    }
  };

  if (loading) return <p>Loading reports...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Reported Issues</h1>
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Dept.</th>
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
                      'bg-blue-100 text-blue-800' // In Progress
                  }`}>{issue.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {/* Yahan assigned department ka naam dikhega */}
                    {issue.departments ? issue.departments.name : <span className="text-gray-400">Not Assigned</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(issue.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
                  {/* Status Dropdown */}
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

                  {/* Department Dropdown */}
                  <select
                    value={issue.department_id || ""}
                    onChange={(e) => handleDepartmentChange(issue.id, e.target.value)}
                    className="border border-gray-300 rounded-md p-1"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
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
