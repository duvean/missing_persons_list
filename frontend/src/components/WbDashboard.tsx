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
      if (res.ok) {
        setUrlInput("");
        setTargetPrice("");
        loadItems();
      } else {
        alert("Ошибка добавления");
      }
    } catch { alert("Ошибка сети"); }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить?")) return;
    const res = await apiFetch(`/items/${id}`, { method: "DELETE" });
    if (res.ok) setItems(items.filter(i => i.id !== id));
  };

  return (
    <>
      {/* Search Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Add New</h2>
        </div>
        <div className="search-wrapper">
          <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
             <input 
                className="modern-input" 
                placeholder="Link or Article..." 
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
             />
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
             <input 
                className="modern-input" 
                type="number"
                placeholder="Target Price" 
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
             />
             <button 
                className="app-header-btn app-header-btn--active" 
                onClick={handleAdd}
                style={{background: 'white', borderRadius: '15px', width: '50px', height: 'auto'}}
             >
                {loading ? "..." : "+"}
             </button>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Tracking ({items.length})</h2>
          <span className="section-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <rect width="256" height="256" fill="none"></rect>
                <line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
                <polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
            </svg>
          </span>
        </div>

        <div className="product-grid">
          {items.map(item => (
            <article className="product" key={item.id}>
              <div className="product-image">
                <img src={item.imageUrl} alt={item.name} />
              </div>
              <div className="product-content">
                <h3 className="product-title">{item.name}</h3>
                <div style={{fontSize: '0.75rem', color: '#999', marginBottom: '5px'}}>
                    Art: {item.article}
                </div>
                
                {item.targetPrice && (
                    <div style={{fontSize: '0.7rem', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', width: 'fit-content'}}>
                        Goal: {item.targetPrice} ₽
                    </div>
                )}

                <div className="product-info">
                  <span className="product-price">{item.currentPrice} ₽</span>
                  <button className="product-btn product-btn--delete" onClick={() => handleDelete(item.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" width="16" height="16">
                      <line x1="200" y1="56" x2="56" y2="200" stroke="currentColor" strokeWidth="20" strokeLinecap="round"/>
                      <line x1="200" y1="200" x2="56" y2="56" stroke="currentColor" strokeWidth="20" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}