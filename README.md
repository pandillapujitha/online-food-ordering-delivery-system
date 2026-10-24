# Bitezy – Online Food Ordering and Delivery System

A beginner-friendly college project built with **React 18, React Router 6, Hooks, Context API, HTML, CSS and JavaScript** (bundled with Vite).
It uses realistic sample data stored in the browser (`localStorage`), so you do not need a backend or database.

## 1. Run it on your computer

Install Node.js 18 or newer from https://nodejs.org, then in this folder:

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

## 2. Demo logins

| Role     | Email             | Password |
|----------|-------------------|----------|
| Customer | user@bitezy.com   | user123  |
| Admin    | admin@bitezy.com  | admin123 |

Coupon codes to try in the cart: `WELCOME50`, `SAVE20`, `FREEDEL`.

## 3. Pages and features

| Page | Route | What it does |
|------|-------|--------------|
| Home | `/` | Hero search, cuisine shortcuts, top restaurants, offers |
| Restaurants | `/restaurants` | Search (restaurant, cuisine or dish), filter by cuisine, rating, pure veg, delivery time, sort |
| Food menu | `/restaurants/:id` | Menu by category, veg filter, in-menu search, add/remove with quantity |
| Cart | `/cart` | Change quantities, coupons, bill with delivery fee and GST |
| Checkout | `/checkout` | Address and payment form with validation (Cash, UPI, Card are demo only) |
| Login / Register | `/login`, `/register` | Validated forms, session saved in the browser |
| Order tracking | `/orders/:id` | Live stage timeline, delivery partner, cancel while preparing |
| Order history | `/orders` | Past orders, track, reorder |
| Admin dashboard | `/admin` | Stats, update order status, add/delete restaurants, manage menus, view customers |

Order tracking runs in **demo speed**: an order moves from placed to preparing after 15 seconds, out for delivery after 45 seconds and delivered after 90 seconds. An admin can also set the status by hand.

## 4. Folder structure

```
src/
  main.jsx             starts the app (HashRouter + context provider)
  App.jsx              list of routes
  styles.css           all styling (colors and fonts are CSS variables at the top)
  context/AppContext   global state: restaurants, cart, orders, users, login + localStorage
  data/sampleData.js   8 restaurants with menus, demo users and past orders
  utils/helpers.js     money format, coupons, bill calculation, order stages
  utils/useNow.js      small hook that refreshes the screen every second
  components/          Navbar, Footer, RestaurantCard, MenuItemCard, Cover, VegMark, Toasts, ProtectedRoute
  pages/               Home, Restaurants, RestaurantMenu, Cart, Checkout, Login, Register,
                       OrderTracking, OrderHistory, Admin
```

## 5. Deploy it (free)

First create the production build:

```bash
npm run build
```

This makes a `dist` folder. The app uses `HashRouter` and a relative base path, so it works on any static host without extra settings.

- **Netlify**: drag and drop the `dist` folder at https://app.netlify.com/drop
- **Vercel**: push the project to GitHub, import it on vercel.com. Framework: Vite. Build command `npm run build`, output `dist`.
- **GitHub Pages**: push the contents of `dist` to a branch named `gh-pages` (or use the `gh-pages` npm package) and enable Pages for that branch.

## 6. Notes for your report or viva

- Data is saved in `localStorage`, so each browser has its own copy. Use **Reset demo data** in the admin dashboard to restore it.
- Passwords are stored as plain text because this is a demo. A real system needs a backend and hashed passwords.
- Payments are simulated and no real money moves. Never enter real card details.
- Restaurant photos load from Unsplash. Offline, a coloured emoji tile is shown instead.
- Future improvements: Node/Express and MongoDB backend, real payment gateway, live map tracking, restaurant owner login.
