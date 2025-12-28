import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "../api";
import { WbItem } from "../interfaces";

const PriceEditor = ({ id, initialPrice, onUpdate, isReached }: any) => {
    const [price, setPrice] = useState(initialPrice || "");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setPrice(initialPrice || "");
    }, [initialPrice]);

    const handleCommit = () => {
        const numericPrice = Number(price); 
        if (numericPrice !== initialPrice && !isNaN(numericPrice)) {
            onUpdate(id, numericPrice);
        }
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div 
                className={`price-display ${isReached ? 'status-reached' : 'status-waiting'}`} 
                onClick={() => setIsEditing(true)}
            >
                <span className="status-icon">
                    {isReached ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    )}
                </span>
                Цель: <span className="target-val">{initialPrice ? `${initialPrice} ₽` : "Не задано"}</span> ✎
            </div>
        );
    }

    return (
        <input 
          type="number" 
          className="price-edit-input"
          autoFocus
          value={price}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => e.key === "Enter" && handleCommit()}
      />
    );
};

export default function WbDashboard() {
  const [items, setItems] = useState<WbItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showReached, setShowReached] = useState(true);
  const [showWaiting, setShowWaiting] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadItems = async () => {
      const res = await apiFetch("/items");
      if (res.ok) {
        let data = await res.json();
        setItems(data);
      }
  };

  useEffect(() => { loadItems(); }, []);

  const filteredAndSortedItems = useMemo(() => {
    return [...items]
      .filter(item => {
        const isReached = item.lastNotifiedPrice !== null;
        if (isReached && !showReached) return false;
        if (!isReached && !showWaiting) return false;
        return true;
      })
      .sort((a, b) => {
        const aReached = a.lastNotifiedPrice !== null ? 1 : 0;
        const bReached = b.lastNotifiedPrice !== null ? 1 : 0;

        if (aReached !== bReached) return bReached - aReached;
        return sortBy === "newest" ? b.id - a.id : a.id - b.id;
      });
  }, [items, sortBy, showReached, showWaiting]);

  const handleAdd = async () => {
    if (!urlInput.trim()) {
      alert("Please enter a link or article");
      return;
    }
    
    if (!targetPrice || Number(targetPrice) <= 0) {
      alert("Please set a valid Target Price to start tracking");
      return;
    }

    setLoading(true);
    setIsAdding(true);
    
    try {
      const res = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify({ 
          url: urlInput, 
          targetPrice: Number(targetPrice) 
        }),
      });

      if (res.ok) {
        setUrlInput("");
        setTargetPrice("");
        await loadItems();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Error adding item");
      }
    } catch (e) {
      alert("Connection error");
    } finally {
      setLoading(false);
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить?")) return;
    const res = await apiFetch(`/items/${id}`, { method: "DELETE" });
    if (res.ok) setItems(items.filter(i => i.id !== id));
  };

  const handleUpdatePrice = async (id: number, newPrice: number) => {
    try {
      const res = await apiFetch(`/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ targetPrice: newPrice })
      });

      if (res.ok) {
        setItems(prevItems => prevItems.map(item => 
          item.id === id 
            ? { ...item, targetPrice: Number(newPrice), lastNotifiedPrice: null }
            : item
        ));
      }
    } catch (e) {
      console.error(e);
    }
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
          
          <div className="filter-container">
            <button className="app-header-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                <path d="M200,128a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H192A8,8,0,0,1,200,128Zm32-64H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16Zm-64,128H88a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Z"></path>
              </svg>
            </button>

            {isFilterOpen && (
              <div className="filter-dropdown">
                <div className="filter-group">
                  <label>Sorting</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Статус</label>
                  <div className="checkbox-item">
                    <input type="checkbox" checked={showReached} onChange={() => setShowReached(!showReached)} id="reached" />
                    <label htmlFor="reached">Reached</label>
                  </div>
                  <div className="checkbox-item">
                    <input type="checkbox" checked={showWaiting} onChange={() => setShowWaiting(!showWaiting)} id="waiting" />
                    <label htmlFor="waiting">Awaiting</label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="product-grid">
          {/* Плейсхолдер во время добавления */}
          {isAdding && (
            <article className="product skeleton-card">
              <div className="skeleton-shimmer"></div>
            </article>
          )}

          {filteredAndSortedItems.map(item => {
            return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.id}
            >
              <article className="product">
                <div className="product-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
                <div className="product-content">
                  <h3 className="product-title">{item.name}</h3>
                  <div style={{fontSize: '0.75rem', color: '#999', marginBottom: '5px', padding: '2px 6px'}}>
                      Art: {item.article}
                  </div>
                
                  <div className="threshold-info">
                     <PriceEditor 
                        id={item.id} 
                        initialPrice={item.targetPrice} 
                        onUpdate={handleUpdatePrice} 
                        isReached={item.lastNotifiedPrice !== null}
                    />
                  </div>
                  <div className="product-info">
                    <span className="product-price">{item.currentPrice} ₽</span>
                    <button className="product-btn" onClick={() => window.open(`https://www.wildberries.ru/catalog/${item.article}/detail.aspx`, '_blank')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </button>
                    <button className="product-btn product-btn--delete" onClick={() => handleDelete(item.id)}>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              </article>
            </motion.div>
          )})}
        </div>
      </section>
    </>
  );
}