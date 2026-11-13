/* ==========================================================================
   FOR AYANTIKA
   1. Content          2. Helpers          3. Render
   4. Viewers          5. Sound            6. Navigation
   7. Theme            8. Motion           9. Boot
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Content — edit these lists to change the page
   -------------------------------------------------------------------------- */

/* src: the web-sized plate in assets/photos/plates/
   w/h: real pixel size, used to reserve space before the image loads */
const photographs = [
  { src: 'IMG-20260705-005028-555', w: 1080, h: 1920 },
  { src: 'IMG-20260705-005031-428', w: 1080, h: 1920 },
  { src: 'IMG-20260705-005358-744', w: 1080, h: 1920 },
  { src: 'IMG-20260705-005410-054', w: 1080, h: 1920 },
  { src: 'IMG-20260705-005415-232', w: 1080, h: 1920 },
  { src: 'IMG-20260705-005548-244', w: 1080, h: 485 },
  { src: 'IMG-20260705-005554-671', w: 485, h: 1080 },
  { src: 'IMG-20260705-010902-376', w: 1080, h: 1920 },
  { src: 'IMG-20260705-010902-376-1', w: 605, h: 855 },
  { src: 'SmartSelect-20260705-011243-Gallery', w: 908, h: 1577 },
  { src: 'SmartSelect-20260705-011257-Gallery', w: 909, h: 1171 },
  { src: 'SmartSelect-20260705-011431-Gallery', w: 919, h: 869 },
  { src: 'SmartSelect-20260705-011449-Gallery', w: 944, h: 1184 },
  { src: 'SmartSelect-20260705-011505-Gallery', w: 910, h: 932 },
  { src: 'SmartSelect-20260705-011526-Gallery', w: 696, h: 756 },
  { src: 'SmartSelect-20260705-011553-Gallery', w: 890, h: 919 },
  { src: 'SmartSelect-20260705-011625-Gallery', w: 1043, h: 1418 },
  { src: 'SmartSelect-20260705-011648-Gallery', w: 911, h: 1233 },
  { src: 'SmartSelect-20260705-011723-Gallery', w: 1008, h: 1298 },
  { src: 'ai-select-for-sharing-1783195198704', w: 978, h: 1020 }
];

/* The films live on Cloudflare R2. Change `file` and `poster` to swap them. */
const FILM_BASE = 'https://pub-0af3cc62b67645418c33468f5c991233.r2.dev/';

const films = [
  { id: 1, title: 'Laughter', file: 'Ayantika 1.mp4', poster: 'IMG-20260705-005028-555' },
  { id: 2, title: 'Talking', file: 'Ayantika 3.mp4', poster: 'IMG-20260705-005031-428' },
  { id: 3, title: 'Walking', file: 'Ayantika 4.mp4', poster: 'IMG-20260705-005358-744' },
  { id: 4, title: 'A gift', file: 'Ayantika 5.mp4', poster: 'IMG-20260705-005410-054' },
  { id: 5, title: 'Eyes', file: 'Ayantika 6.mp4', poster: 'IMG-20260705-005415-232' },
  { id: 6, title: 'Dancing', file: 'Ayantika 7.mp4', poster: 'IMG-20260705-005548-244' },
  { id: 7, title: 'Held', file: 'Ayantika 8.mp4', poster: 'IMG-20260705-005554-671' },
  { id: 8, title: 'Quiet', file: 'Ayantika 9.mp4', poster: 'IMG-20260705-010902-376' }
];

/* --------------------------------------------------------------------------
   2. Helpers
   -------------------------------------------------------------------------- */
const PLATE_DIR = 'assets/photos/plates/';
const plateSrc = (name) => `${PLATE_DIR}${name}.webp`;
const pad = (n) => String(n).padStart(2, '0');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

/* --------------------------------------------------------------------------
   3. Render
   -------------------------------------------------------------------------- */
