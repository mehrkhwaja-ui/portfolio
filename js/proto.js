/**
 * proto.js — tiny click-through controller for the phone-mockup
 * interactive prototypes used in case studies.
 *
 * Usage: <div id="proto-1" class="proto-frame"> ... screens ... </div>
 * then call initProto('proto-1') once the DOM is ready.
 */
function initProto(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const screens = root.querySelectorAll(".screen");
  const dots = root.querySelectorAll(".proto-dots span");
  const prevBtn = root.querySelector(".proto-prev");
  const nextBtn = root.querySelector(".proto-next");
  let idx = 0;

  function render() {
    screens.forEach((s, i) => s.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === screens.length - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (idx > 0) { idx--; render(); }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (idx < screens.length - 1) { idx++; render(); }
    });
  }
  dots.forEach((d, i) => {
    d.addEventListener("click", () => { idx = i; render(); });
  });

  // Allow any element inside a screen to advance the flow, e.g.
  // <button data-proto-next> — mimics tapping through the real app.
  root.querySelectorAll("[data-proto-next]").forEach((el) => {
    el.addEventListener("click", () => {
      if (idx < screens.length - 1) { idx++; render(); }
    });
  });
  root.querySelectorAll("[data-proto-prev]").forEach((el) => {
    el.addEventListener("click", () => {
      if (idx > 0) { idx--; render(); }
    });
  });
  root.querySelectorAll("[data-proto-go]").forEach((el) => {
    el.addEventListener("click", () => {
      idx = parseInt(el.getAttribute("data-proto-go"), 10);
      render();
    });
  });

  render();
}
