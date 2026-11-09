const menu = document.querySelector('.menu-toggle');
const navigation = document.getElementById('mainnav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});

function fillExample() {
  const fields = document.getElementById('quoteform').elements;
  const exampleDate = new Date();
  exampleDate.setDate(exampleDate.getDate() + 180);
  fields.nome.value = 'Cliente demo';
  fields.occasione.value = 'Matrimonio';
  fields.data.value = `${exampleDate.getFullYear()}-${String(exampleDate.getMonth()+1).padStart(2,'0')}-${String(exampleDate.getDate()).padStart(2,'0')}`;
  fields.quantita.value = '60';
  fields.budget.value = '10–20 €';
  fields.idea.value = 'Toni avorio e champagne, confezione essenziale. Esempio dimostrativo.';
  document.getElementById('result').hidden = true;
  fields.nome.focus({ preventScroll: true });
  window.ScrollTrigger?.refresh();
}
document.getElementById('fill-demo').addEventListener('click', fillExample);
document.getElementById('print-summary').addEventListener('click', () => window.print());
document.getElementById('edit-summary').addEventListener('click', () => {
  document.getElementById('result').hidden = true;
  document.getElementById('quoteform').elements.nome.focus();
  window.ScrollTrigger?.refresh();
});
document.getElementById('quoteform').addEventListener('submit', () => {
  document.getElementById('result').focus({ preventScroll: true });
});
if (new URLSearchParams(location.search).get('esempio') === '1') fillExample();
