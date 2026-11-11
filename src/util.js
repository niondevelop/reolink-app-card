/* Kleine Hilfsfunktionen */

/* Element in verschachtelten Shadow-DOMs suchen (z. B. den Kamera-Stream in der picture-entity-Karte) */
export const SND_EVENTS = ['pointerup', 'click', 'keydown'];

export const deepFind = (root, sel) => {
  if (!root) return null;
  const hit = root.querySelector && root.querySelector(sel);
  if (hit) return hit;
  for (const el of (root.querySelectorAll ? root.querySelectorAll('*') : [])) {
    if (el.shadowRoot) { const r = deepFind(el.shadowRoot, sel); if (r) return r; }
  }
  return null;
};

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
