import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AdminAnalyticsPage = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [departmentData, setDepartmentData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const COLORS = ['#FFBB28', '#00C49F', '#FF8042', '#0088FE'];

    const fetchData = async (start, end) => {
        setLoading(true);
        try {
            let issuesQuery = supabase.from('issues').select('status, department_id, created_at');
            if (start) issuesQuery = issuesQuery.gte('created_at', start.toISOString());
            if (end) {
                const adjustedEnd = new Date(end);
                adjustedEnd.setHours(23, 59, 59, 999);
                issuesQuery = issuesQuery.lte('created_at', adjustedEnd.toISOString());
            }

            const [{ data: issues, error: issuesError }, { data: departments, error: deptsError }] = await Promise.all([
                issuesQuery,
                supabase.from('departments').select('id, name')
            ]);

            if (issuesError) throw issuesError;
            if (deptsError) throw deptsError;

            // Stats
            const total = issues.length;
            const pending = issues.filter(i => i.status === 'Pending').length;
            const resolved = issues.filter(i => i.status === 'Resolved').length;
            setStats({ total, pending, resolved });

            // Status data for pie chart
            const statusCounts = issues.reduce((acc, i) => {
                acc[i.status] = (acc[i.status] || 0) + 1;
                return acc;
            }, {});
            setStatusData(Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] })));

            // Department data for bar chart
            const deptMap = departments.reduce((acc, dept) => {
                acc[dept.id] = { name: dept.name, count: 0 };
                return acc;
            }, {});
            issues.forEach(i => {
                if (i.department_id && deptMap[i.department_id]) deptMap[i.department_id].count += 1;
            });
            setDepartmentData(Object.values(deptMap));

        } catch (error) {
            console.error("Error fetching analytics:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(null, null); }, []);
    const handleFilterApply = () => { fetchData(startDate, endDate); };
    const handleFilterReset = () => { setStartDate(null); setEndDate(null); fetchData(null, null); };

    if (loading) return <div className="text-center mt-10">Loading analytics...</div>;

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-cyan-50 space-y-8">

            {/* Header + Date Filter */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-md">
                    <DatePicker selected={startDate} onChange={(date)=>setStartDate(date)} placeholderText="Start Date" className="border px-3 py-2 rounded-md w-32"/>
                    <DatePicker selected={endDate} onChange={(date)=>setEndDate(date)} placeholderText="End Date" className="border px-3 py-2 rounded-md w-32"/>
                    <button onClick={handleFilterApply} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Apply</button>
                    <button onClick={handleFilterReset} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Reset</button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Total Issues', 'Pending Issues', 'Resolved Issues'].map((title, idx)=>(
                    <div key={idx} className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
                        <p className={`text-4xl font-bold mt-2 ${idx===1?'text-yellow-500': idx===2?'text-green-500':'text-gray-900'}`}>
                            {idx===0 ? stats.total : idx===1 ? stats.pending : stats.resolved}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Issues per Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departmentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="No. of Issues" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Issues by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;
