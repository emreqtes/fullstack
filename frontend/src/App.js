import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndexByProduct, setActiveImageIndexByProduct] = useState({});
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [popMin, setPopMin] = useState("");
  const [popMax, setPopMax] = useState("");

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

  useEffect(() => {
    handleSearch();
  }, []);

  async function handleSearch() {
    try {
      setLoading(true);
      const params = {};
      if (priceMin !== "") params.priceMin = priceMin;
      if (priceMax !== "") params.priceMax = priceMax;
      if (popMin !== "") params.popMin = (Number(popMin) / 5).toFixed(2);
      if (popMax !== "") params.popMax = (Number(popMax) / 5).toFixed(2);
      const res = await axios.get(`${API_BASE}/products`, { params });
      const { items } = res.data || {};
      setItems(items || []);
    } catch (e) {
      setError("Ürünler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  const popularityToFive = (score) => {
    // score 0..1 -> 0..5, 1 ondalık
    return (score * 5).toFixed(1);
  };

  const renderStars = (score) => {
    const filled = Math.round((score || 0) * 5);
    const empty = 5 - filled;
    return "★".repeat(filled) + "☆".repeat(empty);
  };

  const handlePrev = (idx) => {
    setActiveImageIndexByProduct((prev) => {
      const current = prev[idx] ?? 0;
      const next = (current - 1 + (items[idx]?.images?.length || 1)) % (items[idx]?.images?.length || 1);
      return { ...prev, [idx]: next };
    });
  };

  const handleNext = (idx) => {
    setActiveImageIndexByProduct((prev) => {
      const current = prev[idx] ?? 0;
      const next = (current + 1) % (items[idx]?.images?.length || 1);
      return { ...prev, [idx]: next };
    });
  };

  const handlePickColor = (idx, imageIndex) => {
    setActiveImageIndexByProduct((prev) => ({ ...prev, [idx]: imageIndex }));
  };

  // Basit dokunma/sürükleme için event handler'lar
  const [touchStartX, setTouchStartX] = useState(null);
  const SWIPE_THRESHOLD = 30;

  const onTouchStart = (e) => setTouchStartX(e.touches?.[0]?.clientX ?? null);
  const onTouchEnd = (idx) => (e) => {
    if (touchStartX == null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (delta > SWIPE_THRESHOLD) {
      handlePrev(idx);
    } else if (delta < -SWIPE_THRESHOLD) {
      handleNext(idx);
    }
    setTouchStartX(null);
  };

  const scrollerRef = useRef(null);
  if (loading) return <div className="app">Ürünler yükleniyor...</div>;
  if (error) return <div className="app" style={{ color: "red" }}>{error}</div>;
  const scrollByAmount = (amount) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="app">
      <div className="title">Ürünler</div>
      <div className="filters">
        <input type="number" placeholder="Min Fiyat (USD)" value={priceMin} onChange={(e)=>setPriceMin(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }} />
        <input type="number" placeholder="Maks Fiyat (USD)" value={priceMax} onChange={(e)=>setPriceMax(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }} />
        <input type="number" placeholder="Min Popülerlik (0-5)" value={popMin} onChange={(e)=>setPopMin(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }} />
        <input type="number" placeholder="Maks Popülerlik (0-5)" value={popMax} onChange={(e)=>setPopMax(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }} />
        <button onClick={handleSearch}>Ara</button>
        <button onClick={()=>{setPriceMin("");setPriceMax("");setPopMin("");setPopMax("");handleSearch();}}>Sıfırla</button>
      </div>
      {items.length === 0 && <p>Ürün bulunamadı</p>}
      <div className="listWrap">
        <button className="navBtn navLeft" onClick={() => scrollByAmount(-300)}>◀</button>
        <div className="productsScroller" ref={scrollerRef}>
        {items.map((p, idx) => {
          const activeIndex = activeImageIndexByProduct[idx] ?? 0;
          const images = p.images || [];
          const activeImage = images[activeIndex] || images[0];
          return (
            <div key={idx} className="productCard">
              <div className="imageBox" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd(idx)}>
                <img src={`${API_BASE}${activeImage}`} alt={p.name} />
                <button className="imgArrow imgArrowLeft" onClick={() => handlePrev(idx)}>◀</button>
                <button className="imgArrow imgArrowRight" onClick={() => handleNext(idx)}>▶</button>
              </div>
              <div className="name">{p.name || "Product Title"}</div>
              <div className="price">${p.price} USD</div>

              <div className="colorRow">
                {images.map((img, i) => (
                  <span
                    key={i}
                    className={`colorDot ${i===0?"dotYellow":i===1?"dotWhite":"dotRose"}`}
                    onClick={() => handlePickColor(idx, i)}
                    title={`Renk ${i+1}`}
                    style={{ outline: activeIndex===i?"2px solid #222":"none", outlineOffset: 2 }}
                  />
                ))}
                <span className="colorLabel">{activeIndex===0?"Yellow Gold":activeIndex===1?"White Gold":"Rose Gold"}</span>
              </div>

              <div className="starsRow">
                <span className="stars">{renderStars(p.popularityScore)}</span>
                <span className="ratingText">{popularityToFive(p.popularityScore)} / 5</span>
              </div>
            </div>
          );
        })}
        </div>
        <button className="navBtn navRight" onClick={() => scrollByAmount(300)}>▶</button>
      </div>
    </div>
  );
}

export default App;
