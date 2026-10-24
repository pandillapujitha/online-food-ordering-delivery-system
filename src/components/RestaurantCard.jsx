import { Link } from "react-router-dom";
import { money } from "../utils/helpers.js";
import Cover from "./Cover.jsx";

export default function RestaurantCard({ r }) {
  return (
    <Link to={`/restaurants/${r.id}`} className={`card rest-card ${r.open ? "" : "closed"}`}>
      <div className="rest-photo">
        <Cover src={r.image} emoji={r.emoji} alt={r.name} />
        {!r.open && <span className="closed-tag">Closed now</span>}
        {r.offer && r.open && <span className="offer-tag">{r.offer}</span>}
      </div>
      <div className="rest-body">
        <div className="rest-title">
          <h3>{r.name}</h3>
          <span className="rating" aria-label={`Rated ${r.rating} out of 5`}>★ {r.rating}</span>
        </div>
        <p className="muted">{r.cuisines.join(", ")}{r.pureVeg ? " · Pure veg" : ""}</p>
        <p className="meta">{r.deliveryTime} min · {money(r.priceForTwo)} for two</p>
      </div>
    </Link>
  );
}
