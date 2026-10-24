import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { seedRestaurants, seedUsers, seedOrders } from "../data/sampleData.js";
import { calcTotals, uid, COUPONS } from "../utils/helpers.js";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// localStorage helpers (wrapped so the app still works in private browsing)
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

export function AppProvider({ children }) {
  const [restaurants, setRestaurants] = useState(() => load("bz_restaurants", seedRestaurants));
  const [users, setUsers] = useState(() => load("bz_users", seedUsers));
  const [orders, setOrders] = useState(() => load("bz_orders", seedOrders));
  const [cart, setCart] = useState(() => load("bz_cart", { restaurantId: null, lines: [], coupon: "" }));
  const [currentUser, setCurrentUser] = useState(() => load("bz_session", null));
  const [toasts, setToasts] = useState([]);

  useEffect(() => save("bz_restaurants", restaurants), [restaurants]);
  useEffect(() => save("bz_users", users), [users]);
  useEffect(() => save("bz_orders", orders), [orders]);
  useEffect(() => save("bz_cart", cart), [cart]);
  useEffect(() => save("bz_session", currentUser), [currentUser]);

  const toast = useCallback((message, kind = "ok") => {
    const id = uid("t");
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  // ---------- Auth ----------
  const login = (email, password) => {
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: "Email or password is incorrect." };
    const { password: _pw, ...safe } = user;
    setCurrentUser(safe);
    return { ok: true, user: safe };
  };
  const register = ({ name, email, phone, password }) => {
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
      return { ok: false, error: "An account with this email already exists." };
    const user = { id: uid("u"), name: name.trim(), email: email.trim(), phone: phone.trim(), password, role: "user" };
    setUsers((u) => [...u, user]);
    const { password: _pw, ...safe } = user;
    setCurrentUser(safe);
    return { ok: true, user: safe };
  };
  const logout = () => setCurrentUser(null);

  // ---------- Cart ----------
  const cartRestaurant = restaurants.find((r) => r.id === cart.restaurantId) || null;
  const cartLines = useMemo(
    () =>
      cart.lines
        .map((l) => {
          const item = cartRestaurant?.menu.find((m) => m.id === l.itemId);
          return item ? { ...item, qty: l.qty } : null;
        })
        .filter(Boolean),
    [cart.lines, cartRestaurant]
  );
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);
  const subtotal = cartLines.reduce((s, l) => s + l.price * l.qty, 0);
  const totals = calcTotals(subtotal, cartRestaurant, cart.coupon);

  // Returns "conflict" when the item belongs to a different restaurant than the current cart
  const addItem = (restaurantId, itemId) => {
    if (cart.restaurantId && cart.restaurantId !== restaurantId && cart.lines.length) return "conflict";
    setCart((c) => {
      const lines = c.restaurantId === restaurantId ? c.lines : [];
      const existing = lines.find((l) => l.itemId === itemId);
      return {
        ...c, restaurantId,
        lines: existing ? lines.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l)) : [...lines, { itemId, qty: 1 }],
      };
    });
    return "ok";
  };
  const replaceCartWith = (restaurantId, itemId) => setCart({ restaurantId, lines: [{ itemId, qty: 1 }], coupon: "" });
  const changeQty = (itemId, delta) =>
    setCart((c) => {
      const lines = c.lines.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0);
      return { ...c, lines, restaurantId: lines.length ? c.restaurantId : null, coupon: lines.length ? c.coupon : "" };
    });
  const clearCart = () => setCart({ restaurantId: null, lines: [], coupon: "" });
  const applyCoupon = (code) => {
    const c = code.trim().toUpperCase();
    if (!c) return { ok: false, error: "Enter a coupon code." };
    if (!COUPONS[c]) return { ok: false, error: "This coupon code is not valid." };
    setCart((x) => ({ ...x, coupon: c }));
    return { ok: true };
  };
  const removeCoupon = () => setCart((x) => ({ ...x, coupon: "" }));

  // ---------- Orders ----------
  const placeOrder = ({ address, phone, payment }) => {
    const drivers = ["Ravi Kumar", "Suresh B", "Kiran M", "Anil Reddy", "Mahesh P"];
    const order = {
      id: "FD" + Math.floor(100000 + Math.random() * 900000),
      userId: currentUser.id, restaurantId: cartRestaurant.id, restaurantName: cartRestaurant.name,
      items: cartLines.map((l) => ({ id: l.id, name: l.name, price: l.price, qty: l.qty, veg: l.veg })),
      address, phone, payment, coupon: totals.couponError ? "" : cart.coupon,
      totals: { subtotal: totals.subtotal, discount: totals.discount, delivery: totals.delivery, tax: totals.tax, total: totals.total },
      createdAt: Date.now(), manualStatus: null, driver: drivers[Math.floor(Math.random() * drivers.length)],
    };
    setOrders((o) => [order, ...o]);
    clearCart();
    return order;
  };
  const setOrderStatus = (id, status) => setOrders((list) => list.map((o) => (o.id === id ? { ...o, manualStatus: status } : o)));
  const reorder = (order) => {
    const r = restaurants.find((x) => x.id === order.restaurantId);
    if (!r) return { ok: false, error: "This restaurant is no longer available." };
    const lines = order.items
      .filter((i) => r.menu.some((m) => m.id === i.id && m.available))
      .map((i) => ({ itemId: i.id, qty: i.qty }));
    if (!lines.length) return { ok: false, error: "These items are not available right now." };
    setCart({ restaurantId: r.id, lines, coupon: "" });
    return { ok: true };
  };

  // ---------- Admin ----------
  const addRestaurant = (r) => setRestaurants((list) => [{ ...r, id: uid("r"), menu: [], open: true, rating: 4, reviews: 0 }, ...list]);
  const deleteRestaurant = (id) => setRestaurants((list) => list.filter((r) => r.id !== id));
  const toggleRestaurantOpen = (id) => setRestaurants((list) => list.map((r) => (r.id === id ? { ...r, open: !r.open } : r)));
  const addMenuItem = (rid, item) =>
    setRestaurants((list) => list.map((r) => (r.id === rid ? { ...r, menu: [...r.menu, { ...item, id: uid("m"), available: true }] } : r)));
  const deleteMenuItem = (rid, itemId) =>
    setRestaurants((list) => list.map((r) => (r.id === rid ? { ...r, menu: r.menu.filter((m) => m.id !== itemId) } : r)));
  const toggleItemAvailable = (rid, itemId) =>
    setRestaurants((list) => list.map((r) => (r.id === rid ? { ...r, menu: r.menu.map((m) => (m.id === itemId ? { ...m, available: !m.available } : m)) } : r)));
  const resetDemoData = () => {
    setRestaurants(seedRestaurants); setUsers(seedUsers); setOrders(seedOrders); clearCart(); setCurrentUser(null);
  };

  const value = {
    restaurants, users, orders, cart, cartRestaurant, cartLines, cartCount, totals, currentUser, toasts,
    login, register, logout,
    addItem, replaceCartWith, changeQty, clearCart, applyCoupon, removeCoupon,
    placeOrder, setOrderStatus, reorder,
    addRestaurant, deleteRestaurant, toggleRestaurantOpen, addMenuItem, deleteMenuItem, toggleItemAvailable, resetDemoData,
    toast,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
