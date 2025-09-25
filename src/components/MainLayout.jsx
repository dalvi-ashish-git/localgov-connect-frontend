import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Supabase import kiya
import NotificationIcon from './NotificationIcon';

// Header component ko update kiya
const Header = () => {
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        const fetchAvatar = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setAvatarUrl(user.user_metadata?.avatar_url);
            }
        };
        fetchAvatar();
    }, []);

    return (
        <header className="bg-white border-b p-4">
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-4">
                    <NotificationIcon />
                    <Link to="/dashboard/profile">
                        {/* Ab yahan asli profile picture ya placeholder dikhega */}
                        <img 
                            src={avatarUrl || 'https://placehold.co/32x32/EFEFEF/333333?text=U'} 
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
};

const Sidebar = () => {
    const linkClasses = "flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg";
    const activeLinkClasses = "flex items-center gap-3 px-4 py-2 text-gray-800 bg-blue-100 rounded-lg font-semibold";

    return (
        <aside className="w-64 bg-white shadow-md flex flex-col">
            <div className="p-6 text-2xl font-bold text-blue-600 border-b">
                LocalGov Connect
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <NavLink to="/dashboard" end className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>🏠</span> Home
                </NavLink>
                <NavLink to="/dashboard/report-issue" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>➕</span> Report Issue
                </NavLink>
                <NavLink to="/dashboard/profile" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>👤</span> Profile
                </NavLink>
                <NavLink to="/dashboard/map" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>🗺️</span> Map
                </NavLink>
                <NavLink to="/dashboard/my-activity" className={({ isActive }) => isActive ? activeLinkClasses : linkClasses}>
                    <span>📊</span> My Activity
                </NavLink>
            </nav>
        </aside>
    );
}

function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

