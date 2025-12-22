import { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import "./css/normal.css";
import "./css/cursed.css";

import GroupsView from "./components/GroupsView";
import TodosView from "./components/TodosView";
import { Auth } from "./components/Auth"; // Созданный ранее компонент
import { apiFetch } from "./api"; // Сервис с fetch + headers

import { Routes, Route, useNavigate, useParams } from "react-router-dom";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("todo_token"));
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [data, setData] = useState({ groups: [] as any[] });
  const [isCursed, setIsCursed] = useState(false);
  const navigate = useNavigate();

  // --- Загрузка данных с сервера ---
  const loadFromServer = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch("/groups");
      if (res.ok) {
        const groups = await res.json();
        setData({ groups });
      }
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    }
  }, [token]);

  useEffect(() => {
    if (isCursed) {
      document.body.classList.add("cursed-theme");
    } else {
      document.body.classList.remove("cursed-theme");
    }
  }, [isCursed]);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

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

  // --- Функции для списков (Groups) ---

  const addGroup = async (name: string) => {
    const res = await apiFetch("/groups", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (res.ok) loadFromServer(); // Просто перекачиваем данные с сервера
  };

  const deleteGroup = async (id: number) => {
    const res = await apiFetch(`/groups/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadFromServer();
      navigate("/");
    }
  };

  // --- Компонент для отображения задач ---
  
  const GroupedTodosView = () => {
    const { id } = useParams(); // ID из базы а не индекс массива
    const groupId = Number(id);
    const navigate = useNavigate();
    
    // Ищем группу в загруженных данных
    const group = data.groups.find(g => g.id === Number(id));

    useEffect(() => {
      if (data.groups.length > 0 && !group) {
        navigate("/", { replace: true });
      }
    }, [group, data.groups.length, navigate]);

    if (!group) return null;

    const addTodo = async (text: string) => {
      const res = await apiFetch(`/groups/${id}/todos`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (res.ok) loadFromServer();
    };

    const toggleTodo = async (todoId: number) => {
      const res = await apiFetch(`/groups/todos/${todoId}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) loadFromServer();
    };

    const deleteTodo = async (todoId: number) => {
      const res = await apiFetch(`/groups/todos/${todoId}`, {
        method: "DELETE",
      });
      if (res.ok) loadFromServer();
    };

    const editTodoText = async (todoId: number, newText: string) => {
      const res = await apiFetch(`/groups/todos/${todoId}`, {
        method: "PATCH",
        body: JSON.stringify({ text: newText }),
      });
      if (res.ok) loadFromServer();
    };

    const editGroupName = async (id: number, newName: string) => {
      const res = await apiFetch(`/groups/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) loadFromServer();
    };

    const handleEditGroupName = async (newName: string) => {
      await editGroupName(groupId, newName);
    };

    return (
      <TodosView
        group={group}
        goBack={() => navigate("/")}
        addTodo={addTodo}
        toggleTodo={toggleTodo}
        deleteTodo={deleteTodo}
        editTodoText={editTodoText}
        editGroupName={handleEditGroupName}
      />
    );
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
                <span className="user-icon">Ø̸̡͎̹̣̦̦̙̙̱̼̰͊̂̾̄͊̄́̉̋̉̎͋͝</span>
                <span className="user-email">{userEmail}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>Выйти</button>
            </div>
          )}
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <GroupsView
                data={data}
                addGroup={addGroup}
                selectGroup={(id) => navigate(`/group/${id}`)}
                deleteGroup={deleteGroup}
                editGroupName={() => {}}
              />
            }
          />
          {/* ВАЖНО: меняем :index на :id, так как индексы массива в БД ненадежны */}
          <Route path="/group/:id" element={<GroupedTodosView />} />
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