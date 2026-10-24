import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { COUPONS, money } from "../utils/helpers.js";
import VegMark from "../components/VegMark.jsx";

export default function Cart() {
  const { cart, cartRestaurant, cartLines, totals, changeQty, clearCart, applyCoupon, removeCoupon, currentUser, toast } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  if (!cartLines.length) {
    return (
      <div className="container page">
        <h1 className="page-title">Your cart</h1>
        <div className="empty card">
          <div className="empty-emoji" aria-hidden="true">🛒</div>
          <h3>Your cart is empty</h3>
          <p className="muted">Add something tasty from a restaurant to get started.</p>
          <Link className="btn btn-primary" to="/restaurants">Browse restaurants</Link>
        </div>
      </div>
    );
  }

  const apply = (e, preset) => {
    e?.preventDefault();
    const res = applyCoupon(preset || code);
    if (!res.ok) return setCouponMsg(res.error);
    setCouponMsg(""); setCode(""); toast("Coupon applied.");
  };

  const checkout = () => {
    if (totals.couponError) { toast("Fix the coupon before you continue.", "warn"); return; }
    if (!cartRestaurant.open) { toast("This restaurant has just closed.", "warn"); return; }
    navigate(currentUser ? "/checkout" : "/login", { state: { from: "/checkout" } });
  };

  return (
    <div className="container page">
      <h1 className="page-title">Your cart</h1>
      <div className="two-pane">
        <section className="card pad">
          <div className="section-head">
            <h2>From <Link to={`/restaurants/${cartRestaurant.id}`}>{cartRestaurant.name}</Link></h2>
            <button className="link-btn" onClick={() => { if (window.confirm("Remove all items from your cart?")) clearCart(); }}>Clear cart</button>
          </div>
          <ul className="cart-lines">
            {cartLines.map((l) => (
              <li key={l.id}>
                <div><VegMark veg={l.veg} /> <strong>{l.name}</strong><br /><span className="muted small">{money(l.price)} each</span></div>
                <div className="qty" role="group" aria-label={`Quantity of ${l.name}`}>
                  <button onClick={() => changeQty(l.id, -1)} aria-label="Remove one">−</button>
                  <span>{l.qty}</span>
                  <button onClick={() => changeQty(l.id, 1)} aria-label="Add one">+</button>
                </div>
                <strong className="line-total">{money(l.price * l.qty)}</strong>
              </li>
            ))}
          </ul>
        </section>

        <aside className="card pad summary">
          <h2>Bill details</h2>
          {cart.coupon ? (
            <div className="coupon-applied">
              <span><strong>{cart.coupon}</strong> · {COUPONS[cart.coupon]?.label}</span>
              <button className="link-btn" onClick={removeCoupon}>Remove</button>
            </div>
          ) : (
            <form className="coupon-form" onSubmit={apply}>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" />
              <button className="btn btn-ghost" type="submit">Apply</button>
            </form>
          )}
          {couponMsg && <p className="error">{couponMsg}</p>}
          {totals.couponError && <p className="error">{totals.couponError}</p>}
          {!cart.coupon && (
            <p className="chips-row small">Try: {Object.keys(COUPONS).map((c) => <button key={c} type="button" className="chip" onClick={() => apply(null, c)}>{c}</button>)}</p>
          )}
          <dl className="bill">
            <div><dt>Item total</dt><dd>{money(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div className="save"><dt>Coupon discount</dt><dd>− {money(totals.discount)}</dd></div>}
            <div><dt>Delivery fee</dt><dd>{totals.delivery === 0 ? "Free" : money(totals.delivery)}</dd></div>
            <div><dt>GST (5%)</dt><dd>{money(totals.tax)}</dd></div>
            <div className="grand"><dt>To pay</dt><dd>{money(totals.total)}</dd></div>
          </dl>
          <button className="btn btn-primary block" onClick={checkout}>{currentUser ? "Go to checkout" : "Log in to checkout"}</button>
        </aside>
      </div>
    </div>
  );
}
