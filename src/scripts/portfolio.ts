import { FS, VS } from './gridShader';
import type { Media, ProjectLink } from '../data/portfolio';

const CELL_SIZE = 32;
const INTENSITY = 0.5;
const FLICKER = true;

const html = document.documentElement;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const pad = (n: number) => String(n).padStart(2, '0');
const isLight = () => html.dataset.theme === 'light';
const isArmed = () => html.hasAttribute('data-armed');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const root = $('[data-fc]');
if (root) {
  initTheme();
  initExperience();
  initSectionNav();
  initModal(root);
  initPreviews();
  initGun();
  initGrid(Number(root.dataset.hue) || 0.36);
}

function initTheme() {
  const btn = $('[data-theme-toggle]');
  const label = $('[data-theme-label]');
  const sync = () => {
    if (label) label.textContent = isLight() ? 'light' : 'dark';
    $<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', isLight() ? '#f3f2ee' : '#0a0b0d');
  };
  sync();
  btn?.addEventListener('click', () => {
    const next = isLight() ? 'dark' : 'light';
    html.dataset.theme = next;
    try {
      localStorage.setItem('fc-theme', next);
    } catch {}
    sync();
  });
}

function initExperience() {
  const block = $('[data-exp]');
  const btn = $('[data-exp-toggle]');
  const label = $('[data-exp-label]');
  if (!block || !btn) return;
  btn.addEventListener('click', () => {
    const open = block.classList.toggle('exp-open');
    btn.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'hide details' : 'show details';
  });
}

/** Marks the section nav link for whichever section sits near the top of the viewport. */
function initSectionNav() {
  const track = $('[data-jump]');
  if (!track || !('IntersectionObserver' in window)) return;
  const links = new Map([...track.querySelectorAll<HTMLAnchorElement>('a')].map((a) => [a.hash.slice(1), a]));
  const hero = $('.hero');
  let current: HTMLAnchorElement | undefined;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        // Back in the hero: no section is current.
        const a = e.target === hero ? undefined : links.get(e.target.id);
        if (a === current) continue;
        current?.removeAttribute('aria-current');
        current = a;
        if (!a) continue;
        a.setAttribute('aria-current', 'location');
        track.scrollTo({ left: a.offsetLeft - (track.clientWidth - a.offsetWidth) / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    },
    { rootMargin: '-25% 0px -70% 0px' },
  );
  if (hero) io.observe(hero);
  links.forEach((_, id) => {
    const s = document.getElementById(id);
    if (s) io.observe(s);
  });
}

/* ---------- project modal: embed, gallery, breakdown and turntable ---------- */

interface ModalProject {
  title: string;
  desc: string;
  tags: string[];
  links?: ProjectLink[];
  yt?: string;
  ig?: string;
  media?: Media[];
  turntable?: boolean;
}

interface Slide {
  type: 'youtube' | 'instagram' | 'image' | 'video';
  src: string;
  poster?: string;
  caption?: string;
}

/** The embed comes first, then any local media (galleries, breakdowns). */
function slidesOf(p: ModalProject): Slide[] {
  return [
    ...(p.yt ? [{ type: 'youtube' as const, src: p.yt, caption: 'video' }] : []),
    ...(p.ig ? [{ type: 'instagram' as const, src: p.ig, caption: 'post' }] : []),
    ...(p.media ?? []),
  ];
}

