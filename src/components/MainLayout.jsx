import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import NotificationIcon from './NotificationIcon';

// --- Professional SVG Icons ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293A1 1 0 0016 6v10a1 1 0 00.293.707L20 20.414V7.586L17.707 5.293z" clipRule="evenodd" /></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>;

// Header component
const Header = () => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    return (
        <header className="bg-white/70 backdrop-blur-sm border-b border-slate-200 p-4 sticky top-0 z-10">
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-4">
                    <NotificationIcon />
                    <Link to="/dashboard/profile" className="flex items-center gap-3">
                        <img 
                            src={user?.user_metadata?.avatar_url || 'https://placehold.co/32x32/EFEFEF/333333?text=U'} 
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover border-2 border-slate-200"
                        />
                        <span className="font-semibold text-sm text-slate-700 hidden md:block">{user?.user_metadata?.full_name || 'Profile'}</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

// Simple Sidebar
const Sidebar = () => {
    const baseLinkClasses = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 font-semibold transition-colors duration-200";
    const activeLinkClasses = `${baseLinkClasses} bg-blue-100 text-blue-700`;
    const inactiveLinkClasses = `${baseLinkClasses} hover:bg-slate-200`;

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex-col h-full hidden md:flex">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 justify-center">
                 <img src="https://kbjkpqqcouybdtqiuafo.supabase.co/storage/v1/object/public/public_assets/image-16.png" alt="Logo" className="w-10 h-10" />
                 <span className="text-xl font-bold text-slate-800">LocalGov</span>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                <NavLink to="/dashboard" end className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}><HomeIcon /> Home</NavLink>
                <NavLink to="/dashboard/report-issue" className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}><PlusIcon /> Report Issue</NavLink>
                <NavLink to="/dashboard/profile" className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}><UserIcon /> Profile</NavLink>
                <NavLink to="/dashboard/map" className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}><MapIcon /> Map</NavLink>
                <NavLink to="/dashboard/my-activity" className={({ isActive }) => isActive ? activeLinkClasses : inactiveLinkClasses}><ActivityIcon /> My Activity</NavLink>
            </nav>
        </aside>
    );
}

function MainLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
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

