// Formato normalizado: { id, price, currency, airline:{code,name}, slices:[{origin,destination,departAt,arriveAt,duration,stops,segments:[...]}] }
const toMin = (iso) => {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?$/.exec(iso || "");
  return m ? (+m[1] || 0) * 1440 + (+m[2] || 0) * 60 + (+m[3] || 0) : null;
};

export async function searchDuffel({ origin, destination, depart, ret, adults, cabin }) {
  const slices = [{ origin, destination, departure_date: depart }];
  if (ret) slices.push({ origin: destination, destination: origin, departure_date: ret });

  const r = await fetch("https://api.duffel.com/air/offer_requests?return_offers=true", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DUFFEL_TOKEN}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: { slices, passengers: Array.from({ length: adults }, () => ({ type: "adult" })), cabin_class: cabin },
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.errors?.[0]?.message || `Duffel HTTP ${r.status}`);

  return j.data.offers.map((o) => ({
    id: o.id,
    price: Number(o.total_amount),
    currency: o.total_currency,
    airline: { code: o.owner.iata_code, name: o.owner.name },
    slices: o.slices.map((s) => {
      const seg = s.segments;
      const dep = seg[0].departing_at, arr = seg.at(-1).arriving_at;
      return {
        origin: seg[0].origin.iata_code,
        destination: seg.at(-1).destination.iata_code,
        departAt: dep,
        arriveAt: arr,
        duration: toMin(s.duration) ?? Math.round((new Date(arr) - new Date(dep)) / 60000),
        stops: seg.length - 1,
        segments: seg.map((x) => ({
          from: x.origin.iata_code,
          to: x.destination.iata_code,
          dep: x.departing_at,
          arr: x.arriving_at,
          flight: `${x.marketing_carrier.iata_code}${x.marketing_carrier_flight_number}`,
        })),
      };
    }),
  }));
}
