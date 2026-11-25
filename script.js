// Scroll-driven motion. Without JS, IntersectionObserver or with reduced motion, the page shows statically.
(() => {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement, $ = (q, c = document) => [...c.querySelectorAll(q)];
  root.classList.add('js');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // headline: words rise in one by one
  const h1 = document.querySelector('h1');
  h1.innerHTML = h1.textContent.split(' ').map((w, i) => `<span class="w" style="--i:${i}"><span>${w}</span></span>`).join(' ');
  setTimeout(() => root.classList.add('ready'), 60);

  // reveal on enter
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $('.reveal').forEach(el => io.observe(el));

  // active nav link
  const links = $('.nav nav a'), nio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $('main>section[id]').forEach(s => nio.observe(s));

  // scroll-linked values, one rAF per frame
  const heroIn = document.querySelector('.hero-inner'), hero = document.querySelector('.hero');
  const scene = document.querySelector('.scene'), cards = $('.scene .card'), dots = $('.scene .dots i');
  const vids = $('.video'), nav = document.querySelector('.nav');
  let queued = false;
  const tick = () => {
    queued = false;
    const y = scrollY, vh = innerHeight;
    root.style.setProperty('--sp', clamp(y / (root.scrollHeight - vh)));
    nav.classList.toggle('solid', y > 24);
    const hp = clamp(y / (hero.offsetHeight * .7));
    heroIn.style.transform = `translateY(${hp * 60}px) scale(${1 - hp * .06})`;
    heroIn.style.opacity = 1 - hp * 1.1;
    const r = scene.getBoundingClientRect(), p = clamp(-r.top / (scene.offsetHeight - vh));
    const idx = Math.min(cards.length - 1, Math.floor(p * cards.length));
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    vids.forEach(v => {
      const b = v.getBoundingClientRect();
      v.style.setProperty('--p', clamp((vh - b.top) / (vh * .65)));
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(tick); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  tick();
})();
