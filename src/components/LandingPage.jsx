import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    // Naya background image yahan add kiya gaya hai
    <div className="bg-white text-gray-800 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white pt-20 pb-32">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
          <div className="text-2xl font-bold">LocalGov Connect</div>
          <div className="space-x-4">
            <Link to="/login" className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-200">Citizen Login</Link>
            <Link to="/official-login" className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900">Official Login</Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="text-center relative z-0">
          <h1 className="text-5xl font-extrabold mb-4">Connecting Citizens. Solving Local Issues.</h1>
          <p className="text-xl mb-8">Your Platform for Community Change.</p>
          <div className="space-x-4">
            <Link to="/signup" className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-200">Get Started</Link>
            <button className="px-8 py-3 border border-white font-semibold rounded-lg hover:bg-white hover:text-blue-600">Learn More</button>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 w-full z-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f9fafb" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,149.3C960,139,1056,149,1152,165.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* "Why Choose" Section */}
      <div className="py-24 px-6 bg-gray-50/90 backdrop-blur-sm"> {/* Background ko semi-transparent kiya hai */}
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose LocalGov Connect?</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-white/80 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">📢 Report Issues</h3>
            <p>Raise complaints about roads, water, sanitation, and more with ease.</p>
          </div>
          <div className="p-8 bg-white/80 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">⚡ Real-Time Updates</h3>
            <p>Get instant updates from government officials on your reported issues.</p>
          </div>
          <div className="p-8 bg-white/80 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">🤝 Transparency</h3>
            <p>Track progress openly and build trust in your local government.</p>
          </div>
        </div>
      </div>

      {/* "What People Say" Section */}
      <div className="py-24 px-6 bg-white/90 backdrop-blur-sm"> {/* Background ko semi-transparent kiya hai */}
        <h2 className="text-4xl font-bold text-center mb-12">What People Say</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-white rounded-xl shadow-lg text-center">
            <p className="text-lg italic mb-4">"Reporting potholes has never been this easy. My complaint was resolved in just 2 days!"</p>
            <p className="font-semibold">- A Citizen</p>
          </div>
          <div className="p-8 bg-white rounded-xl shadow-lg text-center">
            <p className="text-lg italic mb-4">"We can now prioritize issues better and respond faster. It's a game-changer for officials."</p>
            <p className="font-semibold">- A Gov Official</p>
          </div>
        </div>
      </div>

      {/* "Be Part of the Change" Section */}
      <div className="py-24 px-6 bg-gray-50/90 backdrop-blur-sm text-center"> {/* Background ko semi-transparent kiya hai */}
        <h2 className="text-4xl font-bold mb-6">Be Part of the Change</h2>
        <p className="text-xl mb-8">Join our community and help make your locality a better place.</p>
        <Link to="/signup" className="px-10 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-lg">
          Sign Up Now
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-6">
        <p>&copy; 2025 LocalGov Connect. All rights reserved.</p>
        <p>For Support & Source Code, Contact us at info@localgovconnect.com</p>
      </footer>
    </div>
  );
}

export default LandingPage;