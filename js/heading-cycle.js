/**
 * heading-cycle.js - crossfades the hero heading through a small set
 * of phrases, the way the old site did.
 */
(function () {
  const el = document.getElementById("cycling-heading");
  if (!el) return;

  const phrases = [
    "I make complex systems legible through design",
    "I make invisible impact measurable through design",
    "I make intentional confusion clear through design",
  ];

  let i = 0;
  setInterval(function () {
    i = (i + 1) % phrases.length;
    el.style.opacity = 0;
    setTimeout(function () {
      el.textContent = phrases[i];
      el.style.opacity = 1;
    }, 500);
  }, 3800);
})();
