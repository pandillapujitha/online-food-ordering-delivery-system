export const money = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
export const uid = (p) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const formatDate = (t) =>
  new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

// ---------- Coupons ----------
export const COUPONS = {
  WELCOME50: { label: "50% off up to ₹100", min: 199, type: "percent", value: 50, max: 100 },
  SAVE20: { label: "20% off up to ₹80", min: 299, type: "percent", value: 20, max: 80 },
  FREEDEL: { label: "Free delivery", min: 249, type: "delivery" },
};

// ---------- Bill ----------
export function calcTotals(subtotal, restaurant, couponCode) {
  if (!restaurant || subtotal <= 0) return { subtotal: 0, discount: 0, delivery: 0, tax: 0, total: 0, couponError: "" };
  let delivery = subtotal >= restaurant.freeDeliveryAbove ? 0 : restaurant.deliveryFee;
  let discount = 0;
  let couponError = "";
  if (couponCode) {
    const c = COUPONS[couponCode];
    if (!c) couponError = "This coupon code is not valid.";
    else if (subtotal < c.min) couponError = `Add items worth ₹${c.min - subtotal} more to use ${couponCode}.`;
    else if (c.type === "percent") discount = Math.min(Math.round((subtotal * c.value) / 100), c.max);
    else if (c.type === "delivery") delivery = 0;
  }
  const tax = Math.round((subtotal - discount) * 0.05);
  return { subtotal, discount, delivery, tax, total: subtotal - discount + delivery + tax, couponError };
}

// ---------- Order status ----------
// Orders move through these stages automatically (demo speed, seconds after placing).
// An admin can override the status manually.
export const STAGES = [
  { key: "placed", label: "Order placed", at: 0, text: "The restaurant has received your order." },
  { key: "preparing", label: "Preparing your food", at: 15, text: "The chef is cooking your meal." },
  { key: "out_for_delivery", label: "Out for delivery", at: 45, text: "Your delivery partner is on the way." },
  { key: "delivered", label: "Delivered", at: 90, text: "Enjoy your meal!" },
];
export const STATUS_LABEL = {
  placed: "Order placed", preparing: "Preparing", out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled",
};
export function getStatus(order, now = Date.now()) {
  if (order.manualStatus) return order.manualStatus;
  const secs = (now - order.createdAt) / 1000;
  let current = "placed";
  STAGES.forEach((s) => { if (secs >= s.at) current = s.key; });
  return current;
}
