import React from 'react';
import { Link, Outlet } from 'react-router-dom'; // Link yahan import hua hai

function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 text-2xl font-bold text-blue-600 border-b">
          LocalGov Connect
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Home Link */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 bg-blue-100 rounded-lg font-semibold"
          >
            <span>🏠</span> Home
          </Link>

          {/* Report Issue Link */}
          <Link
            to="/dashboard/report-issue"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            <span>➕</span> Report Issue
          </Link>

          {/* Profile Link */}
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            <span>👤</span> Profile
          </Link>

          {/* Map Link */}
          <Link
            to="/dashboard/map"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            <span>🗺️</span> Map
          </Link>

          {/* ✅ My Activity Link (newly added) */}
          <Link
            to="/dashboard/my-activity"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            <span>📊</span> My Activity
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
