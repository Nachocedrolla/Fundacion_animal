// js/carousel.js

const CAROUSEL_ITEMS = [
  { file: 'Adopcion 1.png', title: 'Adopción 1', text: 'Un comienzo nuevo para un compañero de cuatro patas.' },
  { file: 'Adopcion 2.png', title: 'Adopción 2', text: 'Cada encuentro abre la puerta a una familia.' },
  { file: 'Adopcion 3.png', title: 'Adopción 3', text: 'Más miradas felices, más hogares definitivos.' },
  { file: 'Adopcion 4.png', title: 'Adopción 4', text: 'El refugio se transforma cuando aparece una oportunidad.' },
  { file: 'Adopcion 5.png', title: 'Adopción 5', text: 'Pequeños pasos que cambian una vida completa.' },
  { file: 'Adopcion 6.png', title: 'Adopción 6', text: 'Historias reales de adopción y esperanza.' },
];

let carouselIndex = 0;
let carouselTimer = null;

function buildCarousel() {
  const track = document.getElementById('carousel-track');
  const dots = document.getElementById('carousel-dots');
  if (!track || !dots) return;

  track.innerHTML = CAROUSEL_ITEMS.map((item) => {
    const src = `assets/img/Carrousel/${encodeURIComponent(item.file)}`;
    return `
      <article class="carousel__slide">
        <img src="${src}" alt="${item.title}" loading="lazy">
        <div class="carousel__caption">
          <strong>${item.title}</strong>
          <span>${item.text}</span>
        </div>
      </article>`;
  }).join('');

  dots.innerHTML = CAROUSEL_ITEMS.map((_, index) => (
    `<button type="button" class="carousel__dot${index === 0 ? ' active' : ''}" aria-label="Ir a la imagen ${index + 1}" data-slide="${index}"></button>`
  )).join('');

  const prev = document.querySelector('.carousel__control--prev');
  const next = document.querySelector('.carousel__control--next');
  prev?.addEventListener('click', () => moveCarousel(-1));
  next?.addEventListener('click', () => moveCarousel(1));
  dots.querySelectorAll('.carousel__dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.slide || 0);
      goToSlide(target);
    });
  });

  renderCarousel();
  startCarouselAutoplay();
}

function renderCarousel() {
  const track = document.getElementById('carousel-track');
  const dots = document.getElementById('carousel-dots');
  if (!track || !dots) return;
  const total = CAROUSEL_ITEMS.length;
  carouselIndex = (carouselIndex + total) % total;
  track.style.transform = `translateX(-${carouselIndex * 100}%)`;
  dots.querySelectorAll('.carousel__dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === carouselIndex);
  });
}

function moveCarousel(direction) {
  carouselIndex += direction;
  renderCarousel();
  startCarouselAutoplay();
}

function goToSlide(index) {
  carouselIndex = index;
  renderCarousel();
  startCarouselAutoplay();
}

function startCarouselAutoplay() {
  stopCarouselAutoplay();
  carouselTimer = window.setTimeout(() => {
    moveCarousel(1);
  }, 2600);
}

function stopCarouselAutoplay() {
  if (carouselTimer) {
    window.clearTimeout(carouselTimer);
    carouselTimer = null;
  }
}

document.addEventListener('DOMContentLoaded', buildCarousel);
