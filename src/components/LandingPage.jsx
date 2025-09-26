import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  const symbols = [
    "🛣️", "💧", "⚡", "🚦", "🔥", "🗑️", "💡", "🚰", "🚍", "🌫️"
  ];

  const backgroundSymbols = Array.from({ length: 60 }).map((_, i) => {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const size = Math.random() * 2 + 2;
    const rotate = Math.random() * 360;
    const delay = Math.random() * 5;
    return { symbol, top, left, size, rotate, delay };
  });

  return (
    <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-gray-900 text-white font-sans min-h-screen overflow-hidden">

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

      {/* Hero Section */}
      <div className="relative pt-24 pb-32 text-center z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl"></div>
        <div className="absolute top-20 right-0 w-80 h-80 bg-blue-400/20 rounded-full filter blur-2xl"></div>

        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <div className="flex items-center gap-3">
            <img
              src="https://kbjkpqqcouybdtqiuafo.supabase.co/storage/v1/object/public/public_assets/logo-1.jpeg"
              alt="LocalGov Connect Logo"
              className="w-10 h-10 rounded-full"
            />
            <span className="text-2xl font-semibold tracking-wide">
              LocalGov Connect
            </span>
          </div>
          <div className="space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 bg-white text-indigo-900 font-medium rounded-md hover:bg-gray-200 transition"
            >
              Citizen Login
            </Link>
            <Link
              to="/official-login"
              className="px-4 py-2 bg-indigo-700 text-white font-medium rounded-md hover:bg-indigo-600 transition"
            >
              Official Login
            </Link>
          </div>
        </header>

        <div className="relative z-20 px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Connecting Citizens. <br /> Driving Local Solutions.
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
            Report, track, and resolve community issues efficiently and transparently.
          </p>
          <div className="space-x-4">
            <Link
              to="/signup"
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition shadow-lg"
            >
              Get Started
            </Link>
            <button className="px-8 py-3 border border-white/70 font-medium rounded-md hover:bg-white hover:text-indigo-900 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="py-24 px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          Why Choose LocalGov Connect?
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3">📢 Report Issues</h3>
            <p>Easily raise complaints about roads, water, sanitation, and more.</p>
          </div>
          <div className="p-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3">⚡ Real-Time Updates</h3>
            <p>Receive instant updates directly from government officials.</p>
          </div>
          <div className="p-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3">🤝 Transparency</h3>
            <p>Track progress openly and build long-term trust with your local government.</p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          What People Say
        </h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-md text-center hover:shadow-lg transition">
            <p className="text-lg italic mb-4 text-gray-100">
              "Reporting potholes has never been this easy. My complaint was resolved in just 2 days!"
            </p>
            <p className="font-medium text-white">- A Citizen</p>
          </div>
          <div className="p-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-md text-center hover:shadow-lg transition">
            <p className="text-lg italic mb-4 text-gray-100">
              "We can now prioritize issues better and respond faster. It's a game-changer for officials."
            </p>
            <p className="font-medium text-white">- A Gov Official</p>
          </div>
        </div>
      </div>

      {/* CTA / Be Part of the Change (Unified Style) */}
      <div className="py-24 px-6 relative z-10 bg-white/10 backdrop-blur-md border-t border-white/20 rounded-t-3xl text-center mx-4 md:mx-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Be Part of the Change
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
          Join our community and help make your locality a better place.
        </p>
        <Link
          to="/signup"
          className="px-10 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition shadow-lg"
        >
          Sign Up Now
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center p-6 text-sm relative z-10">
        <p>&copy; 2025 LocalGov Connect. All rights reserved.</p>
        <p className="mt-1">For Support, contact info@localgovconnect.com</p>
      </footer>

      {/* Tailwind Animation */}
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

export default LandingPage;
