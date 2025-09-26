import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const symbols = [
    "🛣️", "💧", "⚡", "🚦", "🔥", "🗑️", "💡", "🚰", "🚍", "🌫️"
  ];

  const backgroundSymbols = Array.from({ length: 40 }).map((_, i) => {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const size = Math.random() * 2 + 1.5;
    const rotate = Math.random() * 360;
    const delay = Math.random() * 5;
    return { symbol, top, left, size, rotate, delay };
  });

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-gray-900 flex items-center justify-center overflow-hidden font-sans">

      {/* Background Symbols */}
      {backgroundSymbols.map((item, idx) => (
        <span
          key={idx}
          className="absolute text-white opacity-20 animate-float"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            fontSize: `${item.size}rem`,
            transform: `rotate(${item.rotate}deg)`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.symbol}
        </span>
      ))}

      {/* Glassmorphic Login Card */}
      <div className="flex flex-col md:flex-row bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-xl max-w-4xl w-full overflow-hidden">
        
        {/* Left Panel - Welcome + Google */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center bg-blue-600/30 backdrop-blur-md text-white">
          <img src="https://kbjkpqqcouybdtqiuafo.supabase.co/storage/v1/object/public/public_assets/logo-1.jpeg" alt="Logo" className="w-28 h-28 mb-4 rounded-full" />
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-center mb-8">Login to report issues and connect with your community.</p>
          <button 
            onClick={handleGoogleLogin}
            className="w-full max-w-xs flex justify-center items-center gap-2 bg-white text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="w-6 h-6" />
            Sign in with Google
          </button>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white text-center mb-6">Citizen Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full px-4 py-3 bg-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-4 py-3 bg-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <div className="text-right text-sm">
              <a href="#" className="text-gray-200 hover:text-white">Forgot your password?</a>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition font-bold shadow-lg">
              LOGIN
            </button>
          </form>
          <p className="text-center text-gray-200 mt-6">
            Don't have an account? <Link to="/signup" className="text-indigo-400 font-semibold hover:underline">Create one</Link>
          </p>
        </div>

      </div>

      {/* Floating animation CSS */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}

export default LoginPage;
