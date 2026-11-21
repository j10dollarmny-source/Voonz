// Dados fictícios para desenvolver sem token.
const AIRLINES = [["LA", "LATAM"], ["G3", "GOL"], ["AD", "Azul"], ["AA", "American"], ["TP", "TAP"]];
const pad = (n) => String(n).padStart(2, "0");
const rnd = (seed) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

function slice(r, from, to, date) {
  const stops = Math.floor(r() * 3);
  const h = 5 + Math.floor(r() * 16), m = Math.floor(r() * 4) * 15;
  const duration = 90 + stops * 150 + Math.floor(r() * 240);
  const dep = new Date(`${date}T${pad(h)}:${pad(m)}:00Z`);
  const arr = new Date(dep.getTime() + duration * 60000);
  const iso = (d) => d.toISOString().slice(0, 19);
  return { origin: from, destination: to, departAt: iso(dep), arriveAt: iso(arr), duration, stops,
    segments: [{ from, to, dep: iso(dep), arr: iso(arr), flight: "XX0000" }] };
}

export async function searchMock({ origin, destination, depart, ret, adults }) {
  const r = rnd([...(origin + destination + depart)].reduce((a, c) => a + c.charCodeAt(0), 7));
  return Array.from({ length: 24 }, (_, i) => {
    const [code, name] = AIRLINES[Math.floor(r() * AIRLINES.length)];
    const slices = [slice(r, origin, destination, depart)];
    if (ret) slices.push(slice(r, destination, origin, ret));
    return { id: "mock_" + i, price: Math.round((300 + r() * 1800) * adults * 100) / 100, currency: "BRL",
      airline: { code, name }, slices };
  });
}
