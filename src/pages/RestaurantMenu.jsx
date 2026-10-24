import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { money } from "../utils/helpers.js";
import Cover from "../components/Cover.jsx";
import MenuItemCard from "../components/MenuItemCard.jsx";

export default function RestaurantMenu() {
  const { id } = useParams();
  const { restaurants, cart, cartCount, totals } = useApp();
  const restaurant = restaurants.find((r) => r.id === id);
  const [q, setQ] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => (restaurant ? ["All", ...new Set(restaurant.menu.map((m) => m.category))] : []), [restaurant]);

  if (!restaurant) {
    return (
      <div className="container page empty card">
        <h2>We could not find this restaurant</h2>
        <Link className="btn btn-primary" to="/restaurants">Back to restaurants</Link>
      </div>
    );
  }

  const items = restaurant.menu.filter((m) => {
    if (vegOnly && !m.veg) return false;
    if (category !== "All" && m.category !== category) return false;
    if (q.trim() && !`${m.name} ${m.description}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  });
  const shownCategories = category === "All" ? categories.slice(1) : [category];
  const inThisCart = cart.restaurantId === restaurant.id && cartCount > 0;

  return (
    <div className="container page">
      <p className="crumbs"><Link to="/restaurants">Restaurants</Link> / {restaurant.name}</p>
      <section className="rest-header card">
        <Cover className="rest-header-img" src={restaurant.image} emoji={restaurant.emoji} alt={restaurant.name} />
        <div className="rest-header-info">
          <h1>{restaurant.name}</h1>
          <p className="muted">{restaurant.cuisines.join(", ")} · {restaurant.address}</p>
          <ul className="info-row">
            <li><span className="rating">★ {restaurant.rating}</span> {restaurant.reviews.toLocaleString("en-IN")} ratings</li>
            <li>{restaurant.deliveryTime} min</li>
            <li>{money(restaurant.priceForTwo)} for two</li>
            <li>{restaurant.freeDeliveryAbove ? `Free delivery above ${money(restaurant.freeDeliveryAbove)}` : ""}</li>
          </ul>
          {!restaurant.open && <p className="notice">This restaurant is closed right now. You can browse the menu but cannot order.</p>}
        </div>
      </section>

      <div className="menu-tools">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search in ${restaurant.name}`} aria-label="Search the menu" />
        <label className="check"><input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />Veg only</label>
      </div>
      <div className="tabs" role="tablist">
        {categories.map((c) => (
          <button key={c} role="tab" aria-selected={category === c} className={category === c ? "on" : ""} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {items.length ? (
        shownCategories.map((cat) => {
          const list = items.filter((m) => m.category === cat);
          if (!list.length) return null;
          return (
            <section key={cat} className="menu-section">
              <h2>{cat} <span className="muted small">({list.length})</span></h2>
              <div className="menu-list">
                {list.map((m) => <MenuItemCard key={m.id} restaurant={restaurant} item={m} />)}
              </div>
            </section>
          );
        })
      ) : (
        <div className="empty card"><h3>No dishes match</h3><p className="muted">Try another category or clear the search.</p></div>
      )}

      {inThisCart && (
        <Link to="/cart" className="cart-bar">
          <span>{cartCount} {cartCount === 1 ? "item" : "items"} · {money(totals.subtotal)}</span>
          <strong>View cart</strong>
        </Link>
      )}
    </div>
  );
}
