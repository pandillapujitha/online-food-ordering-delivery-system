import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import useNow from "../utils/useNow.js";
import { CUISINES } from "../data/sampleData.js";
import { STATUS_LABEL, getStatus, money, formatDate } from "../utils/helpers.js";

const blankRest = { name: "", cuisine: "North Indian", address: "", deliveryTime: 30, priceForTwo: 400, deliveryFee: 30, freeDeliveryAbove: 399, pureVeg: false, image: "", emoji: "🍽️" };
const blankItem = { name: "", price: "", category: "", veg: true, description: "", emoji: "🍽️" };

export default function Admin() {
  const { restaurants, orders, users, setOrderStatus, addRestaurant, deleteRestaurant, toggleRestaurantOpen, addMenuItem, deleteMenuItem, toggleItemAvailable, resetDemoData, toast } = useApp();
  const now = useNow(2000);
  const [tab, setTab] = useState("overview");
  const [rForm, setRForm] = useState(blankRest);
  const [rErr, setRErr] = useState({});
  const [menuRid, setMenuRid] = useState(restaurants[0]?.id || "");
  const [iForm, setIForm] = useState(blankItem);
  const [iErr, setIErr] = useState({});

  const withStatus = orders.map((o) => ({ ...o, status: getStatus(o, now) }));
  const revenue = withStatus.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totals.total, 0);
  const active = withStatus.filter((o) => ["placed", "preparing", "out_for_delivery"].includes(o.status)).length;
  const perRestaurant = restaurants
    .map((r) => ({ name: r.name, count: withStatus.filter((o) => o.restaurantId === r.id && o.status !== "cancelled").length }))
    .sort((a, b) => b.count - a.count).slice(0, 6);
  const maxCount = Math.max(1, ...perRestaurant.map((p) => p.count));
  const menuRest = restaurants.find((r) => r.id === menuRid);

  const submitRest = (e) => {
    e.preventDefault();
    const er = {};
    if (rForm.name.trim().length < 3) er.name = "Enter the restaurant name.";
    if (!rForm.address.trim()) er.address = "Enter the address.";
    setRErr(er);
    if (Object.keys(er).length) return;
    addRestaurant({
      name: rForm.name.trim(), cuisines: [rForm.cuisine], address: rForm.address.trim(), deliveryTime: Number(rForm.deliveryTime),
      priceForTwo: Number(rForm.priceForTwo), deliveryFee: Number(rForm.deliveryFee), freeDeliveryAbove: Number(rForm.freeDeliveryAbove),
      pureVeg: rForm.pureVeg, image: rForm.image.trim(), emoji: rForm.emoji || "🍽️", offer: "",
    });
    toast("Restaurant added. Add dishes in the Menu tab.");
    setRForm(blankRest);
  };

  const submitItem = (e) => {
    e.preventDefault();
    const er = {};
    if (iForm.name.trim().length < 2) er.name = "Enter the dish name.";
    if (!(Number(iForm.price) > 0)) er.price = "Enter a price above 0.";
    if (!iForm.category.trim()) er.category = "Enter a category, like Starters.";
    setIErr(er);
    if (Object.keys(er).length) return;
    addMenuItem(menuRid, { name: iForm.name.trim(), price: Number(iForm.price), category: iForm.category.trim(), veg: iForm.veg, description: iForm.description.trim() || "Freshly prepared.", emoji: iForm.emoji || "🍽️" });
    toast("Dish added.");
    setIForm(blankItem);
  };

  const tabs = [["overview", "Overview"], ["orders", "Orders"], ["restaurants", "Restaurants"], ["menu", "Menu"], ["users", "Customers"]];

  return (
    <div className="container page">
      <div className="section-head">
        <h1 className="page-title tight">Admin dashboard</h1>
        <button className="btn btn-ghost" onClick={() => { if (window.confirm("Reset restaurants, users and orders to the demo data?")) { resetDemoData(); toast("Demo data restored."); } }}>Reset demo data</button>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      {tab === "overview" && (
        <>
          <div className="stat-row">
            <div className="stat"><strong>{orders.length}</strong><span>Total orders</span></div>
            <div className="stat"><strong>{active}</strong><span>Orders in progress</span></div>
            <div className="stat"><strong>{money(revenue)}</strong><span>Revenue (excl. cancelled)</span></div>
            <div className="stat"><strong>{users.filter((u) => u.role === "user").length}</strong><span>Customers</span></div>
          </div>
          <div className="card pad">
            <h2>Orders by restaurant</h2>
            <ul className="bars">
              {perRestaurant.map((p) => (
                <li key={p.name}>
                  <span className="bar-label">{p.name}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ width: `${(p.count / maxCount) * 100}%` }} /></span>
                  <strong>{p.count}</strong>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {tab === "orders" && (
        orders.length ? (
          <div className="table-wrap card">
            <table>
              <thead><tr><th>Order</th><th>Customer</th><th>Restaurant</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {withStatus.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Order"><Link to={`/orders/${o.id}`}>{o.id}</Link><br /><span className="muted small">{formatDate(o.createdAt)}</span></td>
                    <td data-label="Customer">{users.find((u) => u.id === o.userId)?.name || "Unknown"}</td>
                    <td data-label="Restaurant">{o.restaurantName}</td>
                    <td data-label="Total">{money(o.totals.total)}</td>
                    <td data-label="Status">
                      <select value={o.status} onChange={(e) => { setOrderStatus(o.id, e.target.value); toast(`Order ${o.id} marked ${STATUS_LABEL[e.target.value].toLowerCase()}.`); }} aria-label={`Status of order ${o.id}`}>
                        {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty card"><h3>No orders yet</h3><p className="muted">Orders placed by customers appear here.</p></div>
      )}

      {tab === "restaurants" && (
        <>
          <div className="table-wrap card">
            <table>
              <thead><tr><th>Restaurant</th><th>Cuisine</th><th>Dishes</th><th>Open</th><th></th></tr></thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Restaurant"><Link to={`/restaurants/${r.id}`}>{r.name}</Link><br /><span className="muted small">{r.address}</span></td>
                    <td data-label="Cuisine">{r.cuisines.join(", ")}</td>
                    <td data-label="Dishes">{r.menu.length}</td>
                    <td data-label="Open"><label className="switch"><input type="checkbox" checked={r.open} onChange={() => toggleRestaurantOpen(r.id)} aria-label={`${r.name} open`} /><span /></label></td>
                    <td><button className="btn btn-danger small-btn" onClick={() => { if (window.confirm(`Delete ${r.name}?`)) { deleteRestaurant(r.id); toast("Restaurant deleted."); } }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form className="card pad form-grid mt" onSubmit={submitRest} noValidate>
            <h2 className="full">Add a restaurant</h2>
            <label className="full">Name<input value={rForm.name} onChange={(e) => setRForm({ ...rForm, name: e.target.value })} aria-invalid={!!rErr.name} />{rErr.name && <span className="error">{rErr.name}</span>}</label>
            <label>Cuisine<select value={rForm.cuisine} onChange={(e) => setRForm({ ...rForm, cuisine: e.target.value })}>{CUISINES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label>Address<input value={rForm.address} onChange={(e) => setRForm({ ...rForm, address: e.target.value })} aria-invalid={!!rErr.address} />{rErr.address && <span className="error">{rErr.address}</span>}</label>
            <label>Delivery time (min)<input type="number" min="10" value={rForm.deliveryTime} onChange={(e) => setRForm({ ...rForm, deliveryTime: e.target.value })} /></label>
            <label>Price for two (₹)<input type="number" min="50" value={rForm.priceForTwo} onChange={(e) => setRForm({ ...rForm, priceForTwo: e.target.value })} /></label>
            <label>Delivery fee (₹)<input type="number" min="0" value={rForm.deliveryFee} onChange={(e) => setRForm({ ...rForm, deliveryFee: e.target.value })} /></label>
            <label>Free delivery above (₹)<input type="number" min="0" value={rForm.freeDeliveryAbove} onChange={(e) => setRForm({ ...rForm, freeDeliveryAbove: e.target.value })} /></label>
            <label>Emoji icon<input value={rForm.emoji} onChange={(e) => setRForm({ ...rForm, emoji: e.target.value })} maxLength={4} /></label>
            <label>Photo URL (optional)<input value={rForm.image} onChange={(e) => setRForm({ ...rForm, image: e.target.value })} placeholder="https://..." /></label>
            <label className="check full"><input type="checkbox" checked={rForm.pureVeg} onChange={(e) => setRForm({ ...rForm, pureVeg: e.target.checked })} />Pure vegetarian restaurant</label>
            <div className="full"><button className="btn btn-primary" type="submit">Add restaurant</button></div>
          </form>
        </>
      )}

      {tab === "menu" && (
        restaurants.length ? (
          <>
            <label className="menu-pick">Restaurant
              <select value={menuRid} onChange={(e) => setMenuRid(e.target.value)}>{restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
            </label>
            {menuRest && (
              <>
                <div className="table-wrap card">
                  <table>
                    <thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Available</th><th></th></tr></thead>
                    <tbody>
                      {menuRest.menu.map((m) => (
                        <tr key={m.id}>
                          <td data-label="Dish">{m.emoji} {m.name}</td>
                          <td data-label="Category">{m.category}</td>
                          <td data-label="Price">{money(m.price)}</td>
                          <td data-label="Available"><label className="switch"><input type="checkbox" checked={m.available} onChange={() => toggleItemAvailable(menuRest.id, m.id)} aria-label={`${m.name} available`} /><span /></label></td>
                          <td><button className="btn btn-danger small-btn" onClick={() => { deleteMenuItem(menuRest.id, m.id); toast("Dish deleted."); }}>Delete</button></td>
                        </tr>
                      ))}
                      {!menuRest.menu.length && <tr><td colSpan="5" className="muted">No dishes yet. Add the first one below.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <form className="card pad form-grid mt" onSubmit={submitItem} noValidate>
                  <h2 className="full">Add a dish to {menuRest.name}</h2>
                  <label>Dish name<input value={iForm.name} onChange={(e) => setIForm({ ...iForm, name: e.target.value })} aria-invalid={!!iErr.name} />{iErr.name && <span className="error">{iErr.name}</span>}</label>
                  <label>Price (₹)<input type="number" min="0" value={iForm.price} onChange={(e) => setIForm({ ...iForm, price: e.target.value })} aria-invalid={!!iErr.price} />{iErr.price && <span className="error">{iErr.price}</span>}</label>
                  <label>Category<input value={iForm.category} onChange={(e) => setIForm({ ...iForm, category: e.target.value })} placeholder="Starters" list="cats" aria-invalid={!!iErr.category} /><datalist id="cats">{[...new Set(menuRest.menu.map((m) => m.category))].map((c) => <option key={c} value={c} />)}</datalist>{iErr.category && <span className="error">{iErr.category}</span>}</label>
                  <label>Emoji icon<input value={iForm.emoji} onChange={(e) => setIForm({ ...iForm, emoji: e.target.value })} maxLength={4} /></label>
                  <label className="full">Description<input value={iForm.description} onChange={(e) => setIForm({ ...iForm, description: e.target.value })} /></label>
                  <label className="check full"><input type="checkbox" checked={iForm.veg} onChange={(e) => setIForm({ ...iForm, veg: e.target.checked })} />Vegetarian</label>
                  <div className="full"><button className="btn btn-primary" type="submit">Add dish</button></div>
                </form>
              </>
            )}
          </>
        ) : <div className="empty card"><h3>No restaurants yet</h3><p className="muted">Add a restaurant first, then manage its menu here.</p></div>
      )}

      {tab === "users" && (
        <div className="table-wrap card">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Orders</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">{u.name}</td><td data-label="Email">{u.email}</td><td data-label="Mobile">{u.phone}</td>
                  <td data-label="Role"><span className="badge">{u.role}</span></td>
                  <td data-label="Orders">{orders.filter((o) => o.userId === u.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