function renderPhotographs() {
  const grid = document.getElementById('platesGrid');
  if (!grid) return;

  const fragment = document.createDocumentFragment();

  photographs.forEach((photo, i) => {
    const figure = document.createElement('figure');
    figure.className = 'plate';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'plate__open';
    button.dataset.index = String(i);
    button.setAttribute('aria-label', `Open photograph ${i + 1} of ${photographs.length}`);

    const img = document.createElement('img');
    img.src = plateSrc(photo.src);
    img.width = photo.w;
    img.height = photo.h;
    img.alt = '';
    img.loading = i < 3 ? 'eager' : 'lazy';
    img.decoding = 'async';

    button.append(img);
    figure.append(button);
    fragment.append(figure);
  });

  grid.append(fragment);
}

function renderFilms() {
  const grid = document.getElementById('filmsGrid');
  if (!grid) return;

  const fragment = document.createDocumentFragment();

  films.forEach((film) => {
    const article = document.createElement('article');
    article.className = 'film';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'film__open';
    button.dataset.film = String(film.id);
    button.setAttribute('aria-label', `Play film: ${film.title}`);

    const img = document.createElement('img');
    img.src = plateSrc(film.poster);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';

    const play = document.createElement('span');
    play.className = 'film__play';
    play.setAttribute('aria-hidden', 'true');

    const meta = document.createElement('div');
    meta.className = 'film__meta';

    const title = document.createElement('h3');
    title.className = 'film__title';
    title.textContent = film.title;

    const length = document.createElement('span');
    length.className = 'film__length';
    length.textContent = pad(film.id);

    meta.append(title, length);
    button.append(img, play);
    article.append(button, meta);
    fragment.append(article);
  });

  grid.append(fragment);
}

/* --------------------------------------------------------------------------
   4. Viewers (native dialogs: focus trap, Escape and backdrop come free)
   -------------------------------------------------------------------------- */
let lenisInstance = null;
let lastTrigger = null;

function lockScroll(lock) {
  document.documentElement.classList.toggle('is-locked', lock);
  if (!lenisInstance) return;
  lock ? lenisInstance.stop() : lenisInstance.start();
}

function openDialog(dialog) {
  if (!dialog) return;
  lastTrigger = document.activeElement;
  dialog.showModal();
  lockScroll(true);
}

function closeDialog(dialog) {
  if (!dialog || !dialog.open) return;
  dialog.close();
}

function initPhotoViewer() {
  const dialog = document.getElementById('photoViewer');
  const image = document.getElementById('photoViewerImage');
  const index = document.getElementById('photoViewerIndex');
  if (!dialog || !image) return;

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });

  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    image.alt = '';
    if (index) index.textContent = '';
    lockScroll(false);
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  });

  document.querySelectorAll('.plate__open').forEach((button) => {
    button.addEventListener('click', () => {
      const i = Number(button.dataset.index);
      const photo = photographs[i];
      if (!photo) return;

      image.src = plateSrc(photo.src);
      image.alt = '';
      if (index) index.textContent = `${pad(i + 1)} / ${pad(photographs.length)}`;
      dialog.setAttribute('aria-label', `Photograph ${i + 1} of ${photographs.length}`);
      openDialog(dialog);
    });
  });
}

function initFilmViewer() {
  const dialog = document.getElementById('filmViewer');
  const video = document.getElementById('filmViewerVideo');
  const title = document.getElementById('filmViewerTitle');
  const index = document.getElementById('filmViewerIndex');
  if (!dialog || !video || !title) return;

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });

  dialog.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    title.textContent = '';
    if (index) index.textContent = '';
    lockScroll(false);
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  });

  document.querySelectorAll('.film__open').forEach((button) => {
    button.addEventListener('click', () => {
      const film = films.find((item) => String(item.id) === button.dataset.film);
      if (!film) return;

      const wasPlaying = !ambient.paused;
      if (wasPlaying) pauseAmbient();

      title.textContent = film.title;
      if (index) index.textContent = `Film ${pad(film.id)} of ${pad(films.length)}`;
      video.src = FILM_BASE + encodeURIComponent(film.file);
      openDialog(dialog);
      dialog.dataset.wasPlaying = wasPlaying ? 'true' : 'false';
    });
  });

  dialog.addEventListener('close', () => {
    if (dialog.dataset.wasPlaying === 'true') resumeAmbient();
    delete dialog.dataset.wasPlaying;
  });
}

