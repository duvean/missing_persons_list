import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { WbItem } from "../interfaces";

export default function WbDashboard() {
  const [items, setItems] = useState<WbItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [targetPrice, setTargetPrice] = useState(""); 
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    const res = await apiFetch("/items");
    if (res.ok) setItems(await res.json());
  };

  useEffect(() => { loadItems(); }, []);

  const handleAdd = async () => {
    if (!urlInput) return;
    setLoading(true);
    try {
      const res = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify({ 
            url: urlInput, 
            targetPrice: targetPrice ? Number(targetPrice) : null 
        }),
      });
      
      if (res.ok) {
        setUrlInput("");
        setTargetPrice("");
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
    if(!confirm("Удалить товар из отслеживания?")) return;
    const res = await apiFetch(`/items/${id}`, { method: "DELETE" });
    if (res.ok) {
        setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="wrapper">
      {/* Поиск и добавление */}
      <div className="search-box">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input 
            className="input" 
            placeholder="Ссылка на WB или артикул..." 
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
          />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              className="input" 
              type="number"
              placeholder="Цена цели..." 
              value={targetPrice}
              style={{ flex: 1 }}
              onChange={e => setTargetPrice(e.target.value)}
            />
            <button className="btn" onClick={handleAdd} disabled={loading}>
              {loading ? "..." : "➕"}
            </button>
          </div>
        </div>
      </div>

      {/* Сетка товаров (2 колонки) */}
      <div className="items-grid">
        {items.map(item => (
          <div className="item-card" key={item.id}>
            <div style={{ position: 'relative' }}>
                <img src={item.imageUrl} alt={item.name} loading="lazy" />
            </div>
            
            <div className="info">
                <h3>{item.name}</h3>
                
                <div className="price-container">
                    <span className="current-price">{item.currentPrice} ₽</span>
                    {item.oldPrice > item.currentPrice && (
                        <span className="old-price">{item.oldPrice}</span>
                    )}
                </div>
        
                {item.targetPrice && (
                    <div className="target-info">
                        Цель: <b>{item.targetPrice} ₽</b>
                    </div>
                )}

                <p className="meta">Арт: {item.article}</p>
                <button className="delete" onClick={() => handleDelete(item.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
          <div style={{textAlign: 'center', color: '#9ca3af', marginTop: '40px'}}>
              <p>Список пуст. Добавьте первый товар 👆</p>
          </div>
      )}
    </div>
  );
}