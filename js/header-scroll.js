// small, performant script to toggle .scrolled on the header and drive the mobile menu
document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('header');
  if (!header) return;
  const threshold = 8; // px scrolled before header darkens

  const onScroll = () => {
    if (window.scrollY > threshold) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };

  // run once and on scroll (passive for performance)
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // mobile menu toggle
  const toggle = header.querySelector('.menu-toggle');
  if (!toggle) return;
  const setOpen = (open) => {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));
  header.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
});
