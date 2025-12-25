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
        body: JSON.stringify({ url: urlInput, targetPrice: targetPrice ? Number(targetPrice) : null }),
      });
      if (res.ok) { setUrlInput(""); setTargetPrice(""); loadItems(); }
      else { alert((await res.json()).error); }
    } catch { alert("Ошибка"); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Удалить?")) return;
    const res = await apiFetch(`/items/${id}`, { method: "DELETE" });
    if (res.ok) setItems(items.filter(item => item.id !== id));
  };

  return (
    <div>
      {/* Поиск / Добавление */}
      <div className="section-header">
         <h2 className="section-title">Add Item</h2>
      </div>
      
      <div className="search-wrapper">
         <svg width="24" height="24" fill="none" stroke="#999" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
         </svg>
         <input 
            className="search-input" 
            placeholder="Paste WB link..." 
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
         />
      </div>
      {/* Второе поле для цены (если нужно, можно скрыть) */}
      {urlInput && (
        <div className="search-wrapper" style={{ marginTop: '-10px' }}>
            <span style={{fontSize: '1.2rem'}}>🎯</span>
            <input 
                className="search-input" 
                type="number"
                placeholder="Target price (optional)" 
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
            />
            <button style={{color: 'var(--c-purple-500)', fontWeight: 700}} onClick={handleAdd}>
                {loading ? "..." : "ADD"}
            </button>
        </div>
      )}

      {/* Список товаров */}
      <div className="section-header">
         <h2 className="section-title">My Tracklist</h2>
         <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{items.length} items</span>
      </div>

      <div className="items-grid">
        {items.map(item => (
          <article className="product" key={item.id}>
            <div className="product-image-wrapper">
               <img src={item.imageUrl} alt={item.name} className="product-image" />
            </div>
            <div className="product-content">
               {/* Название */}
               <h3 className="product-title">{item.name}</h3>
               
               {/* Цена */}
               <span className="product-price">{item.currentPrice} ₽</span>
               
               {item.targetPrice && (
                   <span className="target-badge">Goal: {item.targetPrice}</span>
               )}

               {/* Кнопки */}
               <div className="product-info" style={{marginTop: '10px', display: 'flex', justifyContent: 'center'}}>
                  <div className="product-btn-group">
                     <button className="product-btn" onClick={() => window.open(item.url, '_blank')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                     </button>
                     <button className="product-btn product-btn--delete" onClick={() => handleDelete(item.id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <polyline points="3 6 5 6 21 6"></polyline>
                           <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                     </button>
                  </div>
               </div>
            </div>
          </article>
        ))}
      </div>
      
      {items.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
              <p>No items yet.</p>
          </div>
      )}
    </div>
  );
}