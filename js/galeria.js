// js/galeria.js
const WHATSAPP_NUM = '3516421684';

function buildAnimalCard(animal) {
  const especie = animal.especie || 'otro';
  const badgeEspecie = `<span class="badge badge-${especie}">${especie}</span>`;
  const badgeAdoptado = animal.adoptado ? `<span class="badge badge-adoptado">✓ Adoptado</span>` : '';
  const img = animal.foto_url
    ? `<img class="animal-card__img" src="${animal.foto_url}" alt="Foto de ${animal.nombre}" loading="lazy">`
    : `<div class="animal-card__img-placeholder">🐾</div>`;

  return `
    <div class="animal-card reveal" data-especie="${especie}" data-adoptado="${animal.adoptado}">
      ${img}
      <div class="animal-card__body">
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem">${badgeEspecie}${badgeAdoptado}</div>
        <div class="animal-card__name">${animal.nombre}</div>
        <div class="animal-card__meta">${animal.edad || ''}</div>
        <div class="animal-card__historia">${animal.historia || ''}</div>
      </div>
    </div>`;
}

async function loadGaleriaPreview() {
  const container = document.getElementById('galeria-preview');
  if (!container) return;
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando animales…</p></div>';
  try {
    const { data, error } = await window.supabaseClient
      .from('animales')
      .select('*')
      .eq('destacado', true)
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) throw error;
    container.innerHTML = data.length
      ? data.map(buildAnimalCard).join('')
      : '<p style="text-align:center;color:#6B7280">No hay animales destacados aún.</p>';
    // Re-init reveal para las nuevas cards
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
      }, { threshold: 0.1 });
      observer.observe(el);
    });
  } catch (err) {
    container.innerHTML = '<p style="text-align:center;color:#B91C1C">Error al cargar animales. Intentá de nuevo.</p>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadGaleriaPreview);

// Paginación
let currentPage = 0;
const PAGE_SIZE = 20;
let currentEspecie = 'todos';
let currentAdoptado = 'todos';
let allAnimales = [];

async function loadGaleriaFull() {
  const container = document.getElementById('galeria-full');
  if (!container) return;

  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Cargando…</p></div>';

  const { data, error } = await window.supabaseClient
    .from('animales')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { container.innerHTML = '<p style="color:#B91C1C;text-align:center">Error al cargar.</p>'; return; }

  allAnimales = data || [];
  renderFiltered();
}

function renderFiltered() {
  const container = document.getElementById('galeria-full');
  const btnMore   = document.getElementById('btn-mas');
  currentPage = 0;

  let filtered = allAnimales.filter(a => {
    const matchEspecie  = currentEspecie === 'todos' || a.especie === currentEspecie;
    const matchAdoptado = currentAdoptado === 'todos' || (currentAdoptado === 'disponibles' ? !a.adoptado : a.adoptado);
    return matchEspecie && matchAdoptado;
  });

  if (!filtered.length) {
    container.innerHTML = '<p style="text-align:center;color:#6B7280;grid-column:1/-1">No hay animales en esta categoría.</p>';
    if (btnMore) btnMore.style.display = 'none';
    return;
  }

  const page = filtered.slice(0, PAGE_SIZE);
  container.innerHTML = page.map(buildAnimalCard).join('');

  if (btnMore) {
    btnMore.style.display = filtered.length > PAGE_SIZE ? 'inline-flex' : 'none';
    btnMore.onclick = () => {
      currentPage++;
      const next = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
      container.insertAdjacentHTML('beforeend', next.map(buildAnimalCard).join(''));
      if ((currentPage + 1) * PAGE_SIZE >= filtered.length) btnMore.style.display = 'none';
    };
  }
}

function initFiltros() {
  document.querySelectorAll('[data-filtro-especie]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filtro-especie]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEspecie = btn.dataset.filtroEspecie;
      renderFiltered();
    });
  });
  document.querySelectorAll('[data-filtro-estado]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filtro-estado]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAdoptado = btn.dataset.filtroEstado;
      renderFiltered();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadGaleriaFull();
  initFiltros();
});
