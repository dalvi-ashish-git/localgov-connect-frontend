import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDept, setCurrentDept] = useState({ id: null, name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDepartments(data);
    } catch (error) { console.error("Error fetching departments:", error.message); }
    finally { setLoading(false); }
  };

  const handleAddNew = () => { setIsEditing(false); setCurrentDept({ id: null, name: '', description: '' }); setShowForm(true); };
  const handleEdit = (dept) => { setIsEditing(true); setCurrentDept(dept); setShowForm(true); };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) throw error;
        setDepartments(departments.filter(d => d.id !== id));
      } catch (error) { alert("Could not delete the department."); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentDept.name.trim()) { alert("Department name cannot be empty."); return; }
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('departments')
          .update({ name: currentDept.name, description: currentDept.description })
          .eq('id', currentDept.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('departments')
          .insert({ name: currentDept.name, description: currentDept.description });
        if (error) throw error;
      }
      setShowForm(false);
      fetchDepartments();
    } catch (error) { alert("Could not save the department."); }
  };

  const handleInputChange = (e) => { const { name, value } = e.target; setCurrentDept(prev => ({ ...prev, [name]: value })); };
  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  if (loading) return <div>Loading departments...</div>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Departments</h1>
        <div className="flex gap-3 flex-col md:flex-row">
          <input
            type="text"
            placeholder="Search Departments..."
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add New
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Department' : 'Add New Department'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={currentDept.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  value={currentDept.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments Table */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Description</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">No departments found.</td>
              </tr>
            ) : (
              filteredDepartments.map(dept => (
                <tr key={dept.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-3 font-semibold">{dept.name}</td>
                  <td className="py-3 px-3 text-gray-600">{dept.description}</td>
                  <td className="py-3 px-3 flex gap-3">
                    <button onClick={() => handleEdit(dept)} className="text-blue-500 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(dept.id)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDepartmentsPage;
