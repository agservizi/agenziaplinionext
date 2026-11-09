const filterButtons = document.querySelectorAll('[data-filter]');
const occasionCards = document.querySelectorAll('[data-category]');
const quoteForm = document.getElementById('quoteform');
const quoteResult = document.getElementById('result');
let summary = '';

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    occasionCards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all'
        && card.dataset.category !== button.dataset.filter;
    });
  });
});

document.querySelectorAll('[data-choice]').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('occasion').value = link.dataset.choice;
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

quoteForm.addEventListener('submit', event => {
  event.preventDefault();
  const details = new FormData(quoteForm);
  const date = details.get('data');
  const formattedDate = date ? date.split('-').reverse().join('/') : 'Da definire';
  summary = `RIEPILOGO DIMOSTRATIVO — VELÀVIA\n\nNome: ${details.get('nome')}\nOccasione: ${details.get('occasione')}\nData indicativa: ${formattedDate}\nNumero di bomboniere: ${details.get('quantita') || 'Da definire'}\nBudget per pezzo: ${details.get('budget')}\nIdea: ${details.get('idea') || 'Da definire insieme'}\n\nVorrei conoscere le proposte, la disponibilità e i tempi per il mio evento.`;
  document.getElementById('summary').textContent = summary;
  quoteResult.hidden = false;
  quoteResult.scrollIntoView({
    block: 'nearest',
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  });
});

document.getElementById('copy').addEventListener('click', async () => {
  const status = document.getElementById('copystatus');
  try {
    await navigator.clipboard.writeText(summary);
    status.textContent = 'Riepilogo copiato.';
  } catch {
    status.textContent = 'Puoi selezionare il riepilogo qui sopra oppure scaricare la richiesta.';
  }
});

document.getElementById('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'velavia-riepilogo-demo.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

