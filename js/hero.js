// js/hero.js

function initHeroVideo() {
  const hero = document.getElementById('inicio');
  const video = document.querySelector('[data-hero-video]');
  if (!hero || !video) return;

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    if (video.currentTime < 0.25 && !video.seeking && video.readyState < 3) return;
    revealed = true;
    hero.classList.add('hero--ready');
  };

  const scheduleReveal = () => {
    window.setTimeout(reveal, 350);
    window.setTimeout(reveal, 750);
  };

  video.addEventListener('loadeddata', scheduleReveal, { once: true });
  video.addEventListener('playing', scheduleReveal, { once: true });
  video.addEventListener('timeupdate', reveal);
  video.addEventListener('canplay', reveal);
  video.addEventListener('error', () => hero.classList.add('hero--ready'), { once: true });

  if (video.readyState >= 2) {
    scheduleReveal();
  }
}

document.addEventListener('DOMContentLoaded', initHeroVideo);
