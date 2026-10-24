import { useState } from "react";

// Restaurant photo with an emoji fallback (used when offline or the image fails to load)
export default function Cover({ src, emoji, alt = "", className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`cover-fallback ${className}`} role="img" aria-label={alt}><span>{emoji || "🍽️"}</span></div>;
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
