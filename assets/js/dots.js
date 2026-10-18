/* CCS Commons: decorative dot field behind the page. Dots part around the pointer and settle back on springs.
   Purely decorative: aria-hidden, pointer-events none, no input is ever blocked.
   - Mouse and pen only. Touch screens and reduced motion get a still field.
   - The frame loop runs only while something is moving, then stops.
   No dependencies. */
(function () {
  'use strict';
  if (!window.requestAnimationFrame) return;

  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var still = mq('(prefers-reduced-motion: reduce)') || !mq('(hover: hover) and (pointer: fine)');

  var GAP = 30;          /* distance between dots */
  var DOT = 1.1;         /* resting radius */
  var REACH = 130;       /* how far the pointer's influence travels */
  var PUSH = 15;         /* how far a dot is pushed at the pointer */
  var STIFFNESS = 220;   /* spring: slightly underdamped, so dots settle with a hint of overshoot */
  var DAMPING = 20;
  var HEAT_UP = 14;      /* a dot lights up fast... */
  var HEAT_DOWN = 5;     /* ...and fades slower */

  var canvas = document.createElement('canvas');
  canvas.className = 'dots-bg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var w = 0, h = 0, n = 0;
  var bx, by, ox, oy, vx, vy, heat;
  var mx = -9999, my = -9999;
  var running = false, last = 0;
  var base = [93, 109, 101], acc = [11, 93, 69];

  function readColor(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    var m;
    if ((m = /^#([0-9a-f]{6})$/i.exec(v))) {
      var k = parseInt(m[1], 16);
      return [k >> 16 & 255, k >> 8 & 255, k & 255];
    }
    if ((m = /^#([0-9a-f]{3})$/i.exec(v))) {
      return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16)];
    }
    if ((m = /^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(v))) return [+m[1], +m[2], +m[3]];
    return fallback;
  }
  function readColors() {
    base = readColor('--muted', base);
    acc = readColor('--accent', acc);
  }

  function build() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = Math.ceil(w / GAP) + 1, rows = Math.ceil(h / GAP) + 1;
    var x0 = (w - (cols - 1) * GAP) / 2, y0 = (h - (rows - 1) * GAP) / 2;
    n = cols * rows;
    bx = new Float32Array(n); by = new Float32Array(n);
    ox = new Float32Array(n); oy = new Float32Array(n);
    vx = new Float32Array(n); vy = new Float32Array(n);
    heat = new Float32Array(n);
    for (var r = 0, i = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++, i++) { bx[i] = x0 + c * GAP; by[i] = y0 + r * GAP; }
    }
  }

  /* Advance every dot by dt seconds. Returns true while anything is still moving. */
  function step(dt) {
    var active = mx > -9000;
    var moving = active;
    var r2 = REACH * REACH;
    var up = Math.min(1, dt * HEAT_UP), down = Math.min(1, dt * HEAT_DOWN);
    for (var i = 0; i < n; i++) {
      var tx = 0, ty = 0, ht = 0;
      if (active) {
        var dx = bx[i] - mx, dy = by[i] - my, d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 0.01) {
          var d = Math.sqrt(d2), f = 1 - d / REACH;
          f = f * f * (3 - 2 * f);           /* smoothstep falloff */
          tx = dx / d * PUSH * f; ty = dy / d * PUSH * f; ht = f;
        }
      }
      vx[i] += (STIFFNESS * (tx - ox[i]) - DAMPING * vx[i]) * dt;
      vy[i] += (STIFFNESS * (ty - oy[i]) - DAMPING * vy[i]) * dt;
      ox[i] += vx[i] * dt; oy[i] += vy[i] * dt;
      heat[i] += (ht - heat[i]) * (ht > heat[i] ? up : down);
      if (!moving && (Math.abs(ox[i]) > 0.02 || Math.abs(oy[i]) > 0.02 || Math.abs(vx[i]) > 0.05 || Math.abs(vy[i]) > 0.05 || heat[i] > 0.01)) moving = true;
    }
    return moving;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    /* resting dots share one path and one fill; only dots near the pointer are drawn one by one */
    ctx.fillStyle = 'rgba(' + base[0] + ',' + base[1] + ',' + base[2] + ',0.2)';
    ctx.beginPath();
    var lit = [];
    for (var i = 0; i < n; i++) {
      if (heat[i] > 0.02) { lit.push(i); continue; }
      var x = bx[i] + ox[i], y = by[i] + oy[i];
      ctx.moveTo(x + DOT, y);
      ctx.arc(x, y, DOT, 0, 6.2832);
    }
    ctx.fill();
    for (var k = 0; k < lit.length; k++) {
      var j = lit[k], t = heat[j];
      var cr = Math.round(base[0] + (acc[0] - base[0]) * t);
      var cg = Math.round(base[1] + (acc[1] - base[1]) * t);
      var cb = Math.round(base[2] + (acc[2] - base[2]) * t);
      ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (0.2 + 0.65 * t).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(bx[j] + ox[j], by[j] + oy[j], DOT + 1.5 * t, 0, 6.2832);
      ctx.fill();
    }
  }

  function tick(t) {
    if (!last) last = t;                      /* first frame after a pause: no time has passed */
    var dt = Math.max(0, Math.min((t - last) / 1000, 1 / 30));
    last = t;
    var moving = step(dt);
    draw();
    if (moving) { requestAnimationFrame(tick); } else { running = false; }
  }
  function kick() {
    if (running) return;
    running = true;
    last = 0;
    requestAnimationFrame(tick);
  }

  readColors();
  build();
  draw();
  requestAnimationFrame(function () { canvas.classList.add('is-ready'); });

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { build(); draw(); }, 120);
  });
  function recolor() { readColors(); draw(); }
  if (window.matchMedia) {
    var dark = window.matchMedia('(prefers-color-scheme: dark)');
    if (dark.addEventListener) dark.addEventListener('change', recolor);
  }
  if (window.MutationObserver) {
    new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  if (still) return;

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    mx = e.clientX; my = e.clientY;
    kick();
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { mx = -9999; my = -9999; kick(); });
  window.addEventListener('blur', function () { mx = -9999; my = -9999; kick(); });
})();
