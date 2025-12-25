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
        <span style={{fontWeight: 700, color: '#7d7d80'}}>PRICE PULSE</span>
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
              <path d="M213.4,109.6L133.4,36.9a8,8,0,0,0-10.8,0l-80,72.7A8,8,0,0,0,40,115.5V208a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V115.5A8,8,0,0,0,213.4,109.6Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
            </svg>
            <span>Home</span>
          </Link>
          
          <Link to="/profile" className={`menu-bar-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256">
               <circle cx="128" cy="96" r="64" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="16"></circle>
               <path d="M31,216a112,112,0,0,1,194,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
            </svg>
            <span>Profile</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}