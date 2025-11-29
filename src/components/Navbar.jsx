import React, { useState, useEffect } from "react";

// Use Vite env variable (must be prefixed with VITE_) when building with Vite.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const Navbar = ({ setCurrentPage, setShowCart, cartCount = 0 }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // keep user state in sync if localStorage changed elsewhere
    const handler = () => {
      try {
        const raw = localStorage.getItem("auth_user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) {}
    };
    window.addEventListener("storage", handler);
    // listen for global events to open login/signup from other components (e.g., Cart)
    const openLogin = () => setShowLogin(true);
    const openSignup = () => setShowSignup(true);
    window.addEventListener('open-login', openLogin);
    window.addEventListener('open-signup', openSignup);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener('open-login', openLogin);
      window.removeEventListener('open-signup', openSignup);
    };
  }, []);

  return (
    <>
      <nav className="w-full py-4 px-6 flex items-center justify-between bg-[#0a1a12]/80 backdrop-blur-md shadow-lg border-b border-green-700 sticky top-0 z-50">
        
        <h1 className="text-3xl font-bold text-green-400 flex items-center gap-2">
          🌿 Plants
        </h1>

        <ul className="hidden md:flex items-center gap-8 text-lg">
          <li onClick={() => setCurrentPage?.("home")} className="hover:text-green-400 cursor-pointer transition">Home</li>
          <li onClick={() => setCurrentPage?.("shop")} className="hover:text-green-400 cursor-pointer transition">Shop</li>
          <li onClick={() => setCurrentPage?.("about")} className="hover:text-green-400 cursor-pointer transition">About Us</li>
          <li onClick={() => setCurrentPage?.("contact")} className="hover:text-green-400 cursor-pointer transition">Contact</li>
        </ul>

        <div className="flex items-center gap-4">
          <input 
            type="text"
            placeholder="Search plants..."
            className="px-4 py-2 rounded-full bg-[#0b2a1a] border border-green-700 text-white w-40 md:w-56 outline-none focus:border-green-400 transition"
          />
          
          <button onClick={() => setShowCart?.(true)} className="relative text-2xl hover:text-green-400 transition">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">Hi, <strong className="text-green-300">{user.name}</strong></span>
              <button onClick={() => {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_user");
                setUser(null);
              }} className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition">Logout</button>
              {user.role === 'admin' && (
                <button onClick={() => setCurrentPage?.('admin')} className="ml-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition">Admin</button>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
              >
                🔐 Login
              </button>

              <button
                onClick={() => setShowSignup(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition"
              >
                📝 Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a1a12] border-2 border-green-600 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-green-400">🌿 Login</h2>
              <button onClick={() => setShowLogin(false)} className="text-3xl text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400 transition"
              />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400 transition"
              />

              <button onClick={async () => {
                try {
                  const resp = await fetch(`${API_BASE}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                  });
                  const data = await resp.json();
                  if (!data.success) return alert(data.message || 'Login failed');
                  localStorage.setItem('auth_token', data.token);
                  localStorage.setItem('auth_user', JSON.stringify(data.user));
                  setUser(data.user);
                  setShowLogin(false);
                  setEmail(''); setPassword('');
                } catch (err) {
                  console.error(err);
                  alert('Login error');
                }
              }} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition transform hover:scale-105">
                🔓 Login
              </button>

              <p className="text-center text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setShowSignup(true);
                  }}
                  className="text-green-400 hover:text-green-300 font-bold"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a1a12] border-2 border-green-600 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-green-400">🌱 Sign Up</h2>
              <button onClick={() => setShowSignup(false)} className="text-3xl text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400 transition"
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400 transition"
              />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b2a1a] border border-green-700 rounded-lg text-white outline-none focus:border-green-400 transition"
              />

              <button onClick={async () => {
                try {
                  const resp = await fetch(`${API_BASE}/api/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                  });
                  const data = await resp.json();
                  if (!data.success) return alert(data.message || 'Signup failed');
                  localStorage.setItem('auth_token', data.token);
                  localStorage.setItem('auth_user', JSON.stringify(data.user));
                  setUser(data.user);
                  setShowSignup(false);
                  setName(''); setEmail(''); setPassword('');
                } catch (err) {
                  console.error(err);
                  alert('Signup error');
                }
              }} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition transform hover:scale-105">
                ✓ Create Account
              </button>

              <p className="text-center text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setShowSignup(false);
                    setShowLogin(true);
                  }}
                  className="text-green-400 hover:text-green-300 font-bold"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
