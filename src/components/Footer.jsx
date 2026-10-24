import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="brand"><span className="brand-mark" aria-hidden="true">B</span>Bitezy</div>
          <p className="muted">Hot food from local kitchens, tracked to your door.</p>
        </div>
        <div className="footer-links">
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/orders">My orders</Link>
          <Link to="/login">Log in</Link>
        </div>
        <p className="muted small">© {new Date().getFullYear()} Bitezy. College project with sample data. No real orders or payments are processed.</p>
      </div>
    </footer>
  );
}
