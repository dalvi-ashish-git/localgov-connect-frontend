import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Supabase client ko import karein

function CreateAccountPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSignUp(e) {
    e.preventDefault(); // Form ko page refresh karne se rokein

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName, // Optional: User ka naam bhi save kar rahe hain
          }
        }
      });

      if (error) {
        throw error;
      }
      
      alert('Account created! Please check your email for verification.');
      navigate('/dashboard'); // Signup ke baad user ko home page par bhej dein

    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Create Account</h2>
        
        {/* Google sign-in (abhi kaam nahi karega) */}
        <button className="w-full flex justify-center items-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors mb-6">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="w-6 h-6" />
          Sign up with Google
        </button>

        {/* Signup Form */}
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              id="fullName" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              id="password" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default CreateAccountPage;