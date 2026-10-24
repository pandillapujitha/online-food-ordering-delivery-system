import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import useNow from "../utils/useNow.js";
import { STAGES, STATUS_LABEL, getStatus, money, formatDate } from "../utils/helpers.js";

export default function OrderTracking() {
  const { id } = useParams();
  const { orders, currentUser, setOrderStatus, toast } = useApp();
  const navigate = useNavigate();
  const now = useNow(1000);
  const order = orders.find((o) => o.id === id);

  if (!order || (order.userId !== currentUser.id && currentUser.role !== "admin")) {
    return (
      <div className="container page empty card">
        <h2>We could not find this order</h2>
        <Link className="btn btn-primary" to="/orders">Go to my orders</Link>
      </div>
    );
  }

  const status = getStatus(order, now);
  const cancelled = status === "cancelled";
  const currentIndex = STAGES.findIndex((s) => s.key === status);
  const canCancel = status === "placed" || status === "preparing";
  const secs = Math.floor((now - order.createdAt) / 1000);
  const etaLeft = Math.max(0, 90 - secs);

  const cancel = () => {
    if (window.confirm("Cancel this order?")) { setOrderStatus(order.id, "cancelled"); toast("Order cancelled."); }
  };

  return (
    <div className="container page">
      <p className="crumbs"><Link to="/orders">My orders</Link> / {order.id}</p>
      <div className="two-pane">
        <section className="card pad">
          <div className="section-head">
            <h1 className="page-title tight">{cancelled ? "Order cancelled" : status === "delivered" ? "Order delivered" : "Tracking your order"}</h1>
            <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
          </div>
          <p className="muted">Order {order.id} from {order.restaurantName} · {formatDate(order.createdAt)}</p>

          {cancelled ? (
            <div className="notice">This order was cancelled. No amount is charged for cancelled orders.</div>
          ) : (
            <>
              {status !== "delivered" && (
                <div className="eta">
                  <strong>{order.manualStatus ? "Updated by the restaurant" : `Arriving in about ${Math.max(1, Math.ceil(etaLeft / 10))} min`}</strong>
                  <small>Demo mode: stages advance every few seconds so you can see the full flow.</small>
                </div>
              )}
              <ol className="timeline">
                {STAGES.map((s, i) => (
                  <li key={s.key} className={i < currentIndex ? "done" : i === currentIndex ? "current" : ""}>
                    <span className="dot" aria-hidden="true">{i < currentIndex || status === "delivered" ? "✓" : i + 1}</span>
                    <div><strong>{s.label}</strong><p className="muted small">{s.text}</p></div>
                  </li>
                ))}
              </ol>
              {(status === "out_for_delivery" || status === "delivered") && (
                <div className="driver card pad">
                  <span className="driver-avatar" aria-hidden="true">🛵</span>
                  <div><strong>{order.driver}</strong><p className="muted small">Your delivery partner</p></div>
                </div>
              )}
            </>
          )}
          <div className="btn-row">
            {canCancel && <button className="btn btn-danger" onClick={cancel}>Cancel order</button>}
            <button className="btn btn-ghost" onClick={() => navigate("/orders")}>All orders</button>
          </div>
        </section>

        <aside className="card pad summary">
          <h2>Order details</h2>
          <ul className="mini-lines">
            {order.items.map((i) => <li key={i.id}><span>{i.qty} × {i.name}</span><span>{money(i.price * i.qty)}</span></li>)}
          </ul>
          <dl className="bill">
            <div><dt>Item total</dt><dd>{money(order.totals.subtotal)}</dd></div>
            {order.totals.discount > 0 && <div className="save"><dt>Discount ({order.coupon})</dt><dd>− {money(order.totals.discount)}</dd></div>}
            <div><dt>Delivery fee</dt><dd>{order.totals.delivery === 0 ? "Free" : money(order.totals.delivery)}</dd></div>
            <div><dt>GST (5%)</dt><dd>{money(order.totals.tax)}</dd></div>
            <div className="grand"><dt>Total</dt><dd>{money(order.totals.total)}</dd></div>
          </dl>
          <h3>Delivering to</h3>
          <p className="small">{order.address}<br />Mobile: {order.phone}</p>
          <p className="small muted">Payment: {order.payment}</p>
        </aside>
      </div>
    </div>
  );
}
