// js/utils.js

// Scroll reveal
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Counter animado
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target).toLocaleString('es-AR') + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function getCounterValue(el) {
  const base = Number(el.dataset.counterBase);
  const rate = Number(el.dataset.counterRate || 0);
  const intervalDays = Number(el.dataset.counterInterval || 1);
  const startDate = el.dataset.counterStart ? new Date(`${el.dataset.counterStart}T00:00:00-03:00`) : null;
  const hasDynamicGrowth = Number.isFinite(base) && rate > 0 && startDate instanceof Date && !Number.isNaN(startDate.getTime());

  if (!Number.isFinite(base)) {
    const fallback = Number(el.dataset.counter || 0);
    return Number.isFinite(fallback) ? fallback : 0;
  }

  if (!hasDynamicGrowth) {
    return base;
  }

  const now = new Date();
  const elapsedDays = Math.max(0, Math.floor((now - startDate) / 86400000));
  const increments = Math.floor(elapsedDays / intervalDays) * rate;
  return base + increments;
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const dynamicCounters = document.querySelectorAll('[data-counter-base]');
  if (!counters.length && !dynamicCounters.length) return;

  const updateCounter = (el) => {
    const value = getCounterValue(el);
    el.textContent = value.toLocaleString('es-AR') + (el.dataset.suffix || '');
  };

  dynamicCounters.forEach(updateCounter);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = getCounterValue(e.target);
        animateCounter(e.target, target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
  dynamicCounters.forEach(c => observer.observe(c));

  setInterval(() => {
    dynamicCounters.forEach(updateCounter);
  }, 60000);
}

// Clipboard copy
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.closest('.copy-field').querySelector('.copy-field__text').textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ Copiado';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2000);
      } catch { btn.textContent = 'Error'; }
    });
  });
}

// Hamburger menu
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

// Truncar texto
function truncate(text, length = 100) {
  return text && text.length > length ? text.slice(0, length) + '…' : (text || '');
}

// Inicializar todo
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCounters();
  initCopyButtons();
  initMobileMenu();
});
