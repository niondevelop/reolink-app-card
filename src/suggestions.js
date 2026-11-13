/* Kartenvorschläge für „Zum Dashboard hinzufügen“ */
import { camConfig, detectCameras, findHubPrefix } from './entities.js';
import { STR, pickLang } from './i18n.js';

/* Vorschlag für „Zur Übersicht hinzufügen“: zu jeder Entität einer Reolink-Kamera (oder des Hubs) */
export function cardSuggestion(hass, entityId) {
  const cams = detectCameras(hass);
  if (!cams.length || !entityId) return null;
  const obj = entityId.split('.')[1] || '';
  const reg = hass.entities && hass.entities[entityId];
  const dev = reg && reg.device_id;
  const hit = cams.find((c) => (dev && c.device_id === dev) || obj === c.prefix || obj.startsWith(`${c.prefix}_`));
  const hub = findHubPrefix(hass);
  const hubDev = hub && hass.entities && Object.keys(hass.entities).some((id) => hass.entities[id].device_id === dev && (id.split('.')[1] || '').startsWith(`${hub}_`));
  const isHub = !hit && hub && (obj.startsWith(`${hub}_`) || hubDev);
  if (!hit && !isHub) return null;
  const t = STR[pickLang('auto', hass)];
  const conf = (list) => ({ type: 'custom:reolink-app-card', cameras: list.map(camConfig) });
  const out = [];
  if (hit) out.push({ label: `Reolink App Card – ${hit.name}`, config: conf([hit]) });
  if (cams.length > 1 || isHub) out.push({ label: `Reolink App Card – ${t.grid}`, config: conf(cams) });
  return out;
}