function initModal(page: HTMLElement) {
  const modal = $('[data-modal]');
  const stage = $('[data-modal-stage]');
  if (!modal || !stage) return;
  const title = $('[data-modal-title]')!;
  const ext = $<HTMLAnchorElement>('[data-modal-ext]')!;
  const nav = $('[data-modal-nav]')!;
  const caption = $('[data-modal-caption]')!;
  const count = $('[data-modal-count]')!;
  const desc = $('[data-modal-desc]')!;
  const linksEl = $('[data-modal-links]')!;
  const tagsEl = $('[data-modal-tags]')!;
  const chips = $('[data-modal-chips]')!;
  const closeBtn = $<HTMLButtonElement>('[data-modal-close]')!;
  const gunWidget = $('[data-gun-widget]');

  let projects: Record<string, ModalProject> = {};
  try {
    projects = JSON.parse($('#fc-projects')?.textContent || '{}');
  } catch {}

  let cur: ModalProject | null = null;
  let slides: Slide[] = [];
  let idx = 0;
  let returnFocus: HTMLElement | null = null;
  // Turntable state: auto-spin timer, whether the user took over, and the active drag.
  let spin = 0;
  let touched = false;
  let drag: { x: number; idx: number } | null = null;

  const watchLoad = (el: HTMLElement, ready: string, failed?: string) => {
    stage.classList.add('is-loading');
    stage.classList.remove('is-error');
    el.addEventListener(ready, () => stage.classList.remove('is-loading'), { once: true });
    if (failed) el.addEventListener(failed, () => stage.classList.replace('is-loading', 'is-error'), { once: true });
  };

  // The stage follows the media instead of letterboxing it in 16:9: tall for
  // portrait, matching proportions for panoramas such as a full shader graph.
  const fitShape = (w: number, h: number) => {
    stage.classList.toggle('is-tall', h > w);
    stage.style.aspectRatio = w / h > 16 / 9 ? `${w} / ${h}` : '';
  };

  const render = () => {
    const s = slides[idx];
    if (!cur || !s) return;
    const prev = stage.firstElementChild;
    // Turntable frames swap the src of the same <img>, so spinning never flashes.
    if (cur.turntable && prev instanceof HTMLImageElement) {
      prev.src = s.src;
    } else {
      stage.replaceChildren();
      stage.classList.remove('is-loading', 'is-error', 'is-tall');
      stage.style.aspectRatio = '';
      stage.classList.toggle('is-ig', s.type === 'instagram');
      if (s.type === 'youtube' || s.type === 'instagram') {
        const f = document.createElement('iframe');
        f.title = cur.title;
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.src = s.type === 'youtube' ? `https://www.youtube-nocookie.com/embed/${s.src}?autoplay=1&rel=0` : `${s.src}embed/`;
        if (s.type === 'instagram') fitShape(9, 16);
        watchLoad(f, 'load');
        stage.append(f);
      } else if (s.type === 'video') {
        const v = document.createElement('video');
        v.src = s.src;
        if (s.poster) v.poster = s.poster;
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        v.addEventListener('loadedmetadata', () => fitShape(v.videoWidth, v.videoHeight), { once: true });
        watchLoad(v, 'loadeddata', 'error');
        stage.append(v);
      } else {
        const img = document.createElement('img');
        img.src = s.src;
        img.draggable = false;
        img.addEventListener('load', () => fitShape(img.naturalWidth, img.naturalHeight), { once: true });
        watchLoad(img, 'load', 'error');
        stage.append(img);
      }
    }
    const img = stage.firstElementChild;
    if (img instanceof HTMLImageElement) img.alt = s.caption ? `${cur.title} · ${s.caption}` : cur.title;
    ext.href = s.type === 'youtube' ? `https://www.youtube.com/watch?v=${s.src}` : s.src;
    ext.textContent = s.type === 'youtube' ? 'youtube ↗' : s.type === 'instagram' ? 'instagram ↗' : 'open ↗';
    nav.hidden = slides.length < 2;
    caption.textContent = cur.turntable ? 'drag to rotate' : (s.caption ?? '');
    chips.querySelectorAll('button').forEach((b, i) => b.toggleAttribute('aria-current', i === idx));
    count.textContent = `${pad(idx + 1)}/${pad(slides.length)}`;
    // Warm up the neighbours so stepping through a sequence feels instant.
    [idx + 1, idx - 1].forEach((k) => {
      const n = slides[(k + slides.length) % slides.length];
      if (n?.type === 'image') new Image().src = n.src;
    });
  };

  const step = (dir: number) => {
    if (slides.length < 2) return;
    idx = (idx + dir + slides.length) % slides.length;
    render();
  };

  const stopSpin = () => {
    clearInterval(spin);
    spin = 0;
  };

  // Any manual step stops the auto-spin for good.
  const userStep = (dir: number) => {
    touched = true;
    stopSpin();
    step(dir);
  };

  const go = (i: number) => {
    idx = i;
    render();
  };

  // Short sets (an embed plus its breakdown, a few shots) get a named button per slide.
  const fillChips = () => {
    const named = !cur?.turntable && slides.length > 1 && slides.length <= 6;
    chips.hidden = !named;
    caption.hidden = named;
    chips.replaceChildren(
      ...(named ? slides : []).map((s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'modal-chip';
        b.textContent = s.caption ?? pad(i + 1);
        b.addEventListener('click', () => go(i));
        return b;
      }),
    );
  };

  const startTurntable = () => {
    const p = cur;
    stage.classList.add('is-turntable');
    // Every frame loads before the spin starts, so it never stalls on the network.
    const frames = slides.map((s) => {
      const i = new Image();
      i.src = s.src;
      return i.decode().catch(() => {});
    });
    if (reduceMotion) return;
    void Promise.all(frames).then(() => {
      if (cur === p && !touched) spin = window.setInterval(() => step(1), 90);
    });
  };

  stage.addEventListener('pointerdown', (e) => {
    if (!cur?.turntable) return;
    e.preventDefault();
    touched = true;
    stopSpin();
    drag = { x: e.clientX, idx };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const n = slides.length;
    const next = (((drag.idx + Math.round((e.clientX - drag.x) / 12)) % n) + n) % n;
    if (next !== idx) {
      idx = next;
      render();
    }
  });
  const endDrag = () => (drag = null);
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  const fillInfo = (p: ModalProject) => {
    desc.textContent = p.desc;
    linksEl.replaceChildren(
      ...(p.links ?? []).map((l) => {
        const a = document.createElement('a');
        a.className = 'btn btn-secondary';
        a.href = l.href;
        a.target = '_blank';
        a.rel = 'noreferrer';
        const arrow = document.createElement('span');
        arrow.textContent = '↗';
        arrow.setAttribute('aria-hidden', 'true');
        a.append(`${l.label} `, arrow);
        return a;
      }),
    );
    linksEl.hidden = !p.links?.length;
    tagsEl.replaceChildren(
      ...p.tags.map((t) => {
        const li = document.createElement('li');
        li.className = 'tag';
        li.textContent = t;
        return li;
      }),
    );
  };

  const open = (pid: string | undefined, at = 0) => {
    if (isArmed() || !pid || !projects[pid]) return;
    cur = projects[pid];
    slides = slidesOf(cur);
    idx = Math.min(at, slides.length - 1);
    touched = false;
    title.textContent = cur.title;
    fillInfo(cur);
    fillChips();
    const active = document.activeElement as HTMLElement | null;
    returnFocus = active && active !== document.body ? active : $(`#${pid} [data-card-open]`);
    modal.hidden = false;
    // Everything behind the dialog drops out of focus order and stops scrolling.
    page.inert = true;
    if (gunWidget) gunWidget.inert = true;
    html.style.overflow = 'hidden';
    // The URL now points at this project, so it can be copied and shared.
    history.replaceState(null, '', `#${pid}`);
    render();
    if (cur.turntable) startTurntable();
    closeBtn.focus();
  };

  const close = () => {
    if (!cur) return;
    cur = null;
    stopSpin();
    drag = null;
    modal.hidden = true;
    stage.replaceChildren();
    stage.classList.remove('is-loading', 'is-error', 'is-tall', 'is-ig', 'is-turntable');
    stage.style.aspectRatio = '';
    page.inert = false;
    if (gunWidget) gunWidget.inert = false;
    html.style.overflow = '';
    history.replaceState(null, '', location.pathname + location.search);
    returnFocus?.focus();
  };

  // The thumbnail is the focusable button; the rest of the card is a larger mouse target.
  document.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
    card.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target.closest('a')) return;
      // "breakdown ›" opens straight on the breakdown slide.
      open(card.dataset.pid, Number(target.closest<HTMLElement>('[data-open-at]')?.dataset.openAt) || 0);
    });
  });

  // A shared link like /#samurai opens that project straight away.
  const openFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!projects[id] || cur === projects[id]) return;
    close();
    open(id);
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  closeBtn.addEventListener('click', close);
  $('[data-modal-prev]')?.addEventListener('click', () => userStep(-1));
  $('[data-modal-next]')?.addEventListener('click', () => userStep(1));
  window.addEventListener('keydown', (e) => {
    if (!cur) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') userStep(-1);
    else if (e.key === 'ArrowRight') userStep(1);
  });
}

