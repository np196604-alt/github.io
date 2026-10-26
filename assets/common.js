// Общие данные и функции кабинетов. Демо: данные лежат в localStorage браузера.
const KEY = 'ingoarenda:v3';
const PROT = 13000 / 60000; // допущение из презентации: цена защиты, доля от аренды
const PAYOUT = 2;           // выплата сверх резерва: до двух аренд
const SEED = {
  contract: { addr: 'Москва, ул. Верхняя, 8 (м. Динамо)', rent: 60000, deposit: 60000, term: 11, start: [2026, 9], tenant: 'Алексей К.', landlord: 'Марина С.' },
  monthly: 6000, plan: 'full', active: true, autopay: true,
  payments: [{ d: '01.10.2026', m: 6000 }], // платежи после первого взноса
  claims: [],
  bills: [{ d: '20.10.2026', t: 'Электричество, октябрь', a: 1850, f: 'chek_oktyabr.pdf' }],
  chat: [
    { r: 'landlord', d: '20.10.2026', t: 'Добрый день! Пришлите, пожалуйста, чек за электричество.' },
    { r: 'tenant', d: '20.10.2026', t: 'Добавил в разделе коммунальных платежей.' }
  ]
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
const today = () => { const t = new Date(); return `${pad(t.getDate())}.${pad(t.getMonth() + 1)}.${t.getFullYear()}`; };
function show(id, text, cls) { const e = $(id); e.textContent = text; e.className = 'msg ' + (cls || ''); }
function nextDate(s) { // первый взнос в месяце start, дальше по одному платежу в месяц
  const [y, m] = s.contract.start, t = new Date(y, m - 1 + s.payments.length + 1, 1);
  return `01.${pad(t.getMonth() + 1)}.${t.getFullYear()}`;
}
const sumM = s => s.payments.reduce((a, p) => a + p.m, 0);
const protection = c => Math.round(c.rent * PROT);                     // цена защиты, разово (без округления до тысяч, как в A3)
const reserve = s => s.contract.deposit - protection(s.contract) + sumM(s); // личный резерв
const paidTotal = s => s.contract.deposit + sumM(s);
const coverSum = s => PAYOUT * s.contract.rent;                       // выплата сверх резерва, ориентировочно
const monthsDone = s => s.payments.length + 1;
const feeRate = (done, term) => done >= term ? 0.05 : done <= 3 ? 0.60 : done <= 6 ? 0.40 : 0.20; // шкала удержания (слайд 33): 1–3 мес. 60%, 4–6 — 40%, 7+ — 20%, полный срок 5%
const forecast = s => (reserve(s) + s.monthly * Math.max(0, s.contract.term - monthsDone(s))) * (1 - feeRate(s.contract.term, s.contract.term));
const earlyReturn = s => reserve(s) * (1 - feeRate(monthsDone(s), s.contract.term));
function planInfo(s) { // полная компенсация: 2 мес. по 100%, частичная: 4 мес. по 50%
  const r = s.contract.rent;
  return s.plan === 'full' ? { months: 2, amount: r } : { months: 4, amount: r / 2 };
}
function renderChat(s, role) {
  const ul = $('chat'); ul.replaceChildren();
  s.chat.forEach(m => {
    const li = document.createElement('li'), sm = document.createElement('small');
    if (m.r === role) li.className = 'me';
    sm.textContent = `${m.r === 'tenant' ? s.contract.tenant : s.contract.landlord} · ${m.d}`;
    li.append(sm, document.createTextNode(m.t)); ul.append(li);
  });
  ul.scrollTop = ul.scrollHeight;
}
function initChat(s, role) {
  renderChat(s, role);
  $('chatForm').onsubmit = e => {
    e.preventDefault(); const t = $('chatT').value.trim(); if (!t) return;
    s.chat.push({ r: role, d: today(), t }); save(s); renderChat(s, role); $('chatT').value = '';
  };
}
function renderBills(s, ul) {
  ul.replaceChildren();
  if (!s.bills.length) { const li = document.createElement('li'); li.textContent = 'Чеков пока нет.'; ul.append(li); }
  [...s.bills].reverse().forEach(b => {
    const li = document.createElement('li'), a = document.createElement('span'), c = document.createElement('b');
    a.textContent = `${b.d} · ${b.t}${b.f ? ' · ' + b.f : ''}`; c.textContent = fmt(b.a); li.append(a, c); ul.append(li);
  });
}
