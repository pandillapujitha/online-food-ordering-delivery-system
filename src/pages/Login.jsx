import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Login() {
  const { login, toast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) return setError(res.error);
    toast(`Welcome back, ${res.user.name.split(" ")[0]}.`);
    navigate(location.state?.from || (res.user.role === "admin" ? "/admin" : "/restaurants"), { replace: true });
  };

  return (
    <div className="container auth">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Log in</h1>
        <label>Email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>Password
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary block" type="submit">Log in</button>
        <p className="muted small">New to Bitezy? <Link to="/register" state={location.state}>Create an account</Link></p>
        <div className="demo">
          <p className="small"><strong>Demo accounts</strong> (click to fill)</p>
          <button type="button" className="chip" onClick={() => { setEmail("user@bitezy.com"); setPassword("user123"); setError(""); }}>Customer</button>
          <button type="button" className="chip" onClick={() => { setEmail("admin@bitezy.com"); setPassword("admin123"); setError(""); }}>Admin</button>
        </div>
      </form>
    </div>
  );
}
