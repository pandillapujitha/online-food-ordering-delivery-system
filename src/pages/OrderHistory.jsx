import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import useNow from "../utils/useNow.js";
import { STATUS_LABEL, getStatus, money, formatDate } from "../utils/helpers.js";

export default function OrderHistory() {
  const { orders, currentUser, reorder, toast } = useApp();
  const navigate = useNavigate();
  const now = useNow(2000);
  const mine = orders.filter((o) => o.userId === currentUser.id).sort((a, b) => b.createdAt - a.createdAt);

  const again = (o) => {
    const res = reorder(o);
    if (!res.ok) return toast(res.error, "warn");
    toast("Items added to your cart.");
    navigate("/cart");
  };

  return (
    <div className="container page">
      <h1 className="page-title">My orders</h1>
      {mine.length ? (
        <div className="order-list">
          {mine.map((o) => {
            const status = getStatus(o, now);
            const active = status !== "delivered" && status !== "cancelled";
            return (
              <article key={o.id} className="card pad order-card">
                <div className="order-head">
                  <div>
                    <h3>{o.restaurantName}</h3>
                    <p className="muted small">Order {o.id} · {formatDate(o.createdAt)}</p>
                  </div>
                  <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
                </div>
                <p className="order-items">{o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")}</p>
                <div className="order-foot">
                  <strong>{money(o.totals.total)}</strong>
                  <div className="btn-row">
                    <Link className={`btn ${active ? "btn-primary" : "btn-ghost"}`} to={`/orders/${o.id}`}>{active ? "Track order" : "View details"}</Link>
                    <button className="btn btn-ghost" onClick={() => again(o)}>Reorder</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty card">
          <div className="empty-emoji" aria-hidden="true">🧾</div>
          <h3>No orders yet</h3>
          <p className="muted">Your past orders will show up here.</p>
          <Link className="btn btn-primary" to="/restaurants">Order something</Link>
        </div>
      )}
    </div>
  );
}
