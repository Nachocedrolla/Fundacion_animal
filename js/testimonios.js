// js/testimonios.js
function getAvatar(nombre, fotoUrl) {
  if (fotoUrl) return `<img class="testimonio-card__avatar" src="${fotoUrl}" alt="${nombre}" loading="lazy">`;
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : '?';
  return `<div class="testimonio-card__avatar">${inicial}</div>`;
}

function buildTestimonioCard(t) {
  const badges = { adoptante: 'badge-adoptante', voluntario: 'badge-voluntario', donante: 'badge-donante' };
  return `
    <div class="testimonio-card reveal" data-tipo="${t.tipo}">
      <div class="testimonio-card__header">
        ${getAvatar(t.nombre, t.foto_url)}
        <div>
          <div class="testimonio-card__nombre">${t.nombre}</div>
          <span class="badge ${badges[t.tipo] || ''}">${t.tipo}</span>
        </div>
      </div>
      <p class="testimonio-card__texto">${t.texto}</p>
    </div>`;
}

async function loadTestimoniosPreview() {
  const container = document.getElementById('testimonios-preview');
  if (!container) return;
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const { data, error } = await window.supabaseClient
      .from('testimonios')
      .select('*')
      .eq('destacado', true)
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) throw error;
    container.innerHTML = data.length
      ? data.map(buildTestimonioCard).join('')
      : '<p style="text-align:center">No hay testimonios aún.</p>';
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); } });
      }, { threshold: 0.1 }).observe(el);
    });
  } catch (err) {
    container.innerHTML = '<p style="color:#B91C1C;text-align:center">Error al cargar testimonios.</p>';
  }
}

async function loadTestimoniosFull() {
  const container = document.getElementById('testimonios-full');
  if (!container) return;
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  const { data } = await window.supabaseClient
    .from('testimonios')
    .select('*')
    .order('created_at', { ascending: false });
  container.innerHTML = (data || []).map(buildTestimonioCard).join('') || '<p style="text-align:center">Sin testimonios.</p>';
}

document.addEventListener('DOMContentLoaded', () => {
  loadTestimoniosPreview();
  loadTestimoniosFull();
});
