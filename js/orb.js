/**
 * orb.js - the mouse cursor is replaced, full stop, by a small glowing
 * orb that tracks the pointer closely and slowly cycles through the
 * brand palette as the person moves around the page. Home page only.
 */
(function () {
  const canvas = document.getElementById("bloom-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const palette = ["#303FFF", "#6643FF", "#DC5AA7", "#FFA33B", "#34A65B", "#E8543F", "#F2C94C"];

  function hexToRgb(hex) {
    const c = hex.replace("#", "");
    return {
      r: parseInt(c.substring(0, 2), 16),
      g: parseInt(c.substring(2, 4), 16),
      b: parseInt(c.substring(4, 6), 16),
    };
  }
  const rgbPalette = palette.map(hexToRgb);

  let width = 0;
  let height = 0;
  const pos = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let colorT = 0;
  let idleT = 0;
  let userActive = false;
  let hasPointer = false;
  let lastX = 0, lastY = 0;

  function currentColor() {
    const n = rgbPalette.length;
    const i = Math.floor(colorT) % n;
    const j = (i + 1) % n;
    const f = colorT - Math.floor(colorT);
    const a = rgbPalette[i];
    const b = rgbPalette[j];
    return {
      r: a.r + (b.r - a.r) * f,
      g: a.g + (b.g - a.g) * f,
      b: a.b + (b.b - a.b) * f,
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    if (width > 0 && height > 0) {
      ctx.clearRect(0, 0, width, height);

      if (!userActive) {
        idleT += 0.0015;
        target.x = width * 0.5 + Math.sin(idleT) * width * 0.32;
        target.y = height * 0.6 + Math.cos(idleT * 0.8) * height * 0.28;
      }

      pos.x += (target.x - pos.x) * 0.32;
      pos.y += (target.y - pos.y) * 0.32;
      colorT += 0.0026;

      if (hasPointer) {
        const c = currentColor();

        // soft outer glow halo
        const glowR = 42;
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowR);
        glow.addColorStop(0, "rgba(" + c.r + "," + c.g + "," + c.b + ",0.55)");
        glow.addColorStop(0.5, "rgba(" + c.r + "," + c.g + "," + c.b + ",0.22)");
        glow.addColorStop(1, "rgba(" + c.r + "," + c.g + "," + c.b + ",0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // crisp bright core so it reads clearly as a cursor
        const coreR = 7;
        const core = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, coreR);
        core.addColorStop(0, "rgba(255,255,255,0.95)");
        core.addColorStop(0.35, "rgba(" + c.r + "," + c.g + "," + c.b + ",1)");
        core.addColorStop(1, "rgba(" + c.r + "," + c.g + "," + c.b + ",0.9)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, coreR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }

  function handleMove(e) {
    userActive = true;
    hasPointer = true;
    const point = e.touches ? e.touches[0] : e;
    target.x = point.clientX;
    target.y = point.clientY;
    const dx = target.x - lastX;
    const dy = target.y - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    colorT += Math.min(dist * 0.0015, 0.08);
    lastX = target.x;
    lastY = target.y;
  }

  window.addEventListener("pointermove", handleMove);
  window.addEventListener("touchmove", handleMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", function () {
    hasPointer = false;
  });

  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  });

  resize();
  requestAnimationFrame(draw);
})();
