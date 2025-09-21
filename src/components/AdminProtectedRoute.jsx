import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function AdminProtectedRoute() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user && user.user_metadata && user.user_metadata.role === 'admin') {
        setIsAdmin(true);
      }
      setLoading(false);
    };

    checkUserRole();
  }, []);

  if (loading) {
    return <div>Checking admin privileges...</div>;
  }

  if (!isAdmin) {
    // Agar user admin nahi hai, toh use home page par bhej do
    return <Navigate to="/dashboard" />;
  }

  // Agar user admin hai, toh admin pages dikhao
  return <Outlet />;
}

export default AdminProtectedRoute;