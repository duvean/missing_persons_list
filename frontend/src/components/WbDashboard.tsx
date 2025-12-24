import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { WbItem } from "../interfaces";

export default function WbDashboard() {
  const [items, setItems] = useState<WbItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Загрузка сохраненных товаров
  const loadItems = async () => {
    const res = await apiFetch("/items");
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => { loadItems(); }, []);

  // Парсинг нового товара
  const handleAdd = async () => {
    if (!urlInput) return;
    setLoading(true);
    try {
      const res = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify({ url: urlInput }),
      });
      
      if (res.ok) {
        setUrlInput("");
        loadItems();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      alert("Ошибка сети при парсинге");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await apiFetch(`/items/${id}`, { method: "DELETE" });
    if (res.ok) {
        setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="wrapper" style={{ maxWidth: '800px' }}>
      <h1>WB Монитор</h1>
      
      <div className="search-box">
        <input 
          className="input" 
          placeholder="Вставьте ссылку на товар или артикул..." 
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
        />
        <button className="btn" onClick={handleAdd} disabled={loading}>
          {loading ? "Загрузка..." : "Спарсить"}
        </button>
      </div>

      <div className="items-grid">
        {items.map(item => (
          <div className="item-card">
            <img src={item.imageUrl} alt={item.name} />
            <div className="info">
                <h3>{item.name}</h3>
                <div className="price-container">
                <span className="current-price">{item.currentPrice} ₽</span>
                {item.oldPrice > 0 && (
                    <span className="old-price">{item.oldPrice} ₽</span>
                )}
                </div>
                <p className="meta">Артикул: {item.wbId}</p>
                <button className="delete" onClick={() => handleDelete(item.id)}>Удалить</button>
            </div>
            </div>
        ))}
      </div>
    </div>
  );
}