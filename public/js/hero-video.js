/**
 * CreekLink — hero-video.js
 * 3D scroll animations for the video hero section.
 * Uses GSAP + ScrollTrigger.
 */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(init, 80);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    prefersReduced ? revealImmediate() : runHeroAnimations();
  }

  /* ── Instant reveal for reduced-motion ────────────────────────────────── */
  function revealImmediate() {
    ['#hero-label','#hero-h1-a','#hero-h1-b','#hero-sub',
     '#hero-ctas','#hero-trust','#hero-scroll-hint','#hero-accent-line','#hero-map-card'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
  }

  /* ── Full 3D animation suite ───────────────────────────────────────────── */
  function runHeroAnimations() {
    const video    = document.getElementById('hero-video');
    const content  = document.getElementById('hero-content');
    const accentLine = document.getElementById('hero-accent-line');

    /* ── 1. ENTRANCE — staggered 3D reveal on load ─────────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Accent gold line sweeps in first
    tl.to('#hero-accent-line', {
      opacity: 1, scaleX: 1, duration: 1.0, ease: 'power2.inOut',
    }, 0.2);

    // Label floats up
    tl.to('#hero-label', {
      opacity: 1, y: 0, duration: 0.7,
    }, 0.5);

    // H1 line 1 — 3D rotate-in from below the horizon
    tl.to('#hero-h1-a', {
      opacity: 1, y: 0, rotateX: 0,
      duration: 0.8, ease: 'power3.out',
    }, 0.65);

    // H1 line 2 — slight delay, same treatment
    tl.to('#hero-h1-b', {
      opacity: 1, y: 0, rotateX: 0,
      duration: 0.8, ease: 'power3.out',
    }, 0.82);

    // Subtext
    tl.to('#hero-sub', {
      opacity: 1, y: 0, z: 0, duration: 0.75,
    }, 1.0);

    // CTAs
    tl.to('#hero-ctas', {
      opacity: 1, y: 0, duration: 0.65,
    }, 1.15);

    // Trust badges
    tl.to('#hero-trust', {
      opacity: 1, y: 0, duration: 0.6,
    }, 1.3);

    // Scroll hint
    tl.to('#hero-scroll-hint', {
      opacity: 1, duration: 0.5,
    }, 1.6);

    // Hero map card entrance
    tl.to('#hero-map-card', {
      opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
    }, 1.1);

    /* ── 2. VIDEO slow-burn zoom on load (Ken Burns effect) ─────────────── */
    if (video) {
      gsap.fromTo(video,
        { scale: 1.08 },
        { scale: 1.0, duration: 3.5, ease: 'power1.out', delay: 0.1 }
      );
    }

    /* ── 3. SCROLL — 3D parallax as user scrolls past hero ──────────────── */
    const hero = document.getElementById('hero');
    if (!hero) return;

    // Video parallax — moves slower than scroll (depth effect)
    gsap.to('#hero-video', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });

    // Content — drifts upward + fades with 3D tilt
    gsap.to('#hero-content', {
      y: -120,
      opacity: 0,
      rotateX: 6,
      scale: 0.92,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '60% top',
        scrub: 0.8,
      },
    });

    // Accent line scales out as content fades
    gsap.to('#hero-accent-line', {
      scaleX: 0,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '40% top',
        scrub: 0.5,
      },
    });

    // Overlays deepen as section exits (cinematic fade-to-black)
    gsap.to('#hero', {
      '--hero-exit-dim': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: '50% top',
        end: 'bottom top',
        scrub: 0.4,
      },
    });

    // Scroll hint fades on first scroll
    gsap.to('#hero-scroll-hint', {
      opacity: 0,
      y: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: '5% top',
        end: '20% top',
        scrub: true,
      },
    });

    /* ── 4. MOUSE MOVE — subtle 3D tilt on the content block ────────────── */
    const stage = document.getElementById('hero-3d-stage');
    if (stage) {
      let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
      const STRENGTH = 6; // max degrees of tilt

      document.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        targetX = ((e.clientY - cy) / cy) * -STRENGTH; // rotateX
        targetY = ((e.clientX - cx) / cx) *  STRENGTH; // rotateY
      }, { passive: true });

      // Lerp loop for smooth follow
      (function lerpTilt() {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;

        // Only apply when hero is visible
        if (window.scrollY < window.innerHeight) {
          gsap.set(content, {
            rotateX: currentX,
            rotateY: currentY,
            transformStyle: 'preserve-3d',
          });
        }
        requestAnimationFrame(lerpTilt);
      })();

      // Reset tilt on mouse leave hero
      hero.addEventListener('mouseleave', () => {
        targetX = 0; targetY = 0;
      }, { passive: true });
    }

    /* ── 5. VIDEO — pause when off-screen (performance) ─────────────────── */
    if (video) {
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top bottom',
        end: 'bottom top',
        onEnter:      () => video.play().catch(() => {}),
        onLeave:      () => video.pause(),
        onEnterBack:  () => video.play().catch(() => {}),
        onLeaveBack:  () => video.pause(),
      });
    }
  }

  /* ── Boot ──────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
