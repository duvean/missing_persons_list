import { useState } from "react";
import { Group } from "../interfaces";

interface Props {
  group: Group;
  goBack: () => void;
  addTodo: (text: string) => void;
  toggleTodo: (todoId: number) => void;
  deleteTodo: (todoId: number) => void; 
  editTodoText: (todoId: number, newText: string) => void; 
  editGroupName: (newName: string) => void;
}

export default function TodosView({
  group,
  goBack,
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodoText,
  editGroupName,
}: Props) {
  const [text, setText] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [newTodoText, setNewTodoText] = useState("");
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(group.name);

  // --- Функции для редактирования тасок ---
  const startEditTodo = (id: number, currentText: string) => {
    setEditingTodoId(id);
    setNewTodoText(currentText);
  };

  const saveEditTodo = (id: number) => {
    if (!newTodoText.trim()) {
      alert("Введите задачу");
      return;
    }
    editTodoText(id, newTodoText.trim());
    setEditingTodoId(null);
    setNewTodoText("");
  };

  const saveEditGroupName = () => {
    if (!newGroupName.trim()) {
      alert("Введите имя списка");
      return;
    }
    editGroupName(newGroupName.trim());
    setIsEditingGroupName(false);
  };

  return (
    <div className="wrapper">
      <button className="back-btn" onClick={goBack}>
        ← Назад
      </button>

      <div className="group-header">
        {isEditingGroupName ? (
          <>
            <input
              className="input large-input"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEditGroupName();
              }}
              autoFocus
            />
            <button className="btn small" onClick={saveEditGroupName}>✔</button>
            <button className="delete" onClick={() => setIsEditingGroupName(false)}>✖</button>
          </>
        ) : (
          <>
            <h2>{group.name}</h2>
            <button className="edit-btn" onClick={() => {
                setNewGroupName(group.name);
                setIsEditingGroupName(true);
            }}>✎</button>
          </>
        )}
      </div>

      <ul className="todo-list">
        {group.todos.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            {editingTodoId === t.id ? (
              <>
                <input
                  className="input small-input"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEditTodo(t.id);
                  }}
                  autoFocus
                />
                <button className="btn small" onClick={() => saveEditTodo(t.id)}>✔</button>
                <button className="delete" onClick={() => setEditingTodoId(null)}>✖</button>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTodo(t.id)}
                />
                <span onDoubleClick={() => startEditTodo(t.id, t.text)}>{t.text}</span>
                <button className="edit-btn" onClick={() => startEditTodo(t.id, t.text)}>✎</button>
                <button className="delete" onClick={() => deleteTodo(t.id)}>✖</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <input
        className="input"
        placeholder="Новая задача..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className="btn"
        onClick={() => {
          if (!text.trim()) return alert("Введите задачу");
          addTodo(text.trim());
          setText("");
        }}
      >
        Добавить
      </button>
    </div>
  );
}