function initViewerDismissal() {
  document.querySelectorAll('.viewer [data-close]').forEach((button) => {
    button.addEventListener('click', () => closeDialog(button.closest('.viewer')));
  });
}

/* --------------------------------------------------------------------------
   5. Sound
   -------------------------------------------------------------------------- */
const ambient = document.getElementById('ambient');
const soundToggle = document.getElementById('soundToggle');
const soundState = document.getElementById('soundState');
let ambientWanted = false;

function paintSound() {
  if (!soundToggle) return;
  const on = ambient && !ambient.paused;
  soundToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
  if (soundState) soundState.textContent = on ? 'on' : 'off';
}

function pauseAmbient() {
  if (!ambient) return;
  ambient.pause();
  paintSound();
}

function resumeAmbient() {
  if (!ambient) return;
  ambient.play().then(() => {
    ambientWanted = true;
    paintSound();
  }).catch(() => {
    /* Autoplay was blocked; the toggle stays available. */
    paintSound();
  });
}

function initSound() {
  if (!ambient || !soundToggle) return;

  soundToggle.addEventListener('click', () => {
    if (ambient.paused) resumeAmbient();
    else {
      ambientWanted = false;
      ambient.pause();
      paintSound();
    }
  });

  ambient.addEventListener('play', paintSound);
  ambient.addEventListener('pause', paintSound);
  paintSound();

  if (localStorage.getItem('ambient') === 'on') {
    ambientWanted = true;
    const unlock = () => {
      resumeAmbient();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  window.addEventListener('pagehide', () => {
    localStorage.setItem('ambient', ambientWanted && !ambient.paused ? 'on' : 'off');
  });
}

/* --------------------------------------------------------------------------
   6. Navigation: running head, progress, smooth anchors
   -------------------------------------------------------------------------- */
function initRunningHead() {
  const sections = [...document.querySelectorAll('.chapter')];
  const head = document.getElementById('runningHead');
  const label = document.getElementById('runningChapter');
  const count = document.getElementById('runningCount');
  if (!sections.length || !head) return;

  const total = sections.length;
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const i = sections.indexOf(entry.target);
      if (label) label.textContent = entry.target.dataset.label || '';
      if (count) count.textContent = `${roman[i] || i + 1} / ${roman[total - 1] || total}`;
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach((section) => observer.observe(section));

  const masthead = document.getElementById('top');
  if (masthead) {
    new IntersectionObserver(([entry]) => {
      head.classList.toggle('is-visible', !entry.isIntersecting);
    }, { rootMargin: '0px' }).observe(masthead);
  }
}

function initProgress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;

  const paint = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    bar.style.width = `${value * 100}%`;
  };

  /* Lenis drives window.scrollY natively, so one native listener covers both
     paths — smooth scrolling and instant jumps. */
  window.addEventListener('scroll', paint, { passive: true });
  window.addEventListener('resize', paint, { passive: true });
  paint();
}

function initAnchors() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY;

    if (lenisInstance) {
      /* Adopt a native scroll that Lenis has not caught up with yet (keyboard,
         find-in-page, a hash jump) so the animation starts where the eye is. */
      if (Math.abs(lenisInstance.scroll - window.scrollY) > 1) {
        lenisInstance.scrollTo(window.scrollY, { immediate: true, force: true });
      }
      lenisInstance.scrollTo(top, { duration: 1.4 });
    } else {
      window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }

    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });

    if (history.replaceState) history.replaceState(null, '', id);
  });
}

