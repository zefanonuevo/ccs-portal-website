/* CCS Commons: decorative network mesh behind every page (same effect as the TSG website).
   Dots drift and wander, thin lines join dots that come close, small packets travel along the lines,
   and a mouse or pen pointer lights up the dots near it. Colors come from --net-rgb and --net-pulse-rgb
   (tokens.css), so it follows the light and dark theme.
   Purely decorative: aria-hidden, pointer-events none, no input is ever blocked.
   - Reduced motion: a still picture, no animation.
   - Pointer reaction: mouse and pen only.
   - The frame loop pauses while the tab is hidden.
   No dependencies. Adapted from initNetwork in the TSG theme (assets/js/main.js). */
(function () {
  'use strict';
  if (!window.requestAnimationFrame) return;

  var bg = document.createElement('div');
  bg.className = 'ambient-bg';
  bg.setAttribute('aria-hidden', 'true');
  var canvas = document.createElement('canvas');
  canvas.id = 'ccs-network';
  bg.appendChild(canvas);
  document.body.prepend(bg);
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;

  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduceMotion = mq('(prefers-reduced-motion: reduce)');
  var LINK = 150;          /* max distance (px) at which two dots connect */
  var MOUSE_R = 170;       /* pointer influence radius */
  var w = 0, h = 0, nodes = [], packets = [];
  var rgb = '11,93,69', pulse = '18,134,79';
  var mouse = { x: -9999, y: -9999 };
  var last = 0, nextPacket = 0;

  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    rgb = (cs.getPropertyValue('--net-rgb') || rgb).replace(/\s/g, '') || rgb;
    pulse = (cs.getPropertyValue('--net-pulse-rgb') || pulse).replace(/\s/g, '') || pulse;
  }

  function seed() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.max(26, Math.min(90, Math.round((w * h) / 15000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 5 + Math.random() * 9;           /* px per second */
      nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 1.2 + Math.random() * 1.4 });
    }
    packets = [];
  }

  function dist(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function spawnPacket() {
    if (packets.length >= 7) return;
    var a = nodes[(Math.random() * nodes.length) | 0];
    var near = [];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] !== a && dist(a, nodes[i]) < LINK) near.push(nodes[i]);
    }
    if (near.length) packets.push({ a: a, b: near[(Math.random() * near.length) | 0], t: 0, speed: 0.55 + Math.random() * 0.5 });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var i, j, a, b, d, alpha;

    ctx.lineWidth = 1;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        d = dist(a, b);
        if (d < LINK) {
          alpha = (1 - d / LINK) * 0.3;
          ctx.strokeStyle = 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      d = dist(a, mouse);
      var glow = d < MOUSE_R ? 1 - d / MOUSE_R : 0;
      if (glow > 0) {
        ctx.strokeStyle = 'rgba(' + rgb + ',' + (glow * 0.38).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(' + rgb + ',' + (0.55 + glow * 0.4).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r + glow * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    for (i = 0; i < packets.length; i++) {
      var p = packets[i];
      var px = p.a.x + (p.b.x - p.a.x) * p.t;
      var py = p.a.y + (p.b.y - p.a.y) * p.t;
      var fade = Math.sin(Math.PI * p.t);
      ctx.fillStyle = 'rgba(' + pulse + ',' + (0.16 * fade).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(' + pulse + ',' + (0.95 * fade).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step(now) {
    requestAnimationFrame(step);
    if (document.hidden) { last = now; return; }

    var dt = Math.min(50, now - (last || now)) / 1000;
    last = now;

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
    }

    for (var k = packets.length - 1; k >= 0; k--) {
      var p = packets[k];
      var len = Math.max(dist(p.a, p.b), 40);
      p.t += dt * p.speed * (120 / len);
      if (p.t >= 1 || len > LINK * 1.3) packets.splice(k, 1);
    }
    if (now > nextPacket) { spawnPacket(); nextPacket = now + 650 + Math.random() * 700; }

    draw();
  }

  readColors();
  seed();
  draw();
  requestAnimationFrame(function () { bg.classList.add('is-ready'); });

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { seed(); draw(); }, 150);
  });

  /* Follow the theme: the data-theme switch and the system light/dark setting. */
  function recolor() { readColors(); if (reduceMotion) draw(); }
  if (window.MutationObserver) {
    new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  if (window.matchMedia) {
    var dark = window.matchMedia('(prefers-color-scheme: dark)');
    if (dark.addEventListener) dark.addEventListener('change', recolor);
  }

  if (reduceMotion) return;

  if (mq('(hover: hover) and (pointer: fine)')) {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });
    window.addEventListener('blur', function () { mouse.x = mouse.y = -9999; });
  }

  requestAnimationFrame(step);
})();
