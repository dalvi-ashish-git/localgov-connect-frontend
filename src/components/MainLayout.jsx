import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// --- Icons ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4 10v10h16V10"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A8 8 0 1118.879 6.196 8 8 0 015.121 17.804z"/></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.894L9 2l6 2 5.447-2.724A2 2 0 0121 2.618v9.764a2 2 0 01-1.553 1.894L15 14l-6-2-5.447 2.724A2 2 0 013 18.382v-9.764"/></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l-2 2m5 0l2-2v13"/></svg>;

// --- Notification Icon ---
const NotificationIcon = ({ darkMode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 00-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1h6z" />
  </svg>
);

// --- Header ---
const Header = ({ darkMode, setDarkMode }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  return (
    <header className={`flex justify-between items-center sticky top-0 z-20 p-4 shadow-md transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="font-bold text-lg">LocalGov Dashboard</div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors`}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Notification icon click → new screen */}
        <Link to="/dashboard/notifications">
          <NotificationIcon darkMode={darkMode} />
        </Link>

        <Link to="/dashboard/profile" className="flex items-center gap-2">
          <img src={user?.user_metadata?.avatar_url || 'https://placehold.co/32x32/EFEFEF/333333?text=U'} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-gray-600" />
          <span className="hidden md:block font-semibold">{user?.user_metadata?.full_name || 'Profile'}</span>
        </Link>
      </div>
    </header>
  );
};

// --- Sidebar with collapse ---
const Sidebar = ({ darkMode }) => {
  const [collapsed, setCollapsed] = useState(false);

  const baseLinkClasses = "flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200";
  const activeLinkClasses = `${baseLinkClasses} bg-blue-600 text-white`;
  const inactiveLinkClasses = `${baseLinkClasses} hover:bg-blue-500 hover:text-white`;

  return (
    <aside className={`h-full transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'} ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-900'}`}>
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && <div className="flex items-center gap-3"><img src="https://kbjkpqqcouybdtqiuafo.supabase.co/storage/v1/object/public/public_assets/logo-1.jpeg" alt="Logo" className="w-10 h-10" /><span className="text-xl font-bold">LocalGov</span></div>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-xl font-bold focus:outline-none">☰</button>
      </div>
      <nav className="flex-1 flex flex-col p-4 space-y-2">
        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses} title="Home"><HomeIcon /> {!collapsed && 'Home'}</NavLink>
        <NavLink to="/dashboard/report-issue" className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses} title="Report Issue"><PlusIcon /> {!collapsed && 'Report Issue'}</NavLink>
        <NavLink to="/dashboard/profile" className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses} title="Profile"><UserIcon /> {!collapsed && 'Profile'}</NavLink>
        <NavLink to="/dashboard/map" className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses} title="Map"><MapIcon /> {!collapsed && 'Map'}</NavLink>
        <NavLink to="/dashboard/my-activity" className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses} title="My Activity"><ActivityIcon /> {!collapsed && 'My Activity'}</NavLink>
      </nav>
    </aside>
  );
};

// --- MainLayout ---
function MainLayout() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <div className={`flex h-screen w-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Sidebar darkMode={darkMode} />
      <div className="flex-1 flex flex-col">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className={`flex-1 p-6 overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-gray-900 scrollbar-thumb-gray-700 scrollbar-track-gray-800' : 'bg-gray-100 scrollbar-thumb-gray-400 scrollbar-track-gray-200'}`}>
          <Outlet context={{ darkMode }} />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
