import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./css/normal.css";
import "./css/cursed.css";

import WbDashboard from "./components/WbDashboard"; // Новый дашборд
import { Auth } from "./components/Auth";
import { Routes, Route, useNavigate } from "react-router-dom";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("todo_token"));
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Состояние для "проклятой" темы
  const [isCursed, setIsCursed] = useState(() => {
    return localStorage.getItem("theme") === "cursed";
  });
  
  const navigate = useNavigate();

  // --- Эффект темы (Cursed Mode) ---
  useEffect(() => {
    localStorage.setItem("theme", isCursed ? "cursed" : "normal");
    if (isCursed) {
      document.body.classList.add("cursed-theme");
    } else {
      document.body.classList.remove("cursed-theme");
    }
  }, [isCursed]);

  // --- Эффект декодирования токена ---
  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserEmail(decoded.email || "User"); 
      } catch (e) {
        setUserEmail("Account");
      }
    }
  }, [token]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("todo_token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("todo_token");
    setToken(null);
    navigate("/");
  };

  // Если нет токена — показываем только экран входа
  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={isCursed ? "cursed-theme" : "normal-theme"}>
      <div className="app-container">
        <header>
          {token && (
            <div className="header-bar">
              <div className="user-info">
                {/* Иконка меняется в зависимости от стиля в CSS, но тут оставим текст */}
                <span className="user-icon">👤</span> 
                <span className="user-email">{userEmail}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>Выйти</button>
            </div>
          )}
        </header>

        <Routes>
          {/* Главная страница теперь ведет на WB дашборд */}
          <Route path="/" element={<WbDashboard />} />
          <Route path="*" element={<h2>404 - Страница не найдена</h2>} />
        </Routes>

        <button 
          className="theme-toggle-btn" 
          onClick={() => setIsCursed(!isCursed)}
        >
          {isCursed ? "Оделся сам" : "Наорала"}
        </button>
      </div>
    </div>
  );
}