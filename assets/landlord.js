// Кабинет собственника
const state = load();
function render() {
  const s = state, c = s.contract, g = guarantee(s);
  $('addr').textContent = c.addr;
  $('rent').textContent = fmt(c.rent);
  $('guar').textContent = fmt(g);
  $('tenant').textContent = c.tenant;
  const last = s.payments[s.payments.length - 1];
  $('status').textContent = s.active ? 'Гарантия действует' : 'Гарантия не действует';
  $('status').className = 'badge' + (s.active ? '' : ' off');
  $('last').textContent = last ? `Последний платёж подписки: ${last.d}` : 'Платежей пока нет';
  const ul = $('claims'); ul.replaceChildren();
  if (!s.claims.length) { const li = document.createElement('li'); li.textContent = 'Заявок пока нет.'; ul.append(li); }
  [...s.claims].reverse().forEach(cl => {
    const li = document.createElement('li'), a = document.createElement('span'), b = document.createElement('span');
    a.textContent = `${cl.d} · ${cl.text}`; b.textContent = fmt(cl.a); b.style.fontWeight = '700';
    li.append(a, b); ul.append(li);
  });
}
$('claimForm').onsubmit = e => {
  e.preventDefault();
  const a = Number($('amount').value), text = $('text').value.trim();
  if (!state.active) return show('msg', 'Гарантия не действует: подписка арендатора завершена.', 'err');
  if (!(a > 0) || !text) return show('msg', 'Укажите сумму и опишите, что случилось.', 'err');
  if (a > guarantee(state)) return show('msg', `Сумма больше гарантии (${fmt(guarantee(state))}).`, 'err');
  const t = new Date();
  state.claims.push({ d: `${pad(t.getDate())}.${pad(t.getMonth() + 1)}.${t.getFullYear()}`, a, text });
  save(state); render(); e.target.reset(); show('msg', 'Заявка отправлена. Статус: на рассмотрении.', 'ok');
};
render();
