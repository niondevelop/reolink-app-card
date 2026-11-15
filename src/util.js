/* Kleine Hilfsfunktionen */

/* Ereignisse, die als Interaktion mit der Seite zählen (Browser erlauben Ton erst danach) */
export const SND_EVENTS = ['pointerup', 'click', 'keydown'];

/* Element in verschachtelten Shadow-DOMs suchen (z. B. den Kamera-Stream in der picture-entity-Karte) */
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

/* Seitlich scrollende Zeile (Tage, Filter, Kamera-Reiter) auch mit der Maus bedienbar:
   mit gedrückter Taste ziehen, Mausrad scrollt seitlich, Verlauf am Rand zeigt weitere Einträge an.
   Ein Zug löst keinen Klick aus; ein normaler Klick funktioniert wie bisher. */
export function scrollable(el) {
  if (!el || el._scrollable) return;
  el._scrollable = true;
  const edges = () => {
    const max = el.scrollWidth - el.clientWidth;
    el.classList.toggle('more-l', el.scrollLeft > 2);
    el.classList.toggle('more-r', max > 2 && el.scrollLeft < max - 2);
  };
  let drag = null, moved = false;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth) return;
    drag = { x: e.clientX, left: el.scrollLeft, id: e.pointerId };
    moved = false;
  });
  el.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!moved && Math.abs(dx) < 6) return;
    if (!moved) { moved = true; el.classList.add('dragging'); try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignorieren */ } }
    el.scrollLeft = drag.left - dx;
  });
  const end = () => { if (!drag) return; drag = null; el.classList.remove('dragging'); };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  // Nach einem Zug den folgenden Klick verschlucken
  el.addEventListener('click', (e) => { if (moved) { moved = false; e.stopPropagation(); e.preventDefault(); } }, true);
  el.addEventListener('wheel', (e) => {
    if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const before = el.scrollLeft;
    el.scrollLeft += e.deltaY;
    if (el.scrollLeft !== before) e.preventDefault();
  }, { passive: false });
  el.addEventListener('scroll', edges, { passive: true });
  new MutationObserver(edges).observe(el, { childList: true });
  if (window.ResizeObserver) new ResizeObserver(edges).observe(el);
  edges();
}
