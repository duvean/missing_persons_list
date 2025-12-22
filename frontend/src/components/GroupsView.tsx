import { useState } from "react";
import { Data } from "../interfaces";

interface Props {
  data: Data;
  addGroup: (name: string) => void;
  selectGroup: (id: number) => void; // Теперь по ID
  deleteGroup: (id: number) => void; // Теперь по ID
  editGroupName: (id: number, newName: string) => void; // Теперь по ID
}

export default function GroupsView({
  data,
  addGroup,
  selectGroup,
  deleteGroup,
  editGroupName,
}: Props) {
  const [name, setName] = useState("");
  // Важно: храним ID редактируемой группы, а не индекс
  const [editingId, setEditingId] = useState<number | null>(null); 
  const [newGroupName, setNewGroupName] = useState("");

  const startEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setNewGroupName(currentName);
  };

  const saveEdit = (id: number) => {
    if (!newGroupName.trim()) {
      alert("Введите имя списка");
      return;
    }
    editGroupName(id, newGroupName.trim());
    setEditingId(null);
    setNewGroupName("");
  };

  return (
    <div className="wrapper">
      <h1>Списки</h1>

      <ul className="group-list">
        {data.groups.map((g) => (
          <li key={g.id}> {/* Используем ID из базы как ключ */}
            {editingId === g.id ? (
              <>
                <input
                  className="input"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(g.id);
                  }}
                  autoFocus
                />
                <button className="btn small" onClick={() => saveEdit(g.id)}>
                  ✔
                </button>
                <button className="delete" onClick={() => setEditingId(null)}>
                  ✖
                </button>
              </>
            ) : (
              <>
                {/* Передаем g.id вместо индекса i */}
                <button className="group-btn" onClick={() => selectGroup(g.id)}>
                  {g.name}
                </button>
                <button className="edit-btn" onClick={() => startEdit(g.id, g.name)}>
                  ✎
                </button>
                <button className="delete" onClick={() => deleteGroup(g.id)}>
                  🗑
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <input
        className="input"
        placeholder="Новый список..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        className="btn"
        onClick={() => {
          if (!name.trim()) return alert("Введите имя списка");
          addGroup(name.trim());
          setName("");
        }}
      >
        Добавить
      </button>
    </div>
  );
}