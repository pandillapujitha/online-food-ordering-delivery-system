import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Navbar() {
  const { currentUser, logout, toast, cartCount } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout(); close(); toast("You have been logged out."); navigate("/");
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark" aria-hidden="true">B</span>Bitezy
        </Link>
        <div className="nav-right-mobile">
          <Link to="/cart" className="cart-link mobile-only" aria-label={`Cart, ${cartCount} items`}>🛒{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</Link>
          <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /><span /></button>
        </div>
        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/restaurants" onClick={close}>Restaurants</NavLink>
          {currentUser && <NavLink to="/orders" onClick={close}>My orders</NavLink>}
          {currentUser?.role === "admin" && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
          <span className="nav-spacer" />
          <Link to="/cart" className="cart-link desktop-only" onClick={close}>🛒 Cart{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</Link>
          {currentUser ? (
            <>
              <span className="nav-user">Hi, {currentUser.name.split(" ")[0]}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login" onClick={close}>Log in</Link>
              <Link className="btn btn-primary" to="/register" onClick={close}>Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
