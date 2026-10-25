// Кабинет собственника: накопления арендатора не показываем, только статус и объём защиты
const state = load();
function render() {
  const s = state, c = s.contract, pl = planInfo(s), last = s.payments[s.payments.length - 1];
  $('addr').textContent = c.addr;
  $('rent').textContent = fmt(c.rent);
  $('guar').textContent = s.active ? fmt(coverSum(s)) : '0 ₽';
  $('covM').textContent = s.active ? `до ${coverMonths(s).toFixed(1).replace('.', ',')} мес. аренды` : 'Защита не действует';
  $('tenant').textContent = c.tenant;
  $('term').textContent = `${c.term} мес., с ${pad(c.start[1])}.${c.start[0]}`;
  $('status').textContent = s.active ? 'Защита активна' : 'Защита не действует';
  $('status').className = 'badge' + (s.active ? '' : ' off');
  $('last').textContent = last ? `Последний платёж подписки: ${last.d}` : 'Платежей пока нет';
  $('plan').textContent = s.active ? `При страховом случае: ${fmt(pl.amount)} в месяц в течение ${pl.months} мес.` : '—';
  const ul = $('claims'); ul.replaceChildren();
  if (!s.claims.length) { const li = document.createElement('li'); li.textContent = 'Обращений пока нет.'; ul.append(li); }
  [...s.claims].reverse().forEach(cl => {
    const li = document.createElement('li'), a = document.createElement('span'), b = document.createElement('b');
    a.textContent = `${cl.d} · ${cl.k} · ${cl.text} · на рассмотрении`; b.textContent = fmt(cl.a); li.append(a, b); ul.append(li);
  });
  renderBills(s, $('bills'));
}
$('claimForm').onsubmit = e => {
  e.preventDefault();
  const a = Number($('amount').value), text = $('text').value.trim(), k = $('kind').value;
  if (!state.active) return show('msg', 'Защита не действует: подписка закрыта.', 'err');
  if (!(a > 0) || !text) return show('msg', 'Укажите сумму и опишите ситуацию.', 'err');
  if (a > coverSum(state)) return show('msg', `Сумма больше покрытия (${fmt(coverSum(state))}).`, 'err');
  state.claims.push({ d: today(), a, text, k }); save(state); render(); e.target.reset();
  show('msg', 'Обращение передано в Ингосстрах. Статус: на рассмотрении.', 'ok');
};
render(); initChat(state, 'landlord');
