// Кабинет арендатора
const state = load();
function render() {
  const s = state, c = s.contract;
  $('addr').textContent = c.addr;
  $('rent').textContent = `${fmt(c.rent)} в месяц, договор на ${c.term} мес.`;
  $('price').textContent = fmt(s.price);
  $('guar').textContent = fmt(guarantee(s));
  $('status').textContent = s.active ? 'Подписка активна' : 'Подписка завершена';
  $('status').className = 'badge' + (s.active ? '' : ' off');
  $('next').textContent = s.active ? nextDate(s) : '—';
  $('autopay').checked = s.autopay;
  $('autopay').disabled = !s.active;
  $('pay').disabled = !s.active;
  $('end').disabled = !s.active;
  const tb = $('hist'); tb.replaceChildren();
  [...s.payments].reverse().forEach(p => {
    const tr = document.createElement('tr');
    [p.d, fmt(p.a), 'Оплачено'].forEach(t => { const td = document.createElement('td'); td.textContent = t; tr.append(td); });
    tb.append(tr);
  });
}
$('pay').onclick = () => {
  const d = nextDate(state);
  state.payments.push({ d, a: state.price });
  save(state); render(); show('msg', `Платёж за ${d} принят. Собственник видит, что гарантия действует.`, 'ok');
};
$('autopay').onchange = e => { state.autopay = e.target.checked; save(state); show('msg', state.autopay ? 'Автоплатёж включён.' : 'Автоплатёж выключен. Платите вручную до 1 числа.', 'ok'); };
$('end').onclick = () => {
  if (!confirm('Завершить подписку? Гарантия для собственника перестанет действовать.')) return;
  state.active = false; state.autopay = false; save(state); render(); show('msg', 'Подписка завершена.', 'ok');
};
render();
