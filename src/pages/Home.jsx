import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { CUISINES } from "../data/sampleData.js";
import { COUPONS } from "../utils/helpers.js";
import RestaurantCard from "../components/RestaurantCard.jsx";

const CUISINE_EMOJI = { Biryani: "🍛", "South Indian": "🥞", "North Indian": "🫓", Pizza: "🍕", Chinese: "🥡", Burgers: "🍔", Healthy: "🥗", Desserts: "🍰" };

export default function Home() {
  const { restaurants } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const top = [...restaurants].filter((r) => r.open).sort((a, b) => b.rating - a.rating).slice(0, 6);

  const search = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/restaurants?q=${encodeURIComponent(q.trim())}` : "/restaurants");
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Hungry? Your meal is 30 minutes away.</h1>
            <p className="lead">Order from {restaurants.length} local kitchens, pay your way and watch your delivery move from the stove to your door.</p>
            <form className="hero-search" onSubmit={search}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a dish or restaurant, e.g. biryani" aria-label="Search dishes or restaurants" />
              <button className="btn btn-primary" type="submit">Find food</button>
            </form>
          </div>
          <div className="hero-plate" aria-hidden="true">
            <div className="plate">🍛</div>
            <span className="float f1">🥗</span>
            <span className="float f2">🍕</span>
            <span className="float f3">🍰</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>What are you craving?</h2>
          <div className="cuisine-row">
            {CUISINES.map((c) => (
              <Link key={c} to={`/restaurants?cuisine=${encodeURIComponent(c)}`} className="cuisine">
                <span className="cuisine-icon">{CUISINE_EMOJI[c]}</span>{c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt0">
        <div className="container">
          <div className="section-head">
            <h2>Top rated near you</h2>
            <Link to="/restaurants" className="link">See all restaurants</Link>
          </div>
          <div className="grid">{top.map((r) => <RestaurantCard key={r.id} r={r} />)}</div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>Offers you can use today</h2>
          <div className="offers">
            {Object.entries(COUPONS).map(([code, c]) => (
              <div key={code} className="offer">
                <strong>{code}</strong>
                <span>{c.label}</span>
                <small>On orders above ₹{c.min}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>How ordering works</h2>
          <ol className="steps">
            <li><h3>Pick a restaurant</h3><p>Search or filter by cuisine, rating and delivery time.</p></li>
            <li><h3>Fill your cart</h3><p>Add dishes, apply a coupon and see the full bill before you pay.</p></li>
            <li><h3>Track your food</h3><p>Follow every stage, from preparing to delivered, on the tracking page.</p></li>
          </ol>
        </div>
      </section>
    </>
  );
}
