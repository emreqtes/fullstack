## Ürün Listeleme Uygulaması

Bu repo; canlı altın fiyatına göre dinamik fiyat hesaplayan Node.js backend ve React (Create React App) frontend içerir.

### Canlı Linkler
- Frontend (Vercel): https://fullstack-one-red.vercel.app 
- Backend API: https://fullstack-9rgr.onrender.com/products

### Özellikler
- Canlı altın gram fiyatı ile dinamik fiyat (5 dk cache)
- Ürünler: isim, fiyat, çoklu görsel, renk seçici
- Carousel (oklarla ve swipe)
- Popülerliği 5 üzerinden 1 ondalık gösterim
- Fiyat ve popülerlik filtreleri (min/maks)

### Fiyat Formülü
Price = (popularityScore + 1) × weight × goldPricePerGramUSD

- popularityScore: 0–1 aralığı
- weight: gram cinsinden ürün ağırlığı
- goldPricePerGramUSD: USD cinsinden gram altın fiyatı

### Altın Fiyatı Veri Kaynağı
- Kaynak: `https://api.metals.live/v1/spot/gold`
- Dönüşüm: Endpoint ons (troy ounce) fiyatı verebilir; gram fiyatı için 1 oz = 31.1034768 g kullanılır.
- Önbellek: 5 dakika bellek içi cache; hata durumunda son bilinen değer veya güvenli varsayılan kullanılır.

### API
- Endpoint: `GET /products`
- Query Parametreleri:
  - `priceMin`, `priceMax`: USD cinsinden fiyat aralığı
  - `popMin`, `popMax`: 0–1 aralığında popülerlik (frontend 0–5’i otomatik 0–1’e çevirir)
- Response (örnek alanlar):
  ```json
  {
    "goldPricePerGramUSD": "XX.XXXX",
    "count": 4,
    "items": [
      {
        "name": "Ürün 1",
        "popularityScore": 0.8,
        "weight": 200,
        "images": ["/images/resim1.png", "/images/resim2.png", "/images/resim3.png"],
        "price": "101.00"
      }
    ]
  }
  ```

### Ortam Değişkenleri
- Frontend: `REACT_APP_API_BASE` (ör. `https://fullstack-9rgr.onrender.com`)

### Lokal Çalıştırma
1) Backend
   - `cd backend && npm i && npm start`
   - Test: `http://localhost:3001/products`
2) Frontend
   - `cd frontend && npm i && npm start`
   - `.env` içine ekleyin:
     ```
     REACT_APP_API_BASE=http://localhost:3001
     ```

### Deploy
- Backend (Render)
  - Root Directory: `backend`
  - Build: `npm install`
  - Start: `npm start`
- Frontend (Vercel)
  - Root Directory: `frontend`
  - Framework: Create React App
  - Env Var: `REACT_APP_API_BASE=https://<backend-url>`
### Ekran Görüntüsü
<img width="1919" height="1079" alt="ekrangrnt1" src="https://github.com/user-attachments/assets/0c792f78-1573-48ee-be75-f66012407123" />
<img width="1919" height="1079" alt="ekrangrnt2" src="https://github.com/user-attachments/assets/aa6ad8fd-c594-4a7d-95a7-82a5e1ed29fc" />
