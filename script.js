document.documentElement.classList.add('js');

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Nav state + mobile dock ---------- */
  const nav = document.getElementById('nav');
  const dock = document.querySelector('.dock');
  const hero = document.getElementById('hero');
  const stage = document.getElementById('stage');

  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const h = hero.offsetHeight;
    nav.classList.toggle('is-scrolled', y > 40);
    dock && dock.classList.toggle('is-on', y > h * 0.6);
    if (!reduce && y < h) stage.style.setProperty('--scroll', (y / h).toFixed(3));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Burger menu ---------- */
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---------- Hero: parallax + inspection lamp ---------- */
  if (fine && !reduce) {
    const lamp = stage.querySelector('.stage-lamp');
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      stage.style.setProperty('--mx', cx.toFixed(4));
      stage.style.setProperty('--my', cy.toFixed(4));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width * 2 - 1;
      ty = (e.clientY - r.top) / r.height * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
      const s = stage.getBoundingClientRect();
      lamp.style.setProperty('--lx', ((e.clientX - s.left) / s.width * 100).toFixed(2) + '%');
      lamp.style.setProperty('--ly', ((e.clientY - s.top) / s.height * 100).toFixed(2) + '%');
    });
    // the lamp switches on only after the bay is lit
    setTimeout(() => {
      hero.addEventListener('pointerenter', () => hero.classList.add('has-lamp'));
      hero.addEventListener('pointerleave', () => hero.classList.remove('has-lamp'));
      if (hero.matches(':hover')) hero.classList.add('has-lamp');
    }, 2600);
  }

  /* ---------- Services: image follows the active row ---------- */
  const rows = [...document.querySelectorAll('.svc-row')];
  const frames = [...document.querySelectorAll('.svc-frame img')];
  const activate = (row) => {
    rows.forEach((r) => r.classList.toggle('is-on', r === row));
    frames.forEach((f) => f.classList.toggle('is-on', f.dataset.key === row.dataset.key));
  };
  rows.forEach((row) => {
    row.addEventListener('pointerenter', () => activate(row));
    row.addEventListener('focus', () => activate(row));
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
