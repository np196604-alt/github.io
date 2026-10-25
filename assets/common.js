// Общие данные и функции для кабинетов. Демо: данные лежат в localStorage браузера.
const KEY = 'ingoarenda:v1';
const SEED = {
  contract: { addr: 'Москва, ул. Верхняя, 8 (м. Динамо)', rent: 55000, term: 12, start: [2026, 9], tenant: 'Алексей К.', landlord: 'Марина С.' },
  price: 660, active: true, autopay: true,
  payments: [{ d: '01.09.2026', a: 660 }, { d: '01.10.2026', a: 660 }],
  claims: []
};
function load() {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {}
  return structuredClone(SEED);
}
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function resetDemo() { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' ₽';
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
function nextDate(s) { // дата следующего платежа
  const [y, m] = s.contract.start, i = s.payments.length;
  const t = new Date(y, m - 1 + i, 1);
  return `01.${pad(t.getMonth() + 1)}.${t.getFullYear()}`;
}
function guarantee(s) { return s.contract.rent * 3; }
function show(id, text, cls) { const e = $(id); e.textContent = text; e.className = 'msg ' + (cls || ''); }
