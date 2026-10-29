import { FS, VS } from './gridShader';
import type { Media } from '../data/portfolio';

const CELL_SIZE = 32;
const INTENSITY = 1;
const FLICKER = true;

const html = document.documentElement;
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const pad = (n: number, len = 2) => String(n).padStart(len, '0');
const isLight = () => html.dataset.theme === 'light';
const isArmed = () => html.hasAttribute('data-armed');

const root = $('[data-fc]');
if (root) {
  initClock();
  initTheme();
  initExperience();
  initModal();
  initGun();
  initGrid(Number(root.dataset.hue) || 0.36);
}

function initClock() {
  const el = $('[data-clock]');
  if (!el) return;
  const tick = () => (el.textContent = new Date().toTimeString().slice(0, 8));
  tick();
  setInterval(tick, 1000);
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
    if (label) label.textContent = open ? 'less' : 'info';
  });
}

/* ---------- project modal (YouTube embed or local gallery) ---------- */

interface ModalProject {
  title: string;
  yt?: string;
  ig?: string;
  media?: Media[];
}

function initModal() {
  const modal = $('[data-modal]');
  const stage = $('[data-modal-stage]');
  if (!modal || !stage) return;
  const title = $('[data-modal-title]')!;
  const ext = $<HTMLAnchorElement>('[data-modal-ext]')!;
  const nav = $('[data-modal-nav]')!;
  const caption = $('[data-modal-caption]')!;
  const count = $('[data-modal-count]')!;
  const closeBtn = $<HTMLButtonElement>('[data-modal-close]')!;

  let projects: Record<string, ModalProject> = {};
  try {
    projects = JSON.parse($('#fc-projects')?.textContent || '{}');
  } catch {}

  let cur: ModalProject | null = null;
  let idx = 0;
  let returnFocus: HTMLElement | null = null;

  const render = () => {
    if (!cur) return;
    stage.replaceChildren();
    // Instagram embeds are portrait, so the stage switches shape for them.
    stage.classList.toggle('is-ig', !!cur.ig);
    if (cur.yt || cur.ig) {
      const f = document.createElement('iframe');
      f.title = cur.title;
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      if (cur.yt) {
        f.src = `https://www.youtube-nocookie.com/embed/${cur.yt}?autoplay=1&rel=0`;
        ext.href = `https://www.youtube.com/watch?v=${cur.yt}`;
        ext.textContent = 'youtube ↗';
      } else {
        f.src = `${cur.ig}embed/`;
        ext.href = cur.ig!;
        ext.textContent = 'instagram ↗';
      }
      stage.append(f);
      nav.hidden = true;
      return;
    }
    const media = cur.media ?? [];
    const m = media[idx];
    if (!m) return;
    if (m.type === 'video') {
      const v = document.createElement('video');
      v.src = m.src;
      if (m.poster) v.poster = m.poster;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      stage.append(v);
    } else {
      const img = document.createElement('img');
      img.src = m.src;
      img.alt = m.caption ? `${cur.title} · ${m.caption}` : cur.title;
      stage.append(img);
    }
    ext.href = m.src;
    ext.textContent = 'open ↗';
    nav.hidden = media.length < 2;
    caption.textContent = m.caption ?? '';
    count.textContent = `${pad(idx + 1)}/${pad(media.length)}`;
    // Warm up the neighbours so stepping through a sequence feels instant.
    [idx + 1, idx - 1].forEach((k) => {
      const n = media[(k + media.length) % media.length];
      if (n?.type === 'image') new Image().src = n.src;
    });
  };

  const step = (dir: number) => {
    const len = cur?.media?.length ?? 0;
    if (len < 2) return;
    idx = (idx + dir + len) % len;
    render();
  };

  const open = (pid: string | undefined) => {
    if (isArmed() || !pid || !projects[pid]) return;
    cur = projects[pid];
    idx = 0;
    title.textContent = cur.title;
    returnFocus = document.activeElement as HTMLElement | null;
    modal.hidden = false;
    render();
    closeBtn.focus();
  };

  const close = () => {
    if (!cur) return;
    cur = null;
    modal.hidden = true;
    stage.replaceChildren();
    returnFocus?.focus();
  };

  document.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if ((e.target as Element).closest('a')) return;
      open(card.dataset.pid);
    });
    const thumb = $('[data-card-open]', card);
    thumb?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(card.dataset.pid);
      }
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  closeBtn.addEventListener('click', close);
  $('[data-modal-prev]')?.addEventListener('click', () => step(-1));
  $('[data-modal-next]')?.addEventListener('click', () => step(1));
  window.addEventListener('keydown', (e) => {
    if (!cur) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
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
    cv.width = Math.round(innerWidth * dpr);
    cv.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
  };
  resize();
  window.addEventListener('resize', resize);

  const m = { x: innerWidth * 0.7, y: innerHeight * 0.4 };
  const s = { ...m };
  const t = { ...m };
  window.addEventListener(
    'pointermove',
    (e) => {
      m.x = e.clientX;
      m.y = e.clientY;
    },
    { passive: true },
  );

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coord = $('[data-hud-coord]');
  const hueEl = $('[data-hud-hue]');
  const t0 = performance.now();
  let light = isLight() ? 1 : 0;
  let lastHud = 0;

  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (document.hidden) return;
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
    gl.uniform1f(U.uInt, INTENSITY);
    gl.uniform1f(U.uPx, dpr);
    gl.uniform1f(U.uLight, light);
    gl.uniform1f(U.uFlick, FLICKER && !reduce ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (now - lastHud > 80) {
      lastHud = now;
      if (coord) coord.textContent = `${pad(Math.round(m.x), 4)},${pad(Math.round(m.y), 4)}`;
      if (hueEl) hueEl.textContent = pad(Math.round(((hue + (m.x / innerWidth) * 0.3 + (m.y / innerHeight) * 0.12) % 1) * 360), 3);
    }
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
