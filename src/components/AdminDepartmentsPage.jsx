import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AdminDepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDept, setCurrentDept] = useState({ id: null, name: '', description: '' });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setDepartments(data);
        } catch (error) {
            console.error("Error fetching departments:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setIsEditing(false);
        setCurrentDept({ id: null, name: '', description: '' });
        setShowForm(true);
    };

    const handleEdit = (dept) => {
        setIsEditing(true);
        setCurrentDept(dept);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this department?")) {
            try {
                const { error } = await supabase.from('departments').delete().eq('id', id);
                if (error) throw error;
                // List se department ko turant hata dein
                setDepartments(departments.filter(d => d.id !== id));
            } catch (error) {
                console.error("Error deleting department:", error.message);
                alert("Could not delete the department.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Update existing department
                const { error } = await supabase
                    .from('departments')
                    .update({ name: currentDept.name, description: currentDept.description })
                    .eq('id', currentDept.id);
                if (error) throw error;
            } else {
                // Insert new department
                const { error } = await supabase
                    .from('departments')
                    .insert({ name: currentDept.name, description: currentDept.description });
                if (error) throw error;
            }
            setShowForm(false);
            fetchDepartments(); // Refresh the list
        } catch (error) {
            console.error("Error saving department:", error.message);
            alert("Could not save the department.");
        }
    };
    
    // Form ke input ko handle karne ke liye
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentDept(prevState => ({ ...prevState, [name]: value }));
    };

    if (loading) {
        return <div>Loading departments...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Departments</h1>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    + Add New Department
                </button>
            </div>

            {/* Form Modal/Popup */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Department' : 'Add New Department'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Department Name</label>
                                <input type="text" name="name" id="name" value={currentDept.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea name="description" id="description" value={currentDept.description} onChange={handleInputChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Departments Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2">Name</th>
                            <th className="py-2">Description</th>
                            <th className="py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(dept => (
                            <tr key={dept.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 font-semibold">{dept.name}</td>
                                <td className="py-3 text-gray-600">{dept.description}</td>
                                <td className="py-3 flex gap-2">
                                    <button onClick={() => handleEdit(dept)} className="text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(dept.id)} className="text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDepartmentsPage;
