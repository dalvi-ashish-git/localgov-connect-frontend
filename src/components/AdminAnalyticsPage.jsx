import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// CORRECTED: Import line ko theek kar diya gaya hai
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminAnalyticsPage = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [departmentData, setDepartmentData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#FFBB28', '#00C49F', '#FF8042', '#0088FE']; // Yellow, Green, Orange, Blue

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Issues aur departments dono ko ek saath fetch karein
                const [{ data: issues, error: issuesError }, { data: departments, error: deptsError }] = await Promise.all([
                    supabase.from('issues').select('status, department_id'),
                    supabase.from('departments').select('id, name')
                ]);

                if (issuesError) throw issuesError;
                if (deptsError) throw deptsError;

                // --- 1. Basic Stats Calculate Karein ---
                const total = issues.length;
                const pending = issues.filter(i => i.status === 'Pending').length;
                const resolved = issues.filter(i => i.status === 'Resolved').length;
                setStats({ total, pending, resolved });

                // --- 2. Pie Chart ka Data Banayein (Status ke hisab se) ---
                const statusCounts = issues.reduce((acc, issue) => {
                    acc[issue.status] = (acc[issue.status] || 0) + 1;
                    return acc;
                }, {});
                const pieData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
                setStatusData(pieData);
                
                // --- 3. Bar Chart ka Data Banayein (Department ke hisab se) ---
                const deptMap = departments.reduce((acc, dept) => {
                    acc[dept.id] = { name: dept.name, count: 0 };
                    return acc;
                }, {});

                issues.forEach(issue => {
                    if (issue.department_id && deptMap[issue.department_id]) {
                        deptMap[issue.department_id].count += 1;
                    }
                });
                const barData = Object.values(deptMap);
                setDepartmentData(barData);

            } catch (error) {
                console.error("Error fetching analytics data:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-gray-500">Total Issues Reported</h3>
                    <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-gray-500">Issues Pending</h3>
                    <p className="text-4xl font-bold mt-2 text-yellow-500">{stats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-gray-500">Issues Resolved</h3>
                    <p className="text-4xl font-bold mt-2 text-green-500">{stats.resolved}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Bar Chart */}
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
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

                {/* Pie Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Issues by Status</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
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

