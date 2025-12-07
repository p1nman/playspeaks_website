// small, performant script to toggle .scrolled on the header
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
});