// scroll effects for the office page: hero parallax, pinned room zoom, and reveal-on-scroll
document.addEventListener('DOMContentLoaded', function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal elements as they enter the viewport
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  const hero = document.querySelector('.office-hero');
  const rooms = document.querySelectorAll('.room');
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;

    // hero parallax: only while it is on screen (skipped for reduced motion)
    if (hero && !reduceMotion && window.scrollY < vh * 1.2) hero.style.setProperty('--scroll', window.scrollY.toFixed(1));

    rooms.forEach((room) => {
      const rect = room.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      // zoom progress 0 → 1 while the photo is pinned (landscape screens)
      const travel = Math.max(rect.height - vh, 1);
      const p = Math.min(Math.max(-rect.top / travel, 0), 1);
      room.style.setProperty('--p', p.toFixed(3));
      // pan progress 0 → 1 over the first screen-height of pinned scroll (portrait screens),
      // holding briefly at each edge; user-driven, so it runs even with reduced motion
      const t = -rect.top / vh;
      const pan = Math.min(Math.max((t - 0.1) / 0.8, 0), 1);
      room.style.setProperty('--pan', pan.toFixed(3));
    });
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
});
