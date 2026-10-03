/*
 * Design preview switcher (preview builds only — see variants.css).
 *
 * A dropdown at the foot of every page. The choice is applied before first
 * paint by a tiny inline script in <head> (from ?design= or the last
 * choice); this file draws the dropdown, remembers changes, keeps the
 * address in step, and swaps in the white logo on designs with a dark
 * brand row.
 */
const GROUPS = [
  ['Chosen', [['field', 'Field — navy and orange (current)']]],
  ['More colourful', [
    ['lagoon', 'Lagoon — teal and coral'],
    ['saffron', 'Saffron — navy and marigold'],
    ['ocean', 'Ocean — blue to aqua gradient'],
    ['sunrise', 'Sunrise — violet to amber'],
    ['indigo', 'Indigo & marigold — lattice'],
  ]],
  ['More elegant', [
    ['eucalyptus', 'Eucalyptus — sage and clay'],
    ['plum', 'Plum & gold'],
    ['ivory', 'Ivory & ink — serif'],
    ['terracotta', 'Terracotta & sand'],
    ['midnight', 'Midnight & aqua'],
  ]],
];
const ALL = GROUPS.flatMap(([, list]) => list);
const DARK_HEADER = new Set(['midnight', 'indigo']);
const root = document.documentElement;

const remember = (value) => {
  try { localStorage.setItem('aiwc-design', value); } catch { /* the address still carries it */ }
};

const logo = () => {
  const img = document.querySelector('.brand-mark img');
  if (!img) return;
  if (!img.dataset.light) img.dataset.light = img.getAttribute('src');
  const dark = DARK_HEADER.has(root.getAttribute('data-design'));
  img.setAttribute('src', dark ? img.dataset.light.replace(/aiwc-logo\.png$/, 'aiwc-logo-white.png') : img.dataset.light);
};

const apply = (value, select) => {
  if (value === 'field') root.removeAttribute('data-design');
  else root.setAttribute('data-design', value);
  remember(value);
  const url = new URL(location.href);
  if (value === 'field') url.searchParams.delete('design');
  else url.searchParams.set('design', value);
  history.replaceState(null, '', url);
  select.value = value;
  logo();
};

const bar = document.createElement('div');
bar.className = 'design-switcher';
const label = document.createElement('label');
label.setAttribute('for', 'design-select');
label.textContent = 'Design';
const select = document.createElement('select');
select.id = 'design-select';
for (const [group, list] of GROUPS) {
  const og = document.createElement('optgroup');
  og.label = group;
  for (const [value, text] of list) {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = text;
    og.appendChild(o);
  }
  select.appendChild(og);
}
const step = (delta) => {
  const i = ALL.findIndex(([v]) => v === select.value);
  apply(ALL[(i + delta + ALL.length) % ALL.length][0], select);
};
const prev = Object.assign(document.createElement('button'), { type: 'button', textContent: '‹', ariaLabel: 'Previous design' });
const next = Object.assign(document.createElement('button'), { type: 'button', textContent: '›', ariaLabel: 'Next design' });
prev.setAttribute('aria-label', 'Previous design');
next.setAttribute('aria-label', 'Next design');
prev.addEventListener('click', () => step(-1));
next.addEventListener('click', () => step(1));
select.addEventListener('change', () => apply(select.value, select));
bar.append(label, prev, select, next);
document.body.appendChild(bar);
document.body.classList.add('has-design-switcher');
select.value = root.getAttribute('data-design') || 'field';
logo();
