/**
 * TiltedCard — vanilla JS port of the React Bits component
 * No external dependencies. Implements spring physics matching:
 *   { damping: 30, stiffness: 100, mass: 2 }  (card tilt + scale)
 *   { damping: 30, stiffness: 350, mass: 1 }  (tooltip rotation)
 *
 * Applied to:
 *   .card-dark   — feature strip, vision/mission, pillars
 *   .ck-card     — testimonials, stat cards
 * Skips .flip-card-front / .flip-card-back (have their own 3D context)
 *
 * Optional per-card data attributes:
 *   data-tilt-amplitude="12"   how far the card tilts (degrees)
 *   data-tilt-scale="1.05"     scale on hover
 *   data-caption="..."         enables floating tooltip with this text
 */
(function () {
  'use strict';

  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Minimal spring physics ──────────────────────────────────────────── */
  function Spring(cfg, initial) {
    this.k   = cfg.stiffness;
    this.c   = cfg.damping;
    this.m   = cfg.mass;
    this.pos = initial !== undefined ? initial : 0;
    this.tgt = this.pos;
    this.vel = 0;
  }
  Spring.prototype.to = function (v) { this.tgt = v; };
  Spring.prototype.tick = function (dt) {
    var a = (-this.k * (this.pos - this.tgt) - this.c * this.vel) / this.m;
    this.vel += a * dt;
    this.pos += this.vel * dt;
    if (Math.abs(this.pos - this.tgt) < 0.0005 && Math.abs(this.vel) < 0.0005) {
      this.pos = this.tgt;
      this.vel = 0;
      return true; // settled
    }
    return false;
  };

  var TILT_CFG    = { stiffness: 100, damping: 30, mass: 2 };
  var TOOLTIP_CFG = { stiffness: 350, damping: 30, mass: 1 };
  var FADE_CFG    = { stiffness: 80,  damping: 20, mass: 1 };

  /* ── Init one card ───────────────────────────────────────────────────── */
  function initTilt(el, overrides) {
    if (el.dataset.tiltInit) return;
    el.dataset.tiltInit = '1';
    el.classList.add('tilt-card');

    var amplitude  = parseFloat(el.dataset.tiltAmplitude || (overrides && overrides.amplitude) || 12);
    var scaleHover = parseFloat(el.dataset.tiltScale     || (overrides && overrides.scaleOnHover) || 1.05);
    var caption    = el.dataset.caption || '';

    var rX = new Spring(TILT_CFG);
    var rY = new Spring(TILT_CFG);
    var sc = new Spring(TILT_CFG, 1); sc.tgt = 1;

    var tRot = new Spring(TOOLTIP_CFG);
    var tOpa = new Spring(FADE_CFG);

    /* Tooltip DOM (only if data-caption present) */
    var tip = null;
    var tipX = 0, tipY = 0;
    if (caption) {
      tip = document.createElement('span');
      tip.className = 'tilt-tooltip';
      tip.textContent = caption;
      document.body.appendChild(tip);
    }

    var rafId   = null;
    var hovered = false;
    var lastOY  = 0;

    function applyTransform() {
      el.style.transform =
        'perspective(800px) rotateX(' + rX.pos.toFixed(3) + 'deg)' +
        ' rotateY(' + rY.pos.toFixed(3) + 'deg)' +
        ' scale(' + sc.pos.toFixed(4) + ')';

      if (tip) {
        tip.style.transform =
          'translate(' + (tipX + 14).toFixed(1) + 'px,' +
          (tipY + 10).toFixed(1) + 'px)' +
          ' rotate(' + tRot.pos.toFixed(2) + 'deg)';
        tip.style.opacity = tOpa.pos.toFixed(3);
      }
    }

    function loop() {
      var dt = 1 / 60;
      var s1 = rX.tick(dt);
      var s2 = rY.tick(dt);
      var s3 = sc.tick(dt);
      var s4 = tRot.tick(dt);
      var s5 = tOpa.tick(dt);

      applyTransform();

      if (s1 && s2 && s3 && s4 && s5) {
        rafId = null;
        if (!hovered) {
          el.style.transform = '';    // revert to CSS rule
          if (tip) tip.style.opacity = '0';
        }
      } else {
        rafId = requestAnimationFrame(loop);
      }
    }

    function start() { if (!rafId) rafId = requestAnimationFrame(loop); }

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var ox = e.clientX - rect.left - rect.width  / 2;
      var oy = e.clientY - rect.top  - rect.height / 2;

      rX.to((oy / (rect.height / 2)) * -amplitude);
      rY.to((ox / (rect.width  / 2)) *  amplitude);

      if (tip) {
        tipX = e.clientX;
        tipY = e.clientY;
        tRot.to(-(oy - lastOY) * 0.5);
      }
      lastOY = oy;

      start();
    }, { passive: true });

    el.addEventListener('mouseenter', function () {
      hovered = true;
      sc.to(scaleHover);
      if (tip) tOpa.to(1);
      start();
    });

    el.addEventListener('mouseleave', function () {
      hovered = false;
      rX.to(0); rY.to(0); sc.to(1);
      if (tip) { tOpa.to(0); tRot.to(0); }
      start();
    });
  }

  /* ── Auto-init all card types ────────────────────────────────────────── */
  function autoInit() {
    /* Dark cards — feature strip, vision/mission, why-choose-us pillars */
    document.querySelectorAll(
      '.card-dark:not(.flip-card-front):not(.flip-card-back):not([data-tilt-init])'
    ).forEach(function (el) {
      initTilt(el, { amplitude: 10, scaleOnHover: 1.04 });
    });

    /* Light cards — testimonials, stat tiles, info cards */
    document.querySelectorAll(
      '.ck-card:not([data-tilt-init])'
    ).forEach(function (el) {
      initTilt(el, { amplitude: 8, scaleOnHover: 1.03 });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})();
