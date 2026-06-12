/**
 * CreekLink — hero3d.js
 * Three.js animated UK map mesh with golden route line.
 * Lazy-initialised only after hero canvas enters viewport.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Wait for Three.js CDN to load ────────────────────────────────────────
  function waitForThree(cb, tries = 0) {
    if (typeof THREE !== 'undefined') { cb(); return; }
    if (tries > 40) return; // give up after 4s
    setTimeout(() => waitForThree(cb, tries + 1), 100);
  }

  // ── Init via IntersectionObserver (lazy) ──────────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        observer.disconnect();
        waitForThree(initScene);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(canvas);

  // ── Three.js scene ───────────────────────────────────────────────────────
  function initScene() {
    const W = canvas.offsetWidth  || window.innerWidth;
    const H = canvas.offsetHeight || window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Scene + camera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    camera.position.set(0, 0, 28);

    // ── Ambient + point lights
    scene.add(new THREE.AmbientLight(0x1a1610, 3));
    const ptLight = new THREE.PointLight(0xF4B400, 1.2, 80);
    ptLight.position.set(0, 10, 15);
    scene.add(ptLight);

    // ── UK Map mesh — simplified icosphere representing geography
    const mapGeo = new THREE.SphereGeometry(8, 16, 12);
    // Deform vertices to rough UK silhouette feel
    const pos = mapGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const noise = Math.sin(x * 1.3) * Math.cos(y * 0.9) * 0.6;
      pos.setXYZ(i, x + noise * 0.3, y + noise * 0.2, z);
    }
    mapGeo.computeVertexNormals();

    const mapMat = new THREE.MeshStandardMaterial({
      color: 0x1A1610,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const mapMesh = new THREE.Mesh(mapGeo, mapMat);
    mapMesh.rotation.x = 0.3;
    scene.add(mapMesh);

    // ── Particle star field (dot grid feel)
    const starCount = 120;
    const starGeo   = new THREE.BufferGeometry();
    const starPos   = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 60;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat  = new THREE.PointsMaterial({ color: 0xC9A84C, size: 0.12, transparent: true, opacity: 0.55 });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Golden route line (TubeGeometry along UK city points)
    const routePoints = [
      new THREE.Vector3(-2, -6, 0),   // London
      new THREE.Vector3(-3.5, -1, 0), // Birmingham
      new THREE.Vector3(-4, 2, 0),    // Manchester
      new THREE.Vector3(-3.5, 4, 0),  // Leeds
      new THREE.Vector3(-4, 6.5, 0),  // Edinburgh
      new THREE.Vector3(-5, 8, 0),    // Glasgow
    ];

    const curve    = new THREE.CatmullRomCurve3(routePoints, false, 'catmullrom', 0.4);
    const tubeGeo  = new THREE.TubeGeometry(curve, 60, 0.04, 6, false);
    const tubeMat  = new THREE.MeshBasicMaterial({ color: 0xF4B400, transparent: true, opacity: 0 });
    const routeTube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(routeTube);

    // City dot markers
    const dotGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xF4B400, transparent: true, opacity: 0 });
    const dots   = routePoints.map(p => {
      const d = new THREE.Mesh(dotGeo, dotMat.clone());
      d.position.copy(p);
      scene.add(d);
      return d;
    });

    // ── Animate route line drawing in
    if (!prefersReduced) {
      let elapsed = 0;
      const drawDuration = 2.2; // seconds

      function drawRoute(delta) {
        elapsed += delta;
        const t = Math.min(elapsed / drawDuration, 1);
        // Reveal by opacity
        routeTube.material.opacity = t * 0.85;
        dots.forEach((d, i) => {
          const threshold = (i / dots.length) * 0.9;
          d.material.opacity = t > threshold ? Math.min((t - threshold) / 0.1, 1) * 0.9 : 0;
        });
        return t >= 1;
      }

      // ── Render loop
      const clock = new THREE.Clock();
      let animating = true;
      let drawDone  = false;

      function animate() {
        if (!animating) return;
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsed2 = clock.getElapsedTime();

        if (!drawDone) drawDone = drawRoute(delta);

        // Slow mesh rotation
        mapMesh.rotation.y += 0.0008;
        mapMesh.rotation.x = 0.3 + Math.sin(elapsed2 * 0.2) * 0.05;

        // Route tube subtle float
        routeTube.position.y = Math.sin(elapsed2 * 0.3) * 0.15;

        // Point light pulse
        ptLight.intensity = 1.2 + Math.sin(elapsed2 * 1.5) * 0.2;

        renderer.render(scene, camera);
      }

      animate();

      // Pause when tab hidden (perf)
      document.addEventListener('visibilitychange', () => {
        animating = !document.hidden;
        if (animating) animate();
      });

    } else {
      // Reduced motion: static render
      routeTube.material.opacity = 0.85;
      dots.forEach(d => { d.material.opacity = 0.9; });
      renderer.render(scene, camera);
    }

    // ── Resize handler
    window.addEventListener('resize', () => {
      const nW = canvas.offsetWidth  || window.innerWidth;
      const nH = canvas.offsetHeight || window.innerHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    }, { passive: true });
  }

})();
