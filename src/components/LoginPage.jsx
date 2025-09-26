import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Email/Password se login karne ka function
  async function handleLogin(e) {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  }

  // Google se login karne ka naya function
  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl max-w-4xl">
        
        {/* Left Blue Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-blue-600 text-white flex flex-col justify-center items-center rounded-t-2xl md:rounded-l-2xl md:rounded-r-none">
          {/* LOGO YAHAN ADD KIYA GAYA HAI */}
          <img src="https://kbjkpqqcouybdtqiuafo.supabase.co/storage/v1/object/public/public_assets/image-10%20(1).png" alt="LocalGov Connect Logo" className="w-32 h-32 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-center mb-8">Login to report issues and connect with your community.</p>
          <button 
            onClick={handleGoogleLogin} // onClick event add kiya
            className="w-full max-w-xs flex justify-center items-center gap-2 bg-white text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="w-6 h-6" />
            Sign in with Google
          </button>
        </div>

        {/* Right White Panel (Login Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">Citizen Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-4">
              <input type="password" placeholder="Password" className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="text-right text-sm mb-6">
              <a href="#" className="text-gray-500 hover:text-blue-600">Forgot your password?</a>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold">
              LOGIN
            </button>
          </form>
          <p className="text-center text-gray-500 mt-6">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Create one</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
