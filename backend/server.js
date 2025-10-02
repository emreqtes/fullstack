const express = require("express");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static("public"));

const products = JSON.parse(fs.readFileSync("products.json", "utf8"));

// Basit bellek içi cache: { pricePerGramUSD, fetchedAt }
let goldCache = { pricePerGramUSD: null, fetchedAt: 0 };

async function fetchGoldPricePerGramUSD() {
  // 5 dakikalık cache
  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  if (goldCache.pricePerGramUSD && Date.now() - goldCache.fetchedAt < FIVE_MINUTES_MS) {
    return goldCache.pricePerGramUSD;
  }

  try {
    // Kaynak: Metals.live free endpoint gram altın USD (yaklaşık)
    // Dönüş formatı ör: [[timestamp, pricePerGramUSD]]
    const { data } = await axios.get("https://api.metals.live/v1/spot/gold");
    // metals.live altın ons fiyatı döndürebilir; gram'a çevirmek gerekir:
    // 1 troy ounce = 31.1034768 gram
    // Eğer dizi tek fiyat dönüyorsa onu ons olarak alıp grama çeviriyoruz
    let pricePerGramUSD;
    if (Array.isArray(data) && data.length > 0) {
      const latest = Array.isArray(data[0]) ? data[0][1] : data[0];
      const ouncePrice = typeof latest === "number" ? latest : Number(latest);
      pricePerGramUSD = ouncePrice / 31.1034768;
    } else {
      // Yedek: döviz kuru ulaşılmazsa sabit makul bir değer (ör: 75 USD/gram) kullan
      pricePerGramUSD = 75;
    }

    goldCache = { pricePerGramUSD, fetchedAt: Date.now() };
    return pricePerGramUSD;
  } catch (err) {
    // Hata durumunda son cache'i ya da yedek değer
    if (goldCache.pricePerGramUSD) return goldCache.pricePerGramUSD;
    return 75; // fail-safe
  }
}

app.get("/products", async (req, res) => {
  try {
    const goldPricePerGramUSD = await fetchGoldPricePerGramUSD();

    let productsWithPrice = products.map(p => ({
      ...p,
      price: ((p.popularityScore + 1) * p.weight * goldPricePerGramUSD)
    }));

    // Filtreleme (opsiyonel): priceMin, priceMax, popMin, popMax
    const { priceMin, priceMax, popMin, popMax } = req.query;

    if (priceMin !== undefined) {
      const min = Number(priceMin);
      productsWithPrice = productsWithPrice.filter(p => p.price >= min);
    }
    if (priceMax !== undefined) {
      const max = Number(priceMax);
      productsWithPrice = productsWithPrice.filter(p => p.price <= max);
    }
    if (popMin !== undefined) {
      const minPop = Number(popMin);
      productsWithPrice = productsWithPrice.filter(p => p.popularityScore >= minPop);
    }
    if (popMax !== undefined) {
      const maxPop = Number(popMax);
      productsWithPrice = productsWithPrice.filter(p => p.popularityScore <= maxPop);
    }

    // İki ondalık USD formatı string'e çevir
    productsWithPrice = productsWithPrice.map(p => ({
      ...p,
      price: p.price.toFixed(2)
    }));

    res.json({
      goldPricePerGramUSD: goldPricePerGramUSD.toFixed(4),
      count: productsWithPrice.length,
      items: productsWithPrice
    });
  } catch (e) {
    res.status(500).json({ error: "Ürünler getirilemedi" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend ${PORT} portunda çalışıyor`);
});
