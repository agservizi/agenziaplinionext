/* Motion is an enhancement: content and forms remain available without it. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  let paused = preference.matches;
  let context, lenis, tick, ribbonCleanup;
  let generation = 0;
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  function stop() {
    generation++;
    context?.revert();
    context = null;
    lenis?.destroy();
    lenis = null;
    if (tick && window.gsap) gsap.ticker.remove(tick);
    tick = null;
    ribbonCleanup?.();
    ribbonCleanup = null;
    document.documentElement.classList.remove('motion-enabled');
  }

  function start() {
    if (!window.gsap || !window.ScrollTrigger || paused) return;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('motion-enabled');
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, anchors: true });
      lenis.on('scroll', ScrollTrigger.update);
      tick = time => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    context = gsap.context(() => {
      gsap.from('.herocopy > *', { y: 35, autoAlpha: 0, duration: 1.1, stagger: .11, ease: 'power3.out', clearProps: 'all' });
      gsap.from('.hero-media', { clipPath: 'inset(12% 0 0 0)', autoAlpha: 0, duration: 1.5, ease: 'power3.out', clearProps: 'clipPath,opacity,visibility' });
      gsap.fromTo('.heroimage img', { scale: 1.13 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 } });
      gsap.to('.seal', { y: -45, rotation: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      document.querySelectorAll('.sectionhead, .details > div:last-child > h2, .details > div:last-child > p, .steps > div, .quote > div, form, .boutique > div, .cards article').forEach(el => {
        gsap.from(el, { y: 32, autoAlpha: 0, duration: .85, ease: 'power2.out', clearProps: 'all', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
      });
      gsap.from('.steps', { '--thread-scale': 0, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 85%', end: 'bottom 65%', scrub: .5 } });
      gsap.to(progress, { scaleX: 1, transformOrigin: 'left', ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .15 } });
    });
    const activeGeneration = generation;
    import('./ribbon.js').then(({ mountRibbon }) => {
      if (paused || activeGeneration !== generation) return;
      try { ribbonCleanup = mountRibbon(document.querySelector('.detailmark')); }
      catch { /* The monogram remains as the WebGL fallback. */ }
    }).catch(() => {});
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }

  function update() {
    stop();
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Attiva le animazioni' : 'Metti in pausa le animazioni';
    if (!paused) start();
  }
  toggle.addEventListener('click', () => { paused = !paused; update(); });
  preference.addEventListener('change', e => { paused = e.matches; update(); });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    if (!window.gsap || paused) return;
    const visible = [...document.querySelectorAll('.cards article')].filter(el => !el.hidden);
    gsap.killTweensOf(visible);
    gsap.fromTo(visible, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .08, duration: .5, clearProps: 'all' });
    ScrollTrigger.refresh();
  }));
  document.querySelector('#quoteform').addEventListener('submit', () => window.ScrollTrigger?.refresh());
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.photo').forEach(photo => {
    photo.addEventListener('pointermove', e => {
      if (paused || !finePointer.matches) return;
      const r = photo.getBoundingClientRect();
      photo.style.setProperty('--tilt-x', `${-((e.clientY-r.top)/r.height-.5)*5}deg`);
      photo.style.setProperty('--tilt-y', `${((e.clientX-r.left)/r.width-.5)*5}deg`);
    });
    photo.addEventListener('pointerleave', () => { photo.style.removeProperty('--tilt-x'); photo.style.removeProperty('--tilt-y'); });
  });
  update();
})();

