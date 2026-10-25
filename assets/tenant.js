// Кабинет арендатора
const state = load();
function render() {
  const s = state, c = s.contract, pl = planInfo(s);
  $('addr').textContent = c.addr;
  $('rentline').textContent = `Аренда ${fmt(c.rent)} в месяц, договор на ${c.term} мес.`;
  $('saved').textContent = fmt(savings(s));
  $('paid').textContent = fmt(paidTotal(s));
  $('price').textContent = fmt(s.monthly);
  $('next').textContent = s.active ? nextDate(s) : '—';
  $('cover').textContent = `до ${coverMonths(s).toFixed(1).replace('.', ',')} мес. (${fmt(coverSum(s))})`;
  $('status').textContent = s.active ? 'Подписка активна' : 'Подписка завершена';
  $('status').className = 'badge' + (s.active ? '' : ' off');
  $('mon').value = s.monthly; $('monV').textContent = fmt(s.monthly);
  $('planFull').checked = s.plan === 'full'; $('planPart').checked = s.plan === 'part';
  $('planOut').textContent = `Выплата собственнику ${fmt(pl.amount)} в месяц в течение ${pl.months} мес.`;
  $('forecast').textContent = fmt(forecast(s));
  $('early').textContent = fmt(earlyReturn(s));
  ['pay', 'autopay', 'end', 'mon'].forEach(i => $(i).disabled = !s.active);
  $('autopay').checked = s.autopay;
  const tb = $('hist'); tb.replaceChildren();
  s.payments.map((p, i) => ({ d: p.d, a: p.m + (i === 0 ? c.deposit : 0), n: i === 0 ? 'Залог и первый платёж' : 'Ежемесячный платёж' })).reverse().forEach(p => {
    const tr = document.createElement('tr');
    [p.d, p.n, fmt(p.a)].forEach(t => { const td = document.createElement('td'); td.textContent = t; tr.append(td); });
    tb.append(tr);
  });
  renderBills(s, $('bills'));
}
$('mon').oninput = e => { state.monthly = +e.target.value; save(state); render(); };
document.querySelectorAll('[name=plan]').forEach(r => r.onchange = e => { state.plan = e.target.value; save(state); render(); });
$('pay').onclick = () => { const d = nextDate(state); state.payments.push({ d, m: state.monthly }); save(state); render(); show('msg', `Платёж за ${d} принят.`, 'ok'); };
$('autopay').onchange = e => { state.autopay = e.target.checked; save(state); show('msg', state.autopay ? 'Автоплатёж включён.' : 'Автоплатёж выключен.', 'ok'); };
$('end').onclick = () => {
  if (!confirm(`Закрыть договор досрочно? К возврату: ${fmt(earlyReturn(state))} с удержанием по условиям договора.`)) return;
  state.active = false; state.autopay = false; save(state); render(); show('msg', 'Подписка закрыта досрочно, возврат рассчитан по условиям договора.', 'ok');
};
$('billForm').onsubmit = e => {
  e.preventDefault(); const t = $('billT').value.trim(), a = Number($('billA').value);
  if (!t || !(a > 0)) return show('msg2', 'Укажите услугу и сумму.', 'err');
  const f = $('billF').files[0];
  state.bills.push({ d: today(), t, a, f: f ? f.name : '' }); save(state); render(); e.target.reset(); show('msg2', 'Чек добавлен, собственник его видит.', 'ok');
};
$('issueForm').onsubmit = e => {
  e.preventDefault(); const t = $('issueT').value.trim();
  if (!t) return show('msg3', 'Опишите поломку.', 'err');
  const f = $('issueF').files[0];
  state.chat.push({ r: 'tenant', d: today(), t: `Поломка: ${t}${f ? ' (фото: ' + f.name + ')' : ''}` });
  save(state); renderChat(state, 'tenant'); e.target.reset(); show('msg3', 'Заявка отправлена в общий чат.', 'ok');
};
render(); initChat(state, 'tenant');
