import express from "express";
import { searchDuffel } from "./providers/duffel.js";
import { searchMock } from "./providers/mock.js";

const app = express();
const cache = new Map();
const TTL = 5 * 60_000;
const IATA = /^[A-Z]{3}$/, DATE = /^\d{4}-\d{2}-\d{2}$/;
const CABINS = ["economy", "premium_economy", "business", "first"];

app.use(express.static("public"));

app.get("/api/search", async (req, res) => {
  const q = req.query;
  const origin = String(q.origin || "").toUpperCase();
  const destination = String(q.destination || "").toUpperCase();
  const depart = String(q.depart || "");
  const ret = q.ret ? String(q.ret) : "";
  const cabin = CABINS.includes(q.cabin) ? q.cabin : "economy";
  const adults = Math.min(Math.max(parseInt(q.adults) || 1, 1), 9);

  if (!IATA.test(origin) || !IATA.test(destination) || !DATE.test(depart) || (ret && !DATE.test(ret)))
    return res.status(400).json({ error: "Parâmetros inválidos: origin/destination (IATA), depart/ret (YYYY-MM-DD)." });

  const provider = process.env.DUFFEL_TOKEN ? "duffel" : "mock";
  const key = [provider, origin, destination, depart, ret, adults, cabin].join("|");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return res.json({ provider, cached: true, offers: hit.offers });

  try {
    const fn = provider === "duffel" ? searchDuffel : searchMock;
    const offers = await fn({ origin, destination, depart, ret, adults, cabin });
    cache.set(key, { t: Date.now(), offers });
    res.json({ provider, cached: false, offers });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("http://localhost:" + (process.env.PORT || 3000)));
