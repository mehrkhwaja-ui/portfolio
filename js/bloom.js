/**
 * bloom.js — interactive cursor-trail color bloom
 *
 * Invisible at rest. As the cursor (or finger) moves across the
 * canvas, it leaves a soft trail of blurred color blooms behind it,
 * cycling through the four brand colors, fading out shortly after.
 *
 * Drop a <canvas id="bloom-canvas"></canvas> inside a positioned
 * wrapper (see .hero-canvas-wrap in style.css) — the CSS handles the
 * blur/opacity that gives the blooms their soft, diffused look.
 */
(function () {
  const canvas = document.getElementById("bloom-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const palette = ["#303FFF", "#6643FF", "#DC5AA7", "#FFA33B"];

  let width = 0;
  let height = 0;
  let trail = [];
  let raf = null;
  const maxTrail = 24;
  let seed = 0;

  function hexToRgba(hex, a) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  function hash(i) {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (width === 0 || height === 0) return;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addPoint(x, y) {
    seed++;
    const idx = Math.floor(hash(seed) * palette.length) % palette.length;
    trail.push({ x: x, y: y, color: palette[idx], life: 1 });
    if (trail.length > maxTrail) trail.shift();
  }

  function draw() {
    if (width > 0 && height > 0) {
      ctx.clearRect(0, 0, width, height);
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.life *= 0.93;
        if (p.life < 0.02) {
          trail.splice(i, 1);
          continue;
        }
        const r = 70 + (1 - p.life) * 50;
        const alpha = 0.6 * p.life;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grad.addColorStop(0, hexToRgba(p.color, alpha));
        grad.addColorStop(1, hexToRgba(p.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    raf = requestAnimationFrame(draw);
  }

  function handleMove(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;
    addPoint(x, y);
  }

  // Gentle idle drift so the hero isn't completely static before a
  // visitor moves their cursor — a slow wandering point.
  let idleT = 0;
  let userActive = false;
  function idleTick() {
    if (!userActive && width > 0 && height > 0) {
      idleT += 0.004;
      const x = width * 0.5 + Math.sin(idleT) * width * 0.28;
      const y = height * 0.5 + Math.cos(idleT * 0.7) * height * 0.22;
      addPoint(x, y);
    }
  }
  setInterval(idleTick, 220);

  canvas.addEventListener("pointermove", function (e) {
    userActive = true;
    handleMove(e);
  });
  canvas.addEventListener("touchmove", function (e) {
    userActive = true;
    handleMove(e);
  }, { passive: true });
  canvas.addEventListener("pointerleave", function () {
    userActive = false;
  });

  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  });

  requestAnimationFrame(function tryInit() {
    resize();
    if (width === 0 || height === 0) {
      requestAnimationFrame(tryInit);
      return;
    }
    draw();
  });
})();
