import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { money } from "../utils/helpers.js";

const PAYMENTS = [
  { key: "Cash on delivery", hint: "Pay in cash when your food arrives." },
  { key: "UPI", hint: "Enter your UPI ID. This is a demo, nothing is charged." },
  { key: "Card", hint: "Demo only. Use any 16 digits, for example 4111 1111 1111 1111." },
];

export default function Checkout() {
  const { currentUser, cartRestaurant, cartLines, totals, placeOrder, toast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: currentUser.name, phone: currentUser.phone || "", line: "", landmark: "", pincode: "", payment: "Cash on delivery", upi: "", card: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});
  const placed = useRef(false); // stops the empty-cart redirect firing right after an order is placed

  if (!cartLines.length && !placed.current) return <Navigate to="/cart" replace />;
  if (!cartRestaurant) return null;

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter the receiver's name.";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a 10-digit mobile number.";
    if (form.line.trim().length < 6) e.line = "Enter your flat, building and street.";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a 6-digit pincode.";
    if (form.payment === "UPI" && !/^[\w.-]+@[\w]+$/.test(form.upi)) e.upi = "Enter a valid UPI ID, like name@bank.";
    if (form.payment === "Card") {
      if (!/^\d{16}$/.test(form.card.replace(/\s/g, ""))) e.card = "Enter a 16-digit card number.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) e.expiry = "Use MM/YY.";
      if (!/^\d{3}$/.test(form.cvv)) e.cvv = "Enter 3 digits.";
    }
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { toast("Please fix the highlighted fields.", "warn"); return; }
    if (!cartRestaurant.open) { toast("This restaurant has just closed.", "warn"); return; }
    placed.current = true;
    const order = placeOrder({
      address: `${form.line.trim()}${form.landmark ? ", near " + form.landmark.trim() : ""} - ${form.pincode}`,
      phone: form.phone.replace(/\s/g, ""), payment: form.payment,
    });
    toast("Order placed. Your food is being prepared.");
    navigate(`/orders/${order.id}`, { replace: true });
  };

  const field = (k, label, props = {}) => (
    <label className={props.full ? "full" : ""}>{label}
      <input value={form[k]} onChange={change(k)} aria-invalid={!!errors[k]} {...props} full={undefined} />
      {errors[k] && <span className="error">{errors[k]}</span>}
    </label>
  );

  return (
    <div className="container page">
      <h1 className="page-title">Checkout</h1>
      <form className="two-pane" onSubmit={submit} noValidate>
        <div className="stack">
          <section className="card pad">
            <h2>Delivery address</h2>
            <div className="form-grid">
              {field("name", "Receiver name", { autoComplete: "name" })}
              {field("phone", "Mobile number", { autoComplete: "tel", inputMode: "numeric" })}
              {field("line", "Flat, building and street", { full: true, autoComplete: "street-address" })}
              {field("landmark", "Landmark (optional)")}
              {field("pincode", "Pincode", { inputMode: "numeric", maxLength: 6 })}
            </div>
          </section>
          <section className="card pad">
            <h2>Payment method</h2>
            <div className="pay-options">
              {PAYMENTS.map((p) => (
                <label key={p.key} className={`pay ${form.payment === p.key ? "on" : ""}`}>
                  <input type="radio" name="payment" checked={form.payment === p.key} onChange={() => setForm({ ...form, payment: p.key })} />
                  <span><strong>{p.key}</strong><small>{p.hint}</small></span>
                </label>
              ))}
            </div>
            {form.payment === "UPI" && <div className="form-grid">{field("upi", "UPI ID", { full: true, placeholder: "name@bank" })}</div>}
            {form.payment === "Card" && (
              <div className="form-grid">
                {field("card", "Card number", { full: true, inputMode: "numeric", placeholder: "4111 1111 1111 1111" })}
                {field("expiry", "Expiry (MM/YY)", { placeholder: "08/29" })}
                {field("cvv", "CVV", { inputMode: "numeric", maxLength: 3, type: "password" })}
              </div>
            )}
          </section>
        </div>

        <aside className="card pad summary">
          <h2>Order summary</h2>
          <p className="muted small">From {cartRestaurant.name}</p>
          <ul className="mini-lines">
            {cartLines.map((l) => <li key={l.id}><span>{l.qty} × {l.name}</span><span>{money(l.price * l.qty)}</span></li>)}
          </ul>
          <dl className="bill">
            <div><dt>Item total</dt><dd>{money(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div className="save"><dt>Coupon discount</dt><dd>− {money(totals.discount)}</dd></div>}
            <div><dt>Delivery fee</dt><dd>{totals.delivery === 0 ? "Free" : money(totals.delivery)}</dd></div>
            <div><dt>GST (5%)</dt><dd>{money(totals.tax)}</dd></div>
            <div className="grand"><dt>To pay</dt><dd>{money(totals.total)}</dd></div>
          </dl>
          <button className="btn btn-primary block" type="submit">Place order · {money(totals.total)}</button>
          <Link className="btn btn-ghost block" to="/cart">Back to cart</Link>
        </aside>
      </form>
    </div>
  );
}
