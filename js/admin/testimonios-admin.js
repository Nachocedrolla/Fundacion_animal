// js/admin/testimonios-admin.js
let editingId = null;

async function loadTestimonios() {
  const tbody = document.getElementById('test-tbody');
  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">Cargando...</td></tr>';
  const { data } = await window.supabaseClient
    .from('testimonios').select('*').order('created_at', { ascending: false });
  tbody.innerHTML = (data || []).map(t => `
    <tr>
      <td class="font-semibold">${t.nombre}</td>
      <td><span class="badge badge-${t.tipo}">${t.tipo}</span></td>
      <td style="max-width:300px;font-size:.85rem;color:#6B7280">${t.texto.slice(0,80)}...</td>
      <td>
        <label class="toggle-btn">
          <input type="checkbox" ${t.destacado ? 'checked' : ''} onchange="toggleDestacado('${t.id}',this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <div style="display:flex;gap:.5rem">
          <button onclick="openEdit(${JSON.stringify(t).replace(/"/g,'&quot;')})" class="btn-admin btn-admin-ghost">Editar</button>
          <button onclick="deleteTest('${t.id}','${t.nombre}')" class="btn-admin btn-admin-danger">Eliminar</button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="5" class="text-center py-8 text-gray-400">No hay testimonios.</td></tr>';
}

async function toggleDestacado(id, value) {
  await window.supabaseClient.from('testimonios').update({ destacado: value }).eq('id', id);
}

function openModal(t = null) {
  editingId = t ? t.id : null;
  document.getElementById('modal-title').textContent = t ? 'Editar testimonio' : 'Nuevo testimonio';
  document.getElementById('f-nombre').value = t?.nombre || '';
  document.getElementById('f-tipo').value = t?.tipo || 'adoptante';
  document.getElementById('f-texto').value = t?.texto || '';
  document.getElementById('modal').style.display = 'flex';
}

function openEdit(t) { openModal(t); }
function closeModal() { document.getElementById('modal').style.display = 'none'; editingId = null; }

async function saveTestimonio(e) {
  e.preventDefault();
  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  const payload = {
    nombre: document.getElementById('f-nombre').value.trim(),
    tipo: document.getElementById('f-tipo').value,
    texto: document.getElementById('f-texto').value.trim(),
  };
  const { error } = editingId
    ? await window.supabaseClient.from('testimonios').update(payload).eq('id', editingId)
    : await window.supabaseClient.from('testimonios').insert(payload);
  if (error) {
    alert('Error: ' + error.message);
  } else {
    closeModal();
    await loadTestimonios();
  }
  btn.disabled = false;
  btn.textContent = 'Guardar';
}

async function deleteTest(id, nombre) {
  if (!confirm(`¿Eliminar el testimonio de ${nombre}?`)) return;
  await window.supabaseClient.from('testimonios').delete().eq('id', id);
  await loadTestimonios();
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!await checkAuth()) return;
  await loadTestimonios();
  document.getElementById('test-form').addEventListener('submit', saveTestimonio);
});
