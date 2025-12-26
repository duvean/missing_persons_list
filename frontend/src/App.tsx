import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import "./css/normal.css";

import WbDashboard from "./components/WbDashboard";
import Profile from "./components/Profile";
import { Auth } from "./components/Auth";
import { apiFetch } from "./api";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("todo_token"));
  const [user, setUser] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfile = async () => {
    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) setUser(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("todo_token", newToken);
    setToken(newToken);
    navigate("/");
  };

  const handleLogout = () => {
    if (!confirm("Выйти?")) return;
    localStorage.removeItem("todo_token");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  if (!token) return <Auth onLogin={handleLogin} />;

  // Анимация страниц
  const PageTransition = ({ children }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );

  const userAvatar = user?.telegramAvatar?.startsWith('http') 
    ? user.telegramAvatar 
    : user?.telegramAvatar ? `http://localhost:3000${user.telegramAvatar}` : null;

  return (
    <div className="app">
      {/* HEADER */}
      <header className="app-header">
        <button className="app-header-btn app-header-btn--active">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"></rect>
            <line x1="40" y1="128" x2="216" y2="128" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
            <line x1="40" y1="64" x2="216" y2="64" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
            <line x1="40" y1="192" x2="216" y2="192" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
          </svg>
        </button>
        <div className="app-header-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
            </svg>
            PRICE PULSE
        </div>
        <button className="app-header-btn app-header-btn--notification">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"></rect>
            <path d="M56.2,104a71.9,71.9,0,0,1,72.3-72c39.6,0.3,71.3,33.2,71.3,72.9V112c0,35.8,7.5,56.6,14.1,68a8,8,0,0,1-6.9,12H49a8,8,0,0,1-6.9-12c6.6-11.4,14.1-32.2,14.1-68Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
          </svg>
        </button>
      </header>

      {/* BODY */}
      <main className="app-body">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><WbDashboard /></PageTransition>} />
            <Route path="/profile" element={
              <PageTransition>
                <Profile userData={user} onRefresh={fetchUserProfile} onLogout={handleLogout} />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      {/* FOOTER NAV */}
      <footer className="app-footer">
        <nav className="menu-bar">
          <Link to="/" className={`menu-bar-item ${location.pathname === '/' ? 'active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="menu-bar-item-text">Dashboard</span>
          </Link>
          
          <Link to="/profile" className={`menu-bar-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            {userAvatar ? (
              <img src={userAvatar} alt="Profile" className="menu-bar-avatar" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
                <circle cx="128" cy="96" r="64" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="16"></circle>
                <path d="M31,216a112,112,0,0,1,194,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
              </svg>
            )}
            <span>Profile</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}