import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const baseLinkClasses =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 relative";
  const activeLinkClasses = `${baseLinkClasses} bg-gray-700 shadow-lg`;
  const inactiveLinkClasses = `${baseLinkClasses} hover:bg-gray-700/80`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`flex flex-col ${
          collapsed ? "w-20" : "w-64"
        } bg-gradient-to-b from-gray-800 to-gray-900 text-white transition-all duration-300`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          {!collapsed && <span className="text-2xl font-bold">Admin Panel</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white text-xl focus:outline-none"
          >
            ☰
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? activeLinkClasses : inactiveLinkClasses
            }
            title="Dashboard"
          >
            <span>📊</span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              isActive ? activeLinkClasses : inactiveLinkClasses
            }
            title="Reports"
          >
            <span>📋</span>
            {!collapsed && <span>Reports</span>}
          </NavLink>
          <NavLink
            to="/admin/departments"
            className={({ isActive }) =>
              isActive ? activeLinkClasses : inactiveLinkClasses
            }
            title="Departments"
          >
            <span>🏢</span>
            {!collapsed && <span>Departments</span>}
          </NavLink>
          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              isActive ? activeLinkClasses : inactiveLinkClasses
            }
            title="Analytics"
          >
            <span>📈</span>
            {!collapsed && <span>Analytics</span>}
          </NavLink>
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-gray-700 text-sm text-gray-300">
            Logged in as Admin
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
