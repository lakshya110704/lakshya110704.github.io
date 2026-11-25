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
    if (r.top < vh * .5 && r.bottom > vh * .5) setCand(cards[idx]); else if (cand && cand.classList.contains('card')) cand = null;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
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

  // doodles: eyes follow the cursor, head leans, and a small copy sits on whichever side has free space
  const hasHover = matchMedia('(hover:hover)').matches;
  const heroMe = document.querySelector('.stage .me'), stage = document.querySelector('.stage');
  const buddy = document.createElement('div');
  buddy.className = 'buddy'; buddy.setAttribute('aria-hidden', 'true');
  const copy = heroMe.cloneNode(true);
  copy.querySelector('img').alt = '';
  copy.innerHTML = copy.innerHTML.replace(/(id="|url\(#)(lid|glint|eyeL|eyeR)/g, '$1$2b');
  const bubble = document.createElement('div'); bubble.className = 'thought';
  buddy.append(copy, bubble); document.body.appendChild(buddy);
  const mes = [heroMe, copy];
  let px = innerWidth / 2, py = innerHeight * .4;
  const look = () => mes.forEach(me => {
    const b = me.getBoundingClientRect();
    if (b.bottom < 0 || b.top > innerHeight || b.width === 0) return;
    me.querySelectorAll('.iris').forEach(g => {
      const cx = b.left + g.dataset.cx * b.width / 1254, cy = b.top + g.dataset.cy * b.height / 1228;
      const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 200);
      g.style.transform = `translate(${(dx / d * k * 8).toFixed(1)}px,${(dy / d * k * 4.5).toFixed(1)}px)`;
    });
    const nx = clamp((px - (b.left + b.width / 2)) / innerWidth * 2, -1, 1), ny = clamp((py - (b.top + b.height / 2)) / innerHeight * 2, -1, 1);
    me.style.setProperty('--nx', nx.toFixed(3)); me.style.setProperty('--ny', ny.toFixed(3));
  });
  if (hasHover) addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; look(); });

  // which side of the current section has the most free room?
  const TEXT = 'h2,h3,p,dt,dd,li,.btn,.brand';
  const MEDIA = '.window,.phone,.steps,.contact-links';
  let side = 'right', heroGone = false;
  new IntersectionObserver(es => es.forEach(e => { heroGone = !e.isIntersecting; place(); })).observe(stage);
  const place = () => {
    const vh = innerHeight, cands = $('main>section, .apexscene').filter(s => { const r = s.getBoundingClientRect(); return r.top < vh / 2 && r.bottom > vh / 2; });
    const sec = cands[cands.length - 1];
    let L = Infinity, R = -Infinity;
    if (sec) {
      const add = (l, r) => { if (r - l > 2) { L = Math.min(L, l); R = Math.max(R, r); } };
      $(TEXT, sec).forEach(el => {
        if (el.closest('.nav') || el.closest('.card:not(.active)') || getComputedStyle(el).opacity < .2) return;
        const rg = document.createRange(); rg.selectNodeContents(el);
        const b = rg.getBoundingClientRect(); if (b.bottom > 0 && b.top < vh) add(b.left, b.right);
      });
      $(MEDIA, sec).forEach(el => { const b = el.getBoundingClientRect(); if (b.bottom > 0 && b.top < vh) add(b.left, b.right); });
    }
    const freeL = L === Infinity ? 0 : L, freeR = R === -Infinity ? 0 : innerWidth - R, need = 190;
    const okL = freeL >= need, okR = freeR >= need;
    if (!heroGone || (!okL && !okR)) { buddy.classList.remove('on'); return; }
    if (okL && okR) { if (side === 'right' && freeL > freeR + 60) side = 'left'; else if (side === 'left' && freeR > freeL + 60) side = 'right'; }
    else side = okL ? 'left' : 'right';
    const free = side === 'left' ? freeL : freeR, w = clamp(free * .45, 170, 240);
    const cx = side === 'left' ? L / 2 : (R + innerWidth) / 2;
    const first = !buddy.classList.contains('on');
    if (first) buddy.style.transition = 'opacity .5s'; // appear in place, don't slide in from the edge
    buddy.style.width = w + 'px'; buddy.style.setProperty('--bx', Math.max(8, cx - w / 2) + 'px');
    if (first) { buddy.getBoundingClientRect(); buddy.style.transition = ''; }
    buddy.dataset.side = side;
    buddy.classList.add('on');
    if (!introDone) { introDone = true; intro = 'Hi again! I will think out loud as you scroll.'; }
    pump();
  };
  // thought bubbles: short, candid, one at a time, always the latest one
  let introDone = false, intro = null, pending = null, showing = false, shownAt = 0, hideT = 0;
  const hide = () => { clearTimeout(hideT); bubble.classList.remove('show'); setTimeout(() => { showing = false; pump(); }, 450); };
  const pump = () => {
    if ((!pending && !intro) || showing || !buddy.classList.contains('on')) return;
    const t = intro || pending; if (intro) intro = null; else pending = null; showing = true; shownAt = performance.now();
    bubble.textContent = t; bubble.classList.add('show');
    hideT = setTimeout(hide, Math.max(3200, 1800 + t.length * 55));
  };
  const think = t => { pending = t; if (showing && performance.now() - shownAt > 1800) hide(); else pump(); };
  const seen = new Set();
  const say = el => { if (!seen.has(el)) { seen.add(el); think(el.dataset.thought); } };
  // a thought only fires once you settle on something: slow down or pause, never while flying past
  let cand = null, candSince = 0, lastY = scrollY, lastT = performance.now(), speed = 0, settleT = 0;
  const setCand = el => { if (cand !== el) { cand = el; candSince = performance.now(); } };
  const tio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setCand(e.target); else if (cand === e.target) cand = null; }), { rootMargin: '-40% 0px -40% 0px' });
  $('[data-thought]:not(.card)').forEach(el => tio.observe(el));
  let placeT = 0;
  addEventListener('scroll', () => {
    look(); const n = performance.now();
    if (n - placeT > 120) { placeT = n; place(); }
    const dt = n - lastT; if (dt > 0) { speed = Math.abs(scrollY - lastY) / dt; lastY = scrollY; lastT = n; }
    if (speed > 2) { pending = null; if (showing) { clearTimeout(hideT); bubble.classList.remove('show'); showing = false; } } // flying past: clear it
    else if (cand && !seen.has(cand) && n - candSince > 700 && speed < 1) say(cand);
    clearTimeout(settleT); settleT = setTimeout(() => { speed = 0; if (cand && !seen.has(cand)) say(cand); }, 380);
  }, { passive: true });
  addEventListener('resize', place);
  look();

  // pointer glow on buttons
  $('.btn').forEach(b => b.addEventListener('pointermove', e => {
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', e.clientX - r.left + 'px'); b.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  tick();
})();
