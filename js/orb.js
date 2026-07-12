/**
 * orb.js - a single soft glowing orb that follows the cursor with a
 * calm lag, and slowly, continuously shifts through the four brand
 * colors. Replaces the old multi-point bloom trail.
 */
(function () {
  const canvas = document.getElementById("bloom-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const palette = ["#303FFF", "#6643FF", "#DC5AA7", "#FFA33B"];

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
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (width === 0 || height === 0) return;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (target.x === 0 && target.y === 0) {
      pos.x = target.x = width * 0.2;
      pos.y = target.y = height * 0.75;
    }
  }

  function draw() {
    if (width > 0 && height > 0) {
      ctx.clearRect(0, 0, width, height);

      if (!userActive) {
        idleT += 0.0015;
        target.x = width * 0.5 + Math.sin(idleT) * width * 0.32;
        target.y = height * 0.6 + Math.cos(idleT * 0.8) * height * 0.28;
      }

      pos.x += (target.x - pos.x) * 0.045;
      pos.y += (target.y - pos.y) * 0.045;
      colorT += 0.0022;

      const c = currentColor();
      const r = Math.min(width, height) * 0.22 + 90;
      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r);
      grad.addColorStop(0, "rgba(" + c.r + "," + c.g + "," + c.b + ",0.55)");
      grad.addColorStop(0.6, "rgba(" + c.r + "," + c.g + "," + c.b + ",0.25)");
      grad.addColorStop(1, "rgba(" + c.r + "," + c.g + "," + c.b + ",0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  function handleMove(e) {
    userActive = true;
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    target.x = point.clientX - rect.left;
    target.y = point.clientY - rect.top;
  }

  canvas.addEventListener("pointermove", handleMove);
  canvas.addEventListener("touchmove", handleMove, { passive: true });
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
