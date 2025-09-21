import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 bg-gray-700 rounded-lg">
            <span>📊</span> Dashboard
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-lg">
            <span>📋</span> Reports
          </Link>
          <Link to="/admin/departments" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-lg">
            <span>🏢</span> Departments
          </Link>
          <Link to="/admin/analytics" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-lg">
            <span>📈</span> Analytics
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* Yahan admin ke pages render honge */}
      </main>
    </div>
  );
}

export default AdminLayout;