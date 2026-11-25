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
  const heroIn = document.querySelector('.hero-text'), hero = document.querySelector('.hero');
  const scene = document.querySelector('.scene'), cards = $('.scene .card'), dots = $('.scene .dots i');
  const apex = document.querySelector('.apexscene'), feats = $('.feat li');
  const vids = $('.window,.phone'), nav = document.querySelector('.nav');
  let queued = false;
  const tick = () => {
    queued = false;
    const y = scrollY, vh = innerHeight;
    root.style.setProperty('--sp', clamp(y / (root.scrollHeight - vh)));
    nav.classList.toggle('solid', y > 24);
    const hp = clamp(y / (hero.offsetHeight * .7));
    root.style.setProperty('--hp', hp);
    heroIn.style.transform = `translateY(${hp * 60}px) scale(${1 - hp * .06})`;
    heroIn.style.opacity = 1 - hp * 1.1;
    const sp = scene.querySelector('.pin'), r = scene.getBoundingClientRect(), p = clamp((parseFloat(getComputedStyle(sp).top) - r.top) / (scene.offsetHeight - sp.offsetHeight));
    const idx = Math.min(cards.length - 1, Math.floor(p * cards.length));
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    const ap_ = apex.querySelector('.pin'), ar = apex.getBoundingClientRect(), ap = clamp((parseFloat(getComputedStyle(ap_).top) - ar.top) / (apex.offsetHeight - ap_.offsetHeight));
    feats.forEach((li, i) => li.classList.toggle('on', ap >= i * .2));
    vids.forEach(v => {
      const b = v.getBoundingClientRect();
      v.style.setProperty('--p', clamp((vh - b.top) / (vh * .65)));
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(tick); } };
  // demo videos play muted when they are in view and pause when they leave
  const cmd = (f, func) => f.contentWindow && f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const f = e.target.querySelector('iframe'), on = e.isIntersecting;
    const go = () => { if (!f._m) cmd(f, 'mute'); cmd(f, on ? 'playVideo' : 'pauseVideo'); };
    go(); setTimeout(go, 1200); setTimeout(go, 3000);
    if (on) setTimeout(() => { f._m = true; }, 3500);
  }), { threshold: .6 });
  $('.video,.phone-screen').forEach(v => vio.observe(v));

  // the doodle leans toward the cursor (mouse only)
  const me = document.querySelector('.me');
  if (matchMedia('(hover:hover)').matches) addEventListener('pointermove', e => {
    const b = me.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    me.style.setProperty('--nx', clamp((e.clientX - cx) / innerWidth * 2, -1, 1).toFixed(3));
    me.style.setProperty('--ny', clamp((e.clientY - cy) / innerHeight * 2, -1, 1).toFixed(3));
  });

  // pointer glow on buttons
  $('.btn').forEach(b => b.addEventListener('pointermove', e => {
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', e.clientX - r.left + 'px'); b.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  tick();
})();
