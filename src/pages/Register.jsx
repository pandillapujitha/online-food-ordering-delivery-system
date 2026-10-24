import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Register() {
  const { register, toast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (ev) => {
    ev.preventDefault();
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a 10-digit mobile number.";
    if (form.password.length < 6) e.password = "Use at least 6 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const res = register(form);
    if (!res.ok) return setErrors({ email: res.error });
    toast("Account created. You are logged in.");
    navigate(location.state?.from || "/restaurants", { replace: true });
  };

  const field = (k, label, type = "text", auto) => (
    <label>{label}
      <input type={type} autoComplete={auto} value={form[k]} onChange={change(k)} aria-invalid={!!errors[k]} />
      {errors[k] && <span className="error">{errors[k]}</span>}
    </label>
  );

  return (
    <div className="container auth">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        {field("name", "Full name", "text", "name")}
        {field("email", "Email", "email", "email")}
        {field("phone", "Mobile number", "tel", "tel")}
        {field("password", "Password", "password", "new-password")}
        {field("confirm", "Confirm password", "password", "new-password")}
        <button className="btn btn-primary block" type="submit">Sign up</button>
        <p className="muted small">Already registered? <Link to="/login" state={location.state}>Log in</Link></p>
      </form>
    </div>
  );
}
