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
    if (token) {
      try { jwtDecode(token); fetchUserProfile(); } 
      catch { handleLogout(false); }
    }
  }, [token]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("todo_token", newToken);
    setToken(newToken);
    navigate("/");
  };

  const handleLogout = (ask = true) => {
    if (ask && !confirm("Выйти?")) return;
    localStorage.removeItem("todo_token");
    setToken(null); setUser(null);
    navigate("/");
  };

  if (!token) return <Auth onLogin={handleLogin} />;

  // Аватарка для нижней панели
  const avatarUrl = user?.telegramAvatar?.startsWith('http') 
    ? user.telegramAvatar 
    : user?.telegramAvatar ? `http://localhost:3000${user.telegramAvatar}` : null;

  return (
    <div className="app">
      {/* HEADER */}
      <header className="app-header">
        <div className="app-header-title">
             {/* Icon Logo */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
            </svg>
            PRICE PULSE
        </div>
        <button className="app-header-btn" onClick={() => fetchUserProfile()}>
             {/* Refresh Icon */}
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
        </button>
      </header>

      {/* BODY */}
      <main className="app-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<WbDashboard />} />
              <Route path="/profile" element={
                <Profile userData={user} onRefresh={fetchUserProfile} onLogout={() => handleLogout(true)} />
              } />
              <Route path="*" element={<h2>404</h2>} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER (Navigation) */}
      <footer className="app-footer">
        <nav className="menu-bar">
          <Link to="/" className={`menu-bar-item ${location.pathname === "/" ? "menu-bar-item--active" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="menu-bar-item-text">Dashboard</span>
          </Link>
          
          <Link to="/profile" className={`menu-bar-item ${location.pathname === "/profile" ? "menu-bar-item--active" : ""}`}>
            {avatarUrl ? (
                <img src={avatarUrl} alt="Me" />
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )}
            <span className="menu-bar-item-text">Profile</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}