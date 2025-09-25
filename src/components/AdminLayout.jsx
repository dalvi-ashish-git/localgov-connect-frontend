import React from 'react';
import { Outlet, NavLink } from 'react-router-dom'; // Link ko NavLink se badla

function AdminLayout() {
  
  // Styles for active and inactive links
  const baseLinkClasses = "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200";
  const activeLinkClasses = `${baseLinkClasses} bg-gray-700`;
  const inactiveLinkClasses = `${baseLinkClasses} hover:bg-gray-700`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Har Link ko NavLink se badla gaya hai */}
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}
          >
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink 
            to="/admin/reports" 
            className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}
          >
            <span>📋</span> Reports
          </NavLink>
          <NavLink 
            to="/admin/departments" 
            className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}
          >
            <span>🏢</span> Departments
          </NavLink>
          <NavLink 
            to="/admin/analytics" 
            className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}
          >
            <span>📈</span> Analytics
          </NavLink>
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

