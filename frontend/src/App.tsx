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
  const [isCursed, setIsCursed] = useState(() => localStorage.getItem("theme") === "cursed");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("theme", isCursed ? "cursed" : "normal");
    document.body.className = isCursed ? "cursed-theme" : "normal-theme";
  }, [isCursed]);

  const fetchUserProfile = async () => {
    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) {
      console.error("Failed to fetch profile");
    }
  };

  useEffect(() => {
    if (token) {
      try {
        jwtDecode(token);
        fetchUserProfile();
      } catch (e) {
        handleLogout(false);
      }
    }
  }, [token]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("todo_token", newToken);
    setToken(newToken);
    navigate("/");
  };

  const handleLogout = (ask = true) => {
    if (ask && !confirm("Выйти из аккаунта?")) return;
    localStorage.removeItem("todo_token");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );

  const avatarUrl = user?.telegramAvatar?.startsWith('http') 
    ? user.telegramAvatar 
    : user?.telegramAvatar 
      ? `http://localhost:3000${user.telegramAvatar}` 
      : null;

  return (
    <div className={`app-shell ${isCursed ? "cursed" : ""}`}>
      {/* Верхняя панель */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate("/")}>
            <span className="logo-icon">⚡</span> PRICE PULSE
          </div>
          {/* Кнопка темы */}
          <button className="theme-ghost-btn" onClick={() => setIsCursed(!isCursed)}>
            {isCursed ? "👹" : ""}
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main className="main-viewport">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><WbDashboard /></PageWrapper>} />
            <Route path="/profile" element={
              <PageWrapper>
                <Profile 
                  userData={user} 
                  onRefresh={fetchUserProfile} 
                  onLogout={() => handleLogout(true)} 
                />
              </PageWrapper>
            } />
            <Route path="*" element={<PageWrapper><h2>404</h2></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Нижняя навигация */}
      <nav className="bottom-nav">
        <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Главная</span>
        </Link>
        <Link to="/profile" className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}>
          {avatarUrl ? (
             <img src={avatarUrl} alt="Me" className="nav-avatar" />
          ) : (
             <span className="nav-icon">👤</span>
          )}
          <span className="nav-label">Профиль</span>
        </Link>
      </nav>
    </div>
  );
}