/* --------------------------------------------------------------------------
   7. Theme — day edition / night edition, remembered
   -------------------------------------------------------------------------- */
function paintTheme() {
  const toggle = document.getElementById('themeToggle');
  const state = document.getElementById('themeState');
  const meta = document.getElementById('themeColor');
  if (!toggle) return;

  const night = document.documentElement.dataset.theme === 'dark';
  toggle.setAttribute('aria-pressed', night ? 'true' : 'false');
  if (state) state.textContent = night ? 'on' : 'off';
  if (meta) meta.setAttribute('content', night ? '#16130f' : '#f2ede3');
}

function setTheme(night) {
  if (night) document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;

  try {
    localStorage.setItem('theme', night ? 'night' : 'day');
  } catch (error) {
    /* Private mode: the choice simply does not persist. */
  }

  paintTheme();
}

function storedTheme() {
  try {
    return localStorage.getItem('theme');
  } catch (error) {
    return null;
  }
}

function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  /* The inline head script usually got here first; this reconciles the rest. */
  const stored = storedTheme();
  if (!document.documentElement.dataset.theme && (stored ? stored === 'night' : systemDark.matches)) {
    document.documentElement.dataset.theme = 'dark';
  }

  paintTheme();

  toggle.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme !== 'dark');
  });

  systemDark.addEventListener('change', (event) => {
    if (storedTheme()) return; // an explicit choice outranks the system
    if (event.matches) document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    paintTheme();
  });
}

/* --------------------------------------------------------------------------
   8. Motion — GSAP + Lenis, skipped entirely under reduced motion
   -------------------------------------------------------------------------- */
function initMotion() {
  if (reducedMotion.matches) return;
  if (!window.gsap || !window.ScrollTrigger) return; // CDN unavailable: content stays visible

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  document.documentElement.classList.add('motion-on');

  if (window.Lenis) {
    lenisInstance = new window.Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4
    });
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Masthead: the name rises out of its mask, the rule draws itself. */
  const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
  hero
    .from('.masthead .kicker', { y: 14, opacity: 0, duration: 0.8 })
    .from('.masthead__name-inner', { yPercent: 112, duration: 1.35, ease: 'power4.out' }, 0.1)
    .from('.masthead__rule', { scaleX: 0, duration: 1.1, transformOrigin: 'left' }, 0.7)
    .from('.masthead__line', { y: 18, opacity: 0, duration: 0.9 }, 0.85)
    .from('.masthead__meta, .masthead__begin', { y: 12, opacity: 0, duration: 0.8, stagger: 0.1 }, 1)
    .from('.masthead__name', { yPercent: 6, duration: 1.4 }, 1.1);

  gsap.to('.masthead__inner', {
    yPercent: -8,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: { trigger: '.masthead', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* Text and rule reveals. */
  gsap.set('.reveal', { y: 24, opacity: 0 });

  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.075,
      overwrite: true
    })
  });

  /* The contact sheet arrives as one page, not twenty separate performances. */
  if (document.querySelector('.plate')) {
    gsap.from('.plate', {
      y: 16,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.035,
      scrollTrigger: { trigger: '.plates', start: 'top 85%', once: true }
    });
  }

  /* Chapter numerals drift in from the margin. */
  gsap.utils.toArray('.chapter__num').forEach((num) => {
    gsap.from(num, {
      opacity: 0,
      x: -10,
      duration: 0.7,
      scrollTrigger: { trigger: num, start: 'top 90%', once: true }
    });
  });

  ScrollTrigger.refresh();
}

/* --------------------------------------------------------------------------
   9. Boot
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderPhotographs();
  renderFilms();

  initTheme();
  initViewerDismissal();
  initPhotoViewer();
  initFilmViewer();
  initSound();
  initAnchors();
  initRunningHead();
  initMotion();
  initProgress();

  window.addEventListener('load', () => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
});
