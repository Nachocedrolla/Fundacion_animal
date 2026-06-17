// js/carousel.js

const CAROUSEL_ITEMS = [
  { file: 'Adopcion 1.png', title: 'Adopción 1', text: 'Un comienzo nuevo para un compañero de cuatro patas.' },
  { file: 'Adopcion 2.png', title: 'Adopción 2', text: 'Cada encuentro abre la puerta a una familia.' },
  { file: 'Adopcion 3.png', title: 'Adopción 3', text: 'Más miradas felices, más hogares definitivos.' },
  { file: 'Adopcion 4.png', title: 'Adopción 4', text: 'El refugio se transforma cuando aparece una oportunidad.' },
  { file: 'Adopcion 5.png', title: 'Adopción 5', text: 'Pequeños pasos que cambian una vida completa.' },
  { file: 'Adopcion 6.png', title: 'Adopción 6', text: 'Historias reales de adopción y esperanza.' },
  { file: 'Adopcion 7.png', title: 'Adopción 7', text: 'Una historia más para seguir compartiendo esperanza.' },
];

const AUTO_SCROLL_DELAY = 2500;

function getCarouselOrder(item) {
  const fileMatch = String(item.file).match(/Adopcion\s+(\d+)/i);
  const titleMatch = String(item.title).match(/(\d+)/);
  const value = fileMatch?.[1] || titleMatch?.[1];
  return value ? Number(value) : Number.MAX_SAFE_INTEGER;
}

const CAROUSEL_ORDERED_ITEMS = [...CAROUSEL_ITEMS].sort((a, b) => getCarouselOrder(a) - getCarouselOrder(b));

let carouselIndex = 0;
let carouselTimer = null;
let slideStepPx = 0;
let slideCount = CAROUSEL_ORDERED_ITEMS.length;

function buildCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  track.innerHTML = [...CAROUSEL_ORDERED_ITEMS, ...CAROUSEL_ORDERED_ITEMS].map((item) => {
    const src = `assets/img/Carrousel/${encodeURIComponent(item.file)}`;
    return `
      <article class="carousel__slide">
        <div class="carousel__media">
          <img src="${src}" alt="${item.title}" loading="lazy">
        </div>
        <div class="carousel__caption">
          <strong>${item.title}</strong>
          <span>${item.text}</span>
        </div>
      </article>`;
  }).join('');

  updateMeasurements();
  renderCarousel(false);
  startCarouselAutoplay();

  window.addEventListener('resize', handleResize, { passive: true });
  track.addEventListener('transitionend', handleTransitionEnd);
}

function updateMeasurements() {
  const track = document.getElementById('carousel-track');
  const firstSlide = track?.querySelector('.carousel__slide');
  if (!track || !firstSlide) return;

  const slideWidth = firstSlide.getBoundingClientRect().width;
  const trackStyles = window.getComputedStyle(track);
  const gapPx = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
  slideStepPx = slideWidth + gapPx;
}

function renderCarousel(animate = true) {
  const track = document.getElementById('carousel-track');
  if (!track || !slideStepPx) return;

  track.style.transition = animate ? 'transform .8s cubic-bezier(.22,.61,.36,1)' : 'none';
  track.style.transform = `translateX(-${carouselIndex * slideStepPx}px)`;
}

function moveCarousel(direction) {
  carouselIndex += direction;
  renderCarousel(true);
}

function handleTransitionEnd() {
  if (carouselIndex >= slideCount) {
    carouselIndex = 0;
    renderCarousel(false);
  }
}

function startCarouselAutoplay() {
  stopCarouselAutoplay();
  carouselTimer = window.setInterval(() => {
    moveCarousel(1);
  }, AUTO_SCROLL_DELAY);
}

function stopCarouselAutoplay() {
  if (carouselTimer) {
    window.clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

function handleResize() {
  updateMeasurements();
  renderCarousel(false);
}

document.addEventListener('DOMContentLoaded', buildCarousel);