/* ---------- card previews ---------- */

/** Muted loops on cards: on hover with a mouse, while mostly on screen on touch devices. */
function initPreviews() {
  const vids = [...document.querySelectorAll<HTMLVideoElement>('[data-preview]')];
  if (!vids.length || reduceMotion) return;
  const play = (v: HTMLVideoElement) => {
    v.play()
      .then(() => v.classList.add('is-playing'))
      .catch(() => {});
  };
  const stop = (v: HTMLVideoElement) => {
    v.pause();
    v.classList.remove('is-playing');
  };
  if (matchMedia('(hover: hover)').matches) {
    vids.forEach((v) => {
      const card = v.closest('[data-card]');
      card?.addEventListener('pointerenter', () => play(v));
      card?.addEventListener('pointerleave', () => stop(v));
      card?.addEventListener('focusin', () => play(v));
      card?.addEventListener('focusout', () => stop(v));
    });
    return;
  }
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? play : stop)(e.target as HTMLVideoElement)),
    { threshold: 0.6 },
  );
  vids.forEach((v) => io.observe(v));
}

/* ---------- background grid shader ---------- */

function initGrid(hue: number) {
  const cv = $<HTMLCanvasElement>('[data-grid]');
  const gl = cv?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!cv || !gl) return;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const names = ['uRes', 'uMouse', 'uTrail', 'uTime', 'uCell', 'uHue', 'uInt', 'uPx', 'uFlick', 'uLight'] as const;
  const U = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(pr, n)])) as Record<(typeof names)[number], WebGLUniformLocation | null>;

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(cv.clientWidth * dpr);
    const h = Math.round(cv.clientHeight * dpr);
    // Mobile toolbars fire resize while scrolling; touching the buffer would blank a frame.
    if (w === cv.width && h === cv.height) return;
    cv.width = w;
    cv.height = h;
    gl.viewport(0, 0, w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  const m = { x: innerWidth * 0.7, y: innerHeight * 0.4 };
  const s = { ...m };
  const t = { ...m };

  // With a mouse the glow follows the cursor. On touch screens it follows the finger
  // while touching (scrolling included) and otherwise drifts on its own, so its hue
  // keeps shifting instead of sitting on one color. The input type decides, not a
  // media query, since some phones misreport hover.
  let touch = matchMedia('(hover: none)').matches;
  let lastTouch = -Infinity;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      touch = false;
      m.x = e.clientX;
      m.y = e.clientY;
    },
    { passive: true },
  );
  const onTouch = (e: TouchEvent) => {
    const p = e.touches[0];
    if (!p) return;
    touch = true;
    lastTouch = performance.now();
    m.x = p.clientX;
    m.y = p.clientY;
  };
  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });

  const t0 = performance.now();
  let light = isLight() ? 1 : 0;

  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    // A second after the finger lifts, glide back onto the drift path.
    if (touch && !reduceMotion && now - lastTouch > 1000) {
      const k = (now - t0) / 1000;
      m.x += (innerWidth * (0.5 + 0.4 * Math.sin(k * 0.23)) - m.x) * 0.03;
      m.y += (innerHeight * (0.5 + 0.4 * Math.sin(k * 0.17 + 1.3)) - m.y) * 0.03;
    }
    s.x += (m.x - s.x) * 0.25;
    s.y += (m.y - s.y) * 0.25;
    t.x += (m.x - t.x) * 0.05;
    t.y += (m.y - t.y) * 0.05;
    light += ((isLight() ? 1 : 0) - light) * 0.12;
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform2f(U.uMouse, s.x * dpr, s.y * dpr);
    gl.uniform2f(U.uTrail, t.x * dpr, t.y * dpr);
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform1f(U.uCell, CELL_SIZE * dpr);
    gl.uniform1f(U.uHue, hue);
    gl.uniform1f(U.uInt, touch ? INTENSITY * 0.6 : INTENSITY);
    gl.uniform1f(U.uPx, dpr);
    gl.uniform1f(U.uLight, light);
    gl.uniform1f(U.uFlick, FLICKER && !reduceMotion ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);
}

