/**
 * LiquidChrome — full-screen WebGL background
 * Pure WebGL, no external dependencies
 * Near-white silver ripple, opacity 0.12 — nearly invisible on white, subtle texture on dark
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  function init() {
    var canvas = document.createElement('canvas');
    var wrap   = document.createElement('div');
    wrap.id    = 'lc-bg';
    wrap.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;opacity:0.12;';
    wrap.appendChild(canvas);
    document.body.appendChild(wrap);

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) { wrap.remove(); return; }

    /* ── Vertex shader: full-screen triangle trick ── */
    var VERT = [
      'attribute vec2 p;',
      'varying vec2 vUv;',
      'void main(){',
      '  vUv = p * 0.5 + 0.5;',
      '  gl_Position = vec4(p, 0.0, 1.0);',
      '}'
    ].join('\n');

    /* ── Fragment shader: LiquidChrome ripple ── */
    var FRAG = [
      'precision highp float;',
      'uniform float uT;',
      'uniform vec2  uR;',
      'uniform vec3  uC;',
      'uniform float uA;',
      'uniform float uFx;',
      'uniform float uFy;',
      'uniform vec2  uM;',
      'varying vec2  vUv;',
      'void main(){',
      '  vec2 fc = vUv * uR;',
      '  vec2 uv = (2.0*fc - uR) / min(uR.x, uR.y);',
      '  for(float i=1.0; i<8.0; i++){',
      '    uv.x += uA/i * cos(i*uFx*uv.y + uT + uM.x*3.14159);',
      '    uv.y += uA/i * cos(i*uFy*uv.x + uT + uM.y*3.14159);',
      '  }',
      '  float s = max(abs(sin(uT - uv.y - uv.x)), 0.001);',
      '  vec3 col = uC / s;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    function mkShader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER,   VERT));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { wrap.remove(); return; }
    gl.useProgram(prog);

    /* Full-screen triangle (covers the entire clip space with 3 vertices) */
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var pLoc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(pLoc);
    gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

    /* Uniforms */
    var uT  = gl.getUniformLocation(prog, 'uT');
    var uR  = gl.getUniformLocation(prog, 'uR');
    var uC  = gl.getUniformLocation(prog, 'uC');
    var uA  = gl.getUniformLocation(prog, 'uA');
    var uFx = gl.getUniformLocation(prog, 'uFx');
    var uFy = gl.getUniformLocation(prog, 'uFy');
    var uM  = gl.getUniformLocation(prog, 'uM');

    /* Near-white silver: visible as subtle ripple on both white and dark pages */
    gl.uniform3f(uC,  0.88, 0.88, 0.88);
    gl.uniform1f(uA,  0.22);
    gl.uniform1f(uFx, 2.5);
    gl.uniform1f(uFy, 1.5);
    gl.uniform2f(uM,  0.5, 0.5);

    canvas.style.cssText = 'width:100%;height:100%;display:block;';

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uR, w, h);
    }
    window.addEventListener('resize', resize);
    resize();

    /* Mouse interactivity */
    document.addEventListener('mousemove', function (e) {
      gl.uniform2f(uM, e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
    });
    document.addEventListener('touchmove', function (e) {
      if (e.touches.length) {
        var t = e.touches[0];
        gl.uniform2f(uM, t.clientX / window.innerWidth, 1.0 - t.clientY / window.innerHeight);
      }
    }, { passive: true });

    /* Render loop — very slow speed for subtlety */
    var SPEED = 0.07;
    (function draw(t) {
      requestAnimationFrame(draw);
      gl.uniform1f(uT, t * 0.001 * SPEED);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    })(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
