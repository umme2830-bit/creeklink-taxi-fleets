/**
 * CreekLink — main.js
 * GSAP ScrollTrigger animations, count-up, micro-interactions
 * All animations wrapped in prefers-reduced-motion check.
 */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Hard fallback: if GSAP doesn't load in 4s, reveal everything ─────────
  var gsapFallbackTimer = setTimeout(revealAll, 4000);

  // ── Wait for GSAP to load ─────────────────────────────────────────────────
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initGSAP, 100);
      return;
    }
    clearTimeout(gsapFallbackTimer);
    gsap.registerPlugin(ScrollTrigger);
    if (!prefersReduced) runAnimations();
    else revealAll();
  }

  // ── Snap everything to final position (reduced motion / fallback) ─────────
  function revealAll() {
    document.querySelectorAll('.anim-fade-up, .anim-fade-left, .anim-fade-right').forEach(el => {
      el.style.transform = 'none';
    });
  }

  // ── Main animation suite ──────────────────────────────────────────────────
  function runAnimations() {

    // ── Scroll-triggered slide-up (position only — opacity stays 1 so text is always visible)
    gsap.utils.toArray('.anim-fade-up').forEach((el) => {
      gsap.fromTo(el,
        { y: 40 },
        {
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: parseFloat(el.style.animationDelay) || 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 100%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    });

    // ── Slide in from left
    gsap.utils.toArray('.anim-fade-left').forEach(el => {
      gsap.fromTo(el,
        { x: -50 },
        {
          x: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 100%', toggleActions: 'play none none none', once: true },
        }
      );
    });

    // ── Slide in from right
    gsap.utils.toArray('.anim-fade-right').forEach(el => {
      gsap.fromTo(el,
        { x: 50 },
        {
          x: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 100%', toggleActions: 'play none none none', once: true },
        }
      );
    });

    // ── Hero content entrance (stagger)
    const heroContent = document.getElementById('hero-content');
    if (heroContent) {
      gsap.from(heroContent.children, {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.4,
      });
    }

    // ── Taxi SVG slide-in from left
    const taxiEl = document.getElementById('taxi-svg');
    if (taxiEl) {
      gsap.to(taxiEl, {
        opacity: 0.65,
        x: '10vw',
        duration: 1.4,
        ease: 'power2.out',
        delay: 0.8,
      });
    }

    // ── Hero parallax on scroll
    const heroBg = document.querySelector('#hero');
    if (heroBg) {
      const heroContent2 = document.querySelector('#hero-content');
      if (heroContent2) {
        gsap.to(heroContent2, {
          y: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.3,
          },
        });
      }
    }

    // ── Count-up animation
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter() {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate() {
              el.textContent = Math.round(this.targets()[0].val) + suffix;
            },
            onComplete() {
              el.textContent = target + suffix;
            },
          });
        },
      });
    });

    // ── SVG route line draw on scroll (UK map outline)
    document.querySelectorAll('#uk-outline').forEach(path => {
      const len = path.getTotalLength ? path.getTotalLength() : 1000;
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2.5,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: path,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    });

    // ── Force ScrollTrigger to recalculate positions and fire any triggers
    //    already past their start point (handles above-the-fold cards on load)
    ScrollTrigger.refresh();

  }

  // ── Micro-interactions (always run, no motion needed) ────────────────────

  // Button hover lift (already handled via CSS but add glow via JS for older browsers)
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.boxShadow = '0 8px 24px rgba(244,180,0,0.35)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.boxShadow = '';
    });
  });

  // ── Form focus shimmer
  document.querySelectorAll('.ck-input, .ck-select').forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.ck-input-wrap')?.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.ck-input-wrap')?.classList.remove('focused');
    });
  });

  // ── Init
  document.addEventListener('DOMContentLoaded', initGSAP);

  // If DOM already loaded
  if (document.readyState !== 'loading') initGSAP();

})();
