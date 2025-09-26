import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function OfficialLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      // Step 1: User ko login karwayein
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (loginError) {
        throw loginError;
      }

      // Step 2: User ka data fetch karein
      const { data: { user } } = await supabase.auth.getUser();
      
      // Step 3: Check karein ki user ka role 'admin' hai ya nahi
      if (user && user.user_metadata && user.user_metadata.role === 'admin') {
        // Agar admin hai, toh admin dashboard par bhejein
        navigate('/admin/dashboard');
      } else {
        // Agar admin nahi hai, toh error dein aur logout karein
        await supabase.auth.signOut();
        alert('You are not authorized to access the admin panel.');
        navigate('/'); // Landing page par wapas bhejein
      }

    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        {/* LOGO YAHAN ADD KIYA GAYA HAI */}
        <div className="flex justify-center mb-6">
            <img src="https://kbjkpqqcouybdtqiuafo.supabase.co/storage/v1/object/public/public_assets/image-16.png" alt="LocalGov Connect Logo" className="w-24 h-24" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Official Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition-colors">
            Login as Official
          </button>
        </form>
      </div>
    </div>
  );
}

export default OfficialLoginPage;

