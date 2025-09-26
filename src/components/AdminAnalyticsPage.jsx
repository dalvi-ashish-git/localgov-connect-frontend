import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DatePicker from "react-datepicker"; // Date picker library import ki
import "react-datepicker/dist/react-datepicker.css"; // Date picker ka style import kiya

const AdminAnalyticsPage = () => {
    // Original states
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [departmentData, setDepartmentData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Date filter ke liye naye states
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const COLORS = ['#FFBB28', '#00C49F', '#FF8042', '#0088FE']; // Yellow, Green, Orange, Blue

    // Is function ko ab hum date range ke saath call karenge
    const fetchData = async (start, end) => {
        setLoading(true);
        try {
            // Issues aur departments dono ko ek saath fetch karein
            let issuesQuery = supabase.from('issues').select('status, department_id, created_at');
            
            // Agar start date hai, to filter lagayein
            if (start) {
                issuesQuery = issuesQuery.gte('created_at', start.toISOString());
            }
            // Agar end date hai, to filter lagayein
            if (end) {
                // End date mein poora din include karne ke liye
                const adjustedEndDate = new Date(end);
                adjustedEndDate.setHours(23, 59, 59, 999);
                issuesQuery = issuesQuery.lte('created_at', adjustedEndDate.toISOString());
            }

            const [{ data: issues, error: issuesError }, { data: departments, error: deptsError }] = await Promise.all([
                issuesQuery,
                supabase.from('departments').select('id, name')
            ]);

            if (issuesError) throw issuesError;
            if (deptsError) throw deptsError;

            // --- Data ko process karein ---
            const total = issues.length;
            const pending = issues.filter(i => i.status === 'Pending').length;
            const resolved = issues.filter(i => i.status === 'Resolved').length;
            setStats({ total, pending, resolved });

            const statusCounts = issues.reduce((acc, issue) => {
                acc[issue.status] = (acc[issue.status] || 0) + 1;
                return acc;
            }, {});
            const pieData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
            setStatusData(pieData);
            
            const deptMap = departments.reduce((acc, dept) => {
                acc[dept.id] = { name: dept.name, count: 0 };
                return acc;
            }, {});
            issues.forEach(issue => {
                if (issue.department_id && deptMap[issue.department_id]) {
                    deptMap[issue.department_id].count += 1;
                }
            });
            setDepartmentData(Object.values(deptMap));

        } catch (error) {
            console.error("Error fetching analytics data:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Page load par saara data fetch karein
    useEffect(() => {
        fetchData(null, null);
    }, []);
    
    // Filter apply karne par data dobara fetch karein
    const handleFilterApply = () => {
        fetchData(startDate, endDate);
    };
    
    // Filter reset karne par
    const handleFilterReset = () => {
        setStartDate(null);
        setEndDate(null);
        fetchData(null, null);
    };

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                {/* Date Filter UI */}
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow">
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start Date" className="border p-2 rounded-md w-32"/>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="End Date" className="border p-2 rounded-md w-32"/>
                    <button onClick={handleFilterApply} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Apply</button>
                    <button onClick={handleFilterReset} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Reset</button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow text-center"><h3 className="text-lg font-semibold text-gray-500">Total Issues Reported</h3><p className="text-4xl font-bold mt-2">{stats.total}</p></div>
                <div className="bg-white p-6 rounded-lg shadow text-center"><h3 className="text-lg font-semibold text-gray-500">Issues Pending</h3><p className="text-4xl font-bold mt-2 text-yellow-500">{stats.pending}</p></div>
                <div className="bg-white p-6 rounded-lg shadow text-center"><h3 className="text-lg font-semibold text-gray-500">Issues Resolved</h3><p className="text-4xl font-bold mt-2 text-green-500">{stats.resolved}</p></div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Issues per Department</h3>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={departmentData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="count" fill="#8884d8" name="No. of Issues" /></BarChart></ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Issues by Status</h3>
                     <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;

