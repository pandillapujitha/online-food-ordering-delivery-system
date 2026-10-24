import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { CUISINES } from "../data/sampleData.js";
import RestaurantCard from "../components/RestaurantCard.jsx";

export default function Restaurants() {
  const { restaurants } = useApp();
  const [params, setParams] = useSearchParams();

  const f = {
    q: params.get("q") || "",
    cuisine: params.get("cuisine") || "",
    veg: params.get("veg") === "1",
    rating: params.get("rating") || "",
    fast: params.get("fast") === "1",
    sort: params.get("sort") || "relevance",
  };

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === "" || value === false) next.delete(key);
    else next.set(key, value === true ? "1" : value);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    let list = restaurants.filter((r) => {
      if (q) {
        // search by restaurant name, cuisine or any dish on the menu
        const hay = `${r.name} ${r.cuisines.join(" ")} ${r.menu.map((m) => m.name).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (f.cuisine && !r.cuisines.includes(f.cuisine)) return false;
      if (f.veg && !r.pureVeg) return false;
      if (f.rating && r.rating < Number(f.rating)) return false;
      if (f.fast && r.deliveryTime > 30) return false;
      return true;
    });
    if (f.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (f.sort === "time") list = [...list].sort((a, b) => a.deliveryTime - b.deliveryTime);
    if (f.sort === "cost") list = [...list].sort((a, b) => a.priceForTwo - b.priceForTwo);
    return list;
  }, [restaurants, params]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container page">
      <h1 className="page-title">Restaurants</h1>
      <div className="filter-bar card">
        <label className="grow">Search
          <input value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Restaurant, cuisine or dish" />
        </label>
        <label>Cuisine
          <select value={f.cuisine} onChange={(e) => set("cuisine", e.target.value)}>
            <option value="">All cuisines</option>
            {CUISINES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Rating
          <select value={f.rating} onChange={(e) => set("rating", e.target.value)}>
            <option value="">Any</option><option value="4">4.0 and above</option><option value="4.5">4.5 and above</option>
          </select>
        </label>
        <label>Sort by
          <select value={f.sort} onChange={(e) => set("sort", e.target.value)}>
            <option value="relevance">Relevance</option><option value="rating">Rating</option>
            <option value="time">Delivery time</option><option value="cost">Cost: low to high</option>
          </select>
        </label>
        <div className="toggles">
          <label className="check"><input type="checkbox" checked={f.veg} onChange={(e) => set("veg", e.target.checked)} />Pure veg</label>
          <label className="check"><input type="checkbox" checked={f.fast} onChange={(e) => set("fast", e.target.checked)} />Under 30 min</label>
        </div>
      </div>

      <div className="results-bar">
        <p><strong>{results.length}</strong> {results.length === 1 ? "restaurant" : "restaurants"} found</p>
        <button className="link-btn" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
      </div>

      {results.length ? (
        <div className="grid">{results.map((r) => <RestaurantCard key={r.id} r={r} />)}</div>
      ) : (
        <div className="empty card">
          <h3>No restaurants match your search</h3>
          <p className="muted">Try a different dish or remove a filter.</p>
          <button className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
