import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function OfficialLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const symbols = ["🛣️", "💧", "⚡", "🚦", "🔥", "🗑️", "💡", "🚰", "🚍", "🌫️"];
  const backgroundSymbols = Array.from({ length: 50 }).map((_, i) => {
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
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      const { data: { user } } = await supabase.auth.getUser();

      if (user && user.user_metadata && user.user_metadata.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        await supabase.auth.signOut();
        alert('You are not authorized to access the admin panel.');
        navigate('/');
      }
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-gray-900 flex items-center justify-center overflow-hidden font-sans">

      {/* Floating Symbols Background */}
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

      {/* Glassmorphic Card */}
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-xl p-10 max-w-md w-full transform transition-all duration-300 hover:scale-105">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://kbjkpqqcouybdtqiuafo.supabase.co/storage/v1/object/public/public_assets/logo-1.jpeg"
            alt="LocalGov Connect Logo"
            className="w-28 h-28 rounded-full"
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-white mb-6">Official Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email"
            placeholder="Enter official email"
            className="w-full px-4 py-3 bg-white/70 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password"
            placeholder="Enter password"
            className="w-full px-4 py-3 bg-white/70 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-500 transition shadow-lg"
          >
            Login as Official
          </button>
        </form>
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

export default OfficialLoginPage;
