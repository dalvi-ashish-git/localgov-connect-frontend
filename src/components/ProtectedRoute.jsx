import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function ProtectedRoute() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // Optional: Show a loading spinner while checking session
    return <div>Loading...</div>;
  }

  if (!session) {
    // If no session, redirect to login page
    return <Navigate to="/login" />;
  }

  // If session exists, show the nested content (e.g., MainLayout)
  return <Outlet />;
}

export default ProtectedRoute;