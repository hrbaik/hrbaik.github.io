/* No network requests or storage: the complete HTML is the route database. */
'use strict';
(() => {
 const guide = document.querySelector('.travel-guide');
 if (!guide) return;
 const form = guide.querySelector('#travel-chooser');
 const origin = guide.querySelector('#travel-origin');
 const destination = guide.querySelector('#travel-destination');
 const departure = guide.querySelector('#travel-departure');
 const returns = [...guide.querySelectorAll('[data-return]')];
 const routes = [...guide.querySelectorAll('[data-origin]')];
 const cards = [...guide.querySelectorAll('[data-destination]')];
 const status = guide.querySelector('#travel-status');
 const allButton = guide.querySelector('#travel-all');
 const staticIndex = guide.querySelector('#travel-static-index');
 const originalLegs = new Map(routes.map(route => [route, route.querySelector('[data-last-leg]').textContent]));
 let showAll = false;
 function validValue(select, value) {
  return [...select.options].some(option => option.value === value);
 }
 function restoreSelection() {
  const query = new URLSearchParams(location.search);
  if (validValue(origin, query.get('from'))) origin.value = query.get('from');
  if (validValue(destination, query.get('to'))) destination.value = query.get('to');
  if (validValue(departure, query.get('depart'))) departure.value = query.get('depart');
  const anchor = location.hash.slice(1);
  if (validValue(origin, anchor)) origin.value = anchor;
  if (validValue(destination, anchor)) destination.value = anchor;
 }
 function render(updateURL = false) {
  const card = cards.find(item => item.dataset.destination === destination.value);
  const route = routes.find(item => item.dataset.origin === origin.value);
  for (const item of routes) {
   item.hidden = !showAll && item !== route;
   item.querySelector('[data-route-destination]').textContent = showAll ? 'your destination' : card.dataset.name;
   item.querySelector('[data-last-leg]').textContent = showAll ? originalLegs.get(item) :
    `From ${item.dataset.hub}, take a regular taxi to ${card.dataset.request}. Show the ${card.dataset.name} Korean card below; confirm the exact destination before leaving the taxi.`;
  }
  for (const item of cards) item.hidden = !showAll && item !== card;
  const returnGroup = departure.value.startsWith('icn-') ? 'icn' : departure.value;
  for (const item of returns) item.open = returnGroup === 'all' || item.dataset.return === returnGroup;
  staticIndex.hidden = !showAll;
  status.textContent = showAll ? 'All arrival routes and destination cards are shown. Read one arrival route, then your destination card.' :
   `${origin.selectedOptions[0].textContent} → ${card.dataset.name}. Departure: ${departure.selectedOptions[0].textContent}.`;
  allButton.textContent = showAll ? 'Return to my selected journey' : 'Show all routes & destinations';
  allButton.setAttribute('aria-pressed', String(showAll));
  // Keep query state in sync after anchor navigation as well as chooser changes.
  // Otherwise a later ordinary hash/popstate restores the old destination.
  {
   const url = new URL(location.href);
   url.searchParams.set('from', origin.value);
   url.searchParams.set('to', destination.value);
   url.searchParams.set('depart', departure.value);
   // Remove a stale route anchor without moving focus or the viewport.
   if (updateURL && (validValue(origin, url.hash.slice(1)) || validValue(destination, url.hash.slice(1)))) url.hash = 'start';
   try { history.replaceState(null, '', url); } catch { /* file:// still works */ }
  }
 }
 form.addEventListener('submit', event => event.preventDefault());
 for (const select of [origin, destination]) select.addEventListener('change', () => { showAll = false; render(true); });
 departure.addEventListener('change', () => render(true));
 allButton.addEventListener('click', () => { showAll = !showAll; render(); });
 window.addEventListener('hashchange', () => { showAll = false; restoreSelection(); render(); });
 window.addEventListener('popstate', () => { showAll = false; restoreSelection(); render(); });
 const copyStatus = guide.querySelector('#travel-copy-status');
 for (const button of guide.querySelectorAll('[data-travel-copy]')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
   const target = document.getElementById(button.dataset.travelCopy);
   const previous = button.textContent;
   try {
    await navigator.clipboard.writeText(target.textContent.trim());
    button.textContent = 'Copied Korean text';
    copyStatus.textContent = 'Copied. Show the Korean message to your driver.';
   } catch {
    const range = document.createRange(); range.selectNodeContents(target);
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
    button.textContent = 'Text selected — copy manually';
    copyStatus.textContent = 'Automatic copy is unavailable. The Korean text is selected: use Copy, or show the card on your screen.';
   }
   setTimeout(() => { button.textContent = previous; }, 4000);
  });
 }
 // Detailed printing includes alternatives and all return airports. The short
 // mode temporarily isolates the chosen arrival/card, even from the all-routes view.
 let printState = null;
 window.addEventListener('beforeprint', () => {
  if (printState) return;
  printState = {all: showAll, details: [...guide.querySelectorAll('details')].map(item => [item, item.open])};
  if (guide.querySelector('#travel-print-mode').value === 'short') {
   guide.classList.add('travel-print-short');
   showAll = false; render();
  }
  printState.details.forEach(([item]) => { item.open = true; });
 });
 window.addEventListener('afterprint', () => {
  if (!printState) return;
  guide.classList.remove('travel-print-short');
  showAll = printState.all; render();
  printState.details.forEach(([item, open]) => { item.open = open; });
  printState = null;
 });
 guide.querySelector('#travel-print').addEventListener('click', () => window.print());
 restoreSelection(); render(); form.hidden = false;
})();