/* ---------- gun easter egg ---------- */

/** 8-bit "pew": a square-wave pitch drop plus a short noise burst, synthesized on the fly. */
function createShotSound() {
  let ac: AudioContext | null = null;
  let noise: AudioBuffer | null = null;
  return () => {
    try {
      ac ??= new AudioContext();
      if (ac.state === 'suspended') void ac.resume();
      const t = ac.currentTime;

      const osc = ac.createOscillator();
      const og = ac.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(920 + Math.random() * 120, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);
      og.gain.setValueAtTime(0.07, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(og).connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.15);

      if (!noise) {
        const len = Math.floor(ac.sampleRate * 0.06);
        noise = ac.createBuffer(1, len, ac.sampleRate);
        const ch = noise.getChannelData(0);
        for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
      }
      const src = ac.createBufferSource();
      const ng = ac.createGain();
      src.buffer = noise;
      ng.gain.value = 0.05;
      src.connect(ng).connect(ac.destination);
      src.start(t);
    } catch {}
  };
}

interface Particle {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  t: number;
}

function initGun() {
  const layer = $('[data-fx]');
  const widget = $('[data-gun-widget]');
  const gun = $('[data-gun]');
  const flash = $('[data-gun-flash]');
  const label = $('[data-gun-label]');
  const ctrls = $('[data-gun-ctrls]');
  if (!layer || !widget || !gun || !flash || !label || !ctrls) return;

  const g = {
    armed: false,
    fired: false,
    damaged: false,
    mx: innerWidth / 2,
    my: innerHeight / 2,
    dx: 0,
    dy: 0,
    recoil: 0,
    flash: 0,
    bullets: [] as { el: HTMLElement; x: number; y: number }[],
    debris: [] as Particle[],
    recs: new Map<Text, { full: string; created: Node[] }>(),
    rootOf: new WeakMap<Text, Text>(),
  };

  const sync = () => {
    label.textContent = g.armed ? 'Click!' : 'Try it!';
    gun.title = g.armed ? '' : 'Pick up the gun';
    gun.classList.toggle('armed', g.armed);
    ctrls.hidden = !((g.armed && g.fired) || g.damaged);
  };

  const caretAt = (x: number, y: number) => {
    const d = document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    };
    if (d.caretRangeFromPoint) {
      const r = d.caretRangeFromPoint(x, y);
      return r && { node: r.startContainer, off: r.startOffset };
    }
    if (d.caretPositionFromPoint) {
      const p = d.caretPositionFromPoint(x, y);
      return p && { node: p.offsetNode, off: p.offset };
    }
    return null;
  };

  const spawn = (ch: string, r: DOMRect, el: Element) => {
    if (g.debris.length > 400) return;
    const cs = getComputedStyle(el);
    const s = document.createElement('span');
    s.textContent = ch;
    s.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;font:${cs.font};color:${cs.color};white-space:pre;will-change:transform`;
    layer.appendChild(s);
    g.debris.push({ el: s, x: 0, y: 0, vx: -(150 + Math.random() * 500), vy: -(120 + Math.random() * 420), r: 0, vr: (Math.random() - 0.5) * 1500, t: 0 });
    for (let i = 0; i < 2; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;width:3px;height:3px;background:var(--y)`;
      layer.appendChild(p);
      g.debris.push({ el: p, x: 0, y: 0, vx: (Math.random() - 0.3) * 600, vy: (Math.random() - 0.5) * 600, r: 0, vr: 0, t: 0.8 });
    }
  };

  const destroy = (node: Text, o: number, ch: string, r: DOMRect, el: Element) => {
    const root = g.rootOf.get(node) || node;
    let rec = g.recs.get(root);
    if (!rec) {
      rec = { full: root.data, created: [] };
      g.recs.set(root, rec);
    }
    const mid = node.splitText(o);
    const after = mid.splitText(1);
    g.rootOf.set(after, root);
    const hole = document.createElement('span');
    hole.textContent = ch;
    hole.style.visibility = 'hidden';
    hole.setAttribute('data-noshoot', '');
    mid.replaceWith(hole);
    rec.created.push(hole, after);
    spawn(ch, r, el);
    if (!g.damaged) {
      g.damaged = true;
      sync();
    }
  };

  const hit = (x: number, y: number) => {
    const c = caretAt(x, y);
    if (!c || !c.node || c.node.nodeType !== Node.TEXT_NODE) return;
    const node = c.node as Text;
    const el = node.parentElement;
    if (!el || el.closest('[data-noshoot],button,script,style')) return;
    for (const o of [c.off, c.off - 1]) {
      if (o < 0 || o >= node.data.length) continue;
      const ch = node.data[o];
      if (/\s/.test(ch)) continue;
      const rg = document.createRange();
      rg.setStart(node, o);
      rg.setEnd(node, o + 1);
      const r = rg.getBoundingClientRect();
      if (x >= r.left - 1 && x <= r.right + 1 && y >= r.top - 2 && y <= r.bottom + 2) {
        destroy(node, o, ch, r, el);
        return;
      }
    }
  };

  const shotSound = createShotSound();

  const fire = (y: number) => {
    shotSound();
    const x = gun.getBoundingClientRect().left;
    const b = document.createElement('div');
    b.style.cssText = 'position:fixed;left:0;top:0;width:16px;height:3px;background:var(--acc);box-shadow:0 0 10px var(--acc);will-change:transform';
    layer.appendChild(b);
    g.bullets.push({ el: b, x, y });
    g.recoil = 8;
    g.flash = 1;
    if (!g.fired) {
      g.fired = true;
      sync();
    }
  };

  const restoreText = () => {
    g.recs.forEach((rec, root) => {
      rec.created.forEach((n) => (n as ChildNode).remove());
      root.data = rec.full;
    });
    g.recs.clear();
    g.rootOf = new WeakMap();
    g.damaged = false;
    sync();
  };

  const setArmed = (v: boolean) => {
    g.armed = v;
    html.toggleAttribute('data-armed', v);
    if (!v) {
      g.fired = false;
      restoreText();
    }
    sync();
  };

  gun.addEventListener('click', () => {
    if (!g.armed) setArmed(true);
  });
  $('[data-gun-reload]', ctrls)?.addEventListener('click', restoreText);
  $('[data-gun-exit]', ctrls)?.addEventListener('click', () => setArmed(false));

  window.addEventListener(
    'pointermove',
    (e) => {
      g.mx = e.clientX;
      g.my = e.clientY;
    },
    { passive: true },
  );
  // Capture phase: while armed, every click fires instead of navigating or opening cards.
  window.addEventListener(
    'click',
    (e) => {
      if (!g.armed || (e.target as Element).closest('[data-noshoot]')) return;
      e.preventDefault();
      e.stopPropagation();
      g.mx = e.clientX;
      g.my = e.clientY;
      fire(e.clientY);
    },
    true,
  );
  window.addEventListener('keydown', (e) => {
    if (!g.armed) return;
    if (e.key === 'Escape') setArmed(false);
    if (e.code === 'Space') {
      e.preventDefault();
      fire(g.my);
    }
  });

  let last = performance.now();
  const loop = (now: number) => {
    requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const wr = widget.getBoundingClientRect();
    const tx = g.armed ? g.mx - (wr.left + gun.offsetLeft + 4) : 0;
    const ty = g.armed ? g.my - (wr.top + gun.offsetTop + 8.5) : 0;
    g.dx += (tx - g.dx) * 0.45;
    g.dy += (ty - g.dy) * 0.45;
    g.recoil *= 0.8;
    gun.style.transform = `translate(${(g.dx + g.recoil).toFixed(2)}px,${g.dy.toFixed(2)}px)`;
    g.flash *= 0.7;
    flash.style.opacity = String(g.flash > 0.05 ? g.flash : 0);
    for (let i = g.bullets.length - 1; i >= 0; i--) {
      const b = g.bullets[i];
      const nx = b.x - 2400 * dt;
      for (let sx = b.x; sx > nx; sx -= 4) hit(sx, b.y);
      b.x = nx;
      b.el.style.transform = `translate(${nx}px,${b.y - 1}px)`;
      if (nx < -30) {
        b.el.remove();
        g.bullets.splice(i, 1);
      }
    }
    for (let i = g.debris.length - 1; i >= 0; i--) {
      const d = g.debris[i];
      d.t += dt;
      d.vy += 1600 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.r += d.vr * dt;
      d.el.style.transform = `translate(${d.x}px,${d.y}px) rotate(${d.r}deg)`;
      d.el.style.opacity = String(Math.max(0, 1 - Math.max(0, d.t - 1) / 0.6));
      if (d.t > 1.6) {
        d.el.remove();
        g.debris.splice(i, 1);
      }
    }
  };
  requestAnimationFrame(loop);
}
