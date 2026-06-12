/**
 * BorderGlow — vanilla JS port of the React Bits component
 * Auto-initialises on all .ck-card, .flip-card-front, .flip-card-back elements.
 *
 * Data attributes on each card override defaults:
 *   data-bg="..."          backgroundColor
 *   data-glow="..."        glowColor  (H S L as "40 80 80")
 *   data-sensitivity="..."  edgeSensitivity
 *   data-glow-radius="..."  glowRadius
 *   data-intensity="..."    glowIntensity
 *   data-cone="..."         coneSpread
 *   data-colors="..."       JSON array of 3 hex colors
 *   data-animated           run intro sweep on mount
 */
(function () {
  'use strict';

  /* ── Color token helpers ─────────────────────────────────────────────── */
  function parseHSL(hslStr) {
    const m = String(hslStr).match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
    if (!m) return { h: 40, s: 80, l: 80 };
    return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
  }

  function buildGlowVars(glowColor, intensity) {
    const { h, s, l } = parseHSL(glowColor);
    const base = `${h}deg ${s}% ${l}%`;
    const opacities = [100, 60, 50, 40, 30, 20, 10];
    const keys      = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
    const vars = {};
    for (let i = 0; i < opacities.length; i++) {
      vars[`--glow-color${keys[i]}`] =
        `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
    }
    return vars;
  }

  const POSITIONS  = ['80% 55%','69% 34%','8% 6%','41% 38%','86% 85%','82% 18%','51% 4%'];
  const GRAD_KEYS  = ['--gradient-one','--gradient-two','--gradient-three','--gradient-four','--gradient-five','--gradient-six','--gradient-seven'];
  const COLOR_MAP  = [0, 1, 2, 0, 1, 2, 1];

  function buildGradientVars(colors) {
    const vars = {};
    for (let i = 0; i < 7; i++) {
      const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      vars[GRAD_KEYS[i]] = `radial-gradient(at ${POSITIONS[i]}, ${c} 0px, transparent 50%)`;
    }
    vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
    return vars;
  }

  /* ── Easing ─────────────────────────────────────────────────────────── */
  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const easeIn  = x => x * x * x;

  function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOut, onUpdate, onEnd }) {
    const kick = () => {
      const t0 = performance.now();
      const tick = () => {
        const t = Math.min((performance.now() - t0) / duration, 1);
        onUpdate(start + (end - start) * ease(t));
        if (t < 1) requestAnimationFrame(tick);
        else if (onEnd) onEnd();
      };
      requestAnimationFrame(tick);
    };
    delay ? setTimeout(kick, delay) : kick();
  }

  /* ── Geometry helpers ───────────────────────────────────────────────── */
  function center(el) {
    const r = el.getBoundingClientRect();
    return [r.width / 2, r.height / 2];
  }

  function edgeProximity(el, x, y) {
    const [cx, cy] = center(el);
    const dx = x - cx, dy = y - cy;
    let kx = Infinity, ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function cursorAngle(el, x, y) {
    const [cx, cy] = center(el);
    const dx = x - cx, dy = y - cy;
    if (!dx && !dy) return 0;
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg;
  }

  /* ── Apply all CSS vars to a card element ───────────────────────────── */
  function applyVars(el, vars) {
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  }

  /* ── DOM injection — wraps existing children in .border-glow-inner ─── */
  function injectStructure(card) {
    // Skip if already initialised
    if (card.dataset.bgInit) return;
    card.dataset.bgInit = '1';

    // Wrap existing children in .border-glow-inner
    const inner = document.createElement('div');
    inner.className = 'border-glow-inner';
    // Move all current children into inner
    while (card.firstChild) inner.appendChild(card.firstChild);
    card.appendChild(inner);

    // Prepend edge-light span
    const edgeLight = document.createElement('span');
    edgeLight.className = 'edge-light';
    card.insertBefore(edgeLight, card.firstChild);
  }

  /* ── Main init function for one card ────────────────────────────────── */
  function initCard(card, overrides = {}) {
    injectStructure(card);
    card.classList.add('border-glow-card');

    // Config: merge defaults → per-card data attrs → call-site overrides
    const cfg = {
      edgeSensitivity: 30,
      glowColor:       '43 85 68',     // warm amber-gold (hue from #F4B400)
      backgroundColor: '#12100D',
      borderRadius:    16,
      glowRadius:      40,
      glowIntensity:   1.1,
      coneSpread:      25,
      fillOpacity:     0.45,
      animated:        card.hasAttribute('data-animated'),
      colors:          ['#F4B400', '#C9A84C', '#D4A94E'],
      ...overrides,
    };

    // Data-attribute overrides
    if (card.dataset.bg)          cfg.backgroundColor = card.dataset.bg;
    if (card.dataset.glow)        cfg.glowColor       = card.dataset.glow;
    if (card.dataset.sensitivity) cfg.edgeSensitivity = Number(card.dataset.sensitivity);
    if (card.dataset.glowRadius)  cfg.glowRadius      = Number(card.dataset.glowRadius);
    if (card.dataset.intensity)   cfg.glowIntensity   = Number(card.dataset.intensity);
    if (card.dataset.cone)        cfg.coneSpread      = Number(card.dataset.cone);
    if (card.dataset.colors) {
      try { cfg.colors = JSON.parse(card.dataset.colors); } catch (_) {}
    }

    // Set static CSS vars
    applyVars(card, {
      '--card-bg':          cfg.backgroundColor,
      '--edge-sensitivity': cfg.edgeSensitivity,
      '--border-radius':    `${cfg.borderRadius}px`,
      '--glow-padding':     `${cfg.glowRadius}px`,
      '--cone-spread':      cfg.coneSpread,
      '--fill-opacity':     cfg.fillOpacity,
      ...buildGlowVars(cfg.glowColor, cfg.glowIntensity),
      ...buildGradientVars(cfg.colors),
    });

    // Pointer move handler
    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--edge-proximity', (edgeProximity(card, x, y) * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', `${cursorAngle(card, x, y).toFixed(3)}deg`);
    };

    card.addEventListener('pointermove', onMove, { passive: true });

    // Intro sweep
    if (cfg.animated) {
      const A_START = 110, A_END = 465;
      card.classList.add('sweep-active');
      card.style.setProperty('--cursor-angle', `${A_START}deg`);

      animateValue({ duration: 500, onUpdate: v =>
        card.style.setProperty('--edge-proximity', v) });

      animateValue({ ease: easeIn, duration: 1500, end: 50, onUpdate: v =>
        card.style.setProperty('--cursor-angle',
          `${(A_END - A_START) * (v / 100) + A_START}deg`) });

      animateValue({ ease: easeOut, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v =>
        card.style.setProperty('--cursor-angle',
          `${(A_END - A_START) * (v / 100) + A_START}deg`) });

      animateValue({ ease: easeIn, delay: 2500, duration: 1500, start: 100, end: 0,
        onUpdate: v => card.style.setProperty('--edge-proximity', v),
        onEnd:    () => card.classList.remove('sweep-active'),
      });
    }
  }

  /* ── Auto-init: attach to all cards in the document ─────────────────── */
  function autoInit() {
    // ── Feature + testimonial cards (home) ──────────────────────────────
    document.querySelectorAll('.ck-card').forEach((card, i) => {
      const isTestimonial = card.querySelector('.flex.items-center.gap-3') !== null;
      initCard(card, {
        animated:     i < 3, // first 3 feature cards get intro sweep
        glowColor:    isTestimonial ? '43 72 55' : '43 85 68',
        colors:       isTestimonial
          ? ['#C9A84C', '#F4B400', '#2E2820']
          : ['#F4B400', '#C9A84C', '#D4A94E'],
        glowIntensity: isTestimonial ? 0.9 : 1.1,
      });
    });

    // ── Dark background cards (feature strip, vision/mission, why-choose-us)
    document.querySelectorAll(
      '.card-dark:not(.border-glow-card):not(.flip-card-front):not(.flip-card-back)'
    ).forEach(card => {
      initCard(card, {
        backgroundColor: '#0D0B08',
        colors:          ['#F4B400', '#C9A84C', '#D4A94E'],
        glowColor:       '43 85 68',
        glowIntensity:   1.1,
        borderRadius:    12,
        glowRadius:      36,
        fillOpacity:     0.35,
      });
    });

    // ── Flip card OUTER wrappers (services page) ─────────────────────────
    // NOTE: Never apply border-glow-card to .flip-card-front/.flip-card-back —
    // their transform: translate3d + isolation:isolate break backface-visibility.
    // Instead glow the outer .flip-card container safely.
    document.querySelectorAll('.flip-card').forEach(card => {
      if (card.dataset.bgInit) return;
      card.dataset.bgInit = '1';
      applyVars(card, {
        ...buildGlowVars('43 85 68', 1.1),
        ...buildGradientVars(['#F4B400', '#D4A94E', '#C9A84C']),
        '--edge-sensitivity': 28,
        '--border-radius':    '12px',
        '--glow-padding':     '36px',
        '--cone-spread':      25,
        '--fill-opacity':     0,   // no fill on flip container — just the glow ring
        '--card-bg':          'transparent',
      });

      // Add edge-light to the outer wrapper (no inner wrap injection needed)
      const edgeLight = document.createElement('span');
      edgeLight.className = 'edge-light';
      edgeLight.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:10;border-radius:12px;';
      card.style.position = 'relative';
      card.appendChild(edgeLight);

      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        card.style.setProperty('--edge-proximity', (edgeProximity(card, x, y) * 100).toFixed(3));
        card.style.setProperty('--cursor-angle', `${cursorAngle(card, x, y).toFixed(3)}deg`);
      }, { passive: true });
    });

    // ── Stat tiles (about page) ─────────────────────────────────────────
    document.querySelectorAll('[class*="bg-ck-card border border-ck-border rounded-xl p-6"]').forEach(card => {
      if (!card.classList.contains('border-glow-card')) {
        initCard(card, {
          colors:       ['#C9A84C', '#F4B400', '#D4A94E'],
          glowColor:    '43 80 60',
          glowIntensity: 0.9,
          borderRadius: 12,
        });
      }
    });

    // ── Info cards (contact, login, dashboard) ─────────────────────────
    document.querySelectorAll('.bg-ck-card.border.border-ck-gold.rounded-2xl, .bg-ck-card.border.border-ck-gold.rounded-xl').forEach(card => {
      if (!card.classList.contains('border-glow-card')) {
        initCard(card, {
          colors:        ['#C9A84C', '#D4A94E', '#F4B400'],
          glowColor:     '43 72 55',
          glowIntensity: 1.3,
          borderRadius:  16,
          animated:      true,
        });
      }
    });

    // ── Success banners ─────────────────────────────────────────────────
    document.querySelectorAll('.border-ck-yellow\\/40').forEach(card => {
      if (!card.classList.contains('border-glow-card') && card.tagName !== 'DIV') return;
      if (!card.classList.contains('border-glow-card')) {
        initCard(card, {
          colors:        ['#F4B400', '#C9A84C', '#D4A94E'],
          glowColor:     '43 85 68',
          glowIntensity: 1.4,
          animated:      true,
        });
      }
    });

    // ── Any remaining cards with border-ck-border we may have missed ───
    document.querySelectorAll(
      '.bg-ck-card:not(.border-glow-card):not(.flip-card-front):not(.flip-card-back)'
    ).forEach(card => {
      initCard(card, {
        colors:       ['#F4B400', '#C9A84C', '#D4A94E'],
        glowColor:    '43 85 68',
        glowIntensity: 1.0,
        borderRadius: 12,
      });
    });

    // ── Hero UK map card [data-glow] — uses glass-card dark bg ───────────
    document.querySelectorAll('[data-glow]:not(.border-glow-card)').forEach(card => {
      initCard(card, {
        animated:      true,
        cardBg:        '#1a1610',
        colors:        ['#F4B400', '#C9A84C', '#D4A94E'],
        glowColor:     '40 80 80',
        glowIntensity: 1.2,
        borderRadius:  16,
      });
    });
  }

  /* ── Run after DOM ready ─────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})();
