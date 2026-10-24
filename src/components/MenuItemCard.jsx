import { useApp } from "../context/AppContext.jsx";
import { money } from "../utils/helpers.js";
import VegMark from "./VegMark.jsx";

const hue = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

export default function MenuItemCard({ restaurant, item }) {
  const { cart, addItem, replaceCartWith, changeQty, toast } = useApp();
  const qty = cart.restaurantId === restaurant.id ? cart.lines.find((l) => l.itemId === item.id)?.qty || 0 : 0;
  const canOrder = restaurant.open && item.available;

  const add = () => {
    const res = addItem(restaurant.id, item.id);
    if (res === "conflict") {
      if (window.confirm("Your cart has items from another restaurant. Clear it and add this item?")) {
        replaceCartWith(restaurant.id, item.id);
        toast(`${item.name} added.`);
      }
    }
  };

  return (
    <article className={`menu-item ${item.available ? "" : "soldout"}`}>
      <div className="menu-info">
        <VegMark veg={item.veg} />
        <h4>{item.name}</h4>
        <p className="price">{money(item.price)}</p>
        <p className="muted small">{item.description}</p>
      </div>
      <div className="menu-side">
        <div className="dish-tile" style={{ background: `hsl(${hue(item.name)} 70% 92%)` }} aria-hidden="true">{item.emoji}</div>
        {!item.available ? (
          <span className="soldout-tag">Sold out</span>
        ) : qty === 0 ? (
          <button className="btn btn-add" disabled={!canOrder} onClick={add}>{restaurant.open ? "Add" : "Closed"}</button>
        ) : (
          <div className="qty" role="group" aria-label={`Quantity of ${item.name}`}>
            <button onClick={() => changeQty(item.id, -1)} aria-label="Remove one">−</button>
            <span aria-live="polite">{qty}</span>
            <button onClick={() => changeQty(item.id, 1)} aria-label="Add one">+</button>
          </div>
        )}
      </div>
    </article>
  );
}
