// js/admin/animales-admin.js

let editingId = null;

async function loadAnimales() {
  const tbody = document.getElementById('animales-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">Cargando...</td></tr>';
  const { data, error } = await window.supabaseClient
    .from('animales').select('*').order('created_at', { ascending: false });
  if (error) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error al cargar.</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(a => `
    <tr>
      <td>${a.foto_url ? `<img src="${a.foto_url}" class="admin-thumb">` : '🐾'}</td>
      <td class="font-semibold">${a.nombre}</td>
      <td>${a.especie}</td>
      <td>
        <label class="toggle-btn">
          <input type="checkbox" ${a.destacado ? 'checked' : ''} onchange="toggleField('${a.id}','destacado',this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <label class="toggle-btn">
          <input type="checkbox" ${a.adoptado ? 'checked' : ''} onchange="toggleField('${a.id}','adoptado',this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <div style="display:flex;gap:.5rem">
          <button onclick="openEdit(${JSON.stringify(a).replace(/"/g,'&quot;')})" class="btn-admin btn-admin-ghost">Editar</button>
          <button onclick="deleteAnimal('${a.id}','${a.nombre}')" class="btn-admin btn-admin-danger">Eliminar</button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="6" class="text-center py-8 text-gray-400">No hay animales aún.</td></tr>';
}

async function toggleField(id, field, value) {
  await window.supabaseClient.from('animales').update({ [field]: value }).eq('id', id);
}

function openModal(animal = null) {
  editingId = animal ? animal.id : null;
  document.getElementById('modal-title').textContent = animal ? 'Editar animal' : 'Nuevo animal';
  document.getElementById('f-nombre').value = animal?.nombre || '';
  document.getElementById('f-especie').value = animal?.especie || 'perro';
  document.getElementById('f-edad').value = animal?.edad || '';
  document.getElementById('f-historia').value = animal?.historia || '';
  const preview = document.getElementById('img-preview');
  if (animal?.foto_url) {
    preview.src = animal.foto_url;
    preview.classList.add('visible');
  } else {
    preview.classList.remove('visible');
  }
  document.getElementById('modal').style.display = 'flex';
}

function openEdit(animal) { openModal(animal); }

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('animal-form').reset();
  editingId = null;
}

document.getElementById('f-foto').addEventListener('change', function () {
  const preview = document.getElementById('img-preview');
  if (this.files[0]) {
    preview.src = URL.createObjectURL(this.files[0]);
    preview.classList.add('visible');
  }
});

async function saveAnimal(e) {
  e.preventDefault();
  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  let foto_url = null;
  const file = document.getElementById('f-foto').files[0];

  if (file) {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error: uploadErr } = await window.supabaseClient.storage
      .from('animales-fotos').upload(path, file, { upsert: true });
    if (uploadErr) {
      alert('Error al subir la foto.');
      btn.disabled = false;
      btn.textContent = 'Guardar';
      return;
    }
    const { data: { publicUrl } } = window.supabaseClient.storage.from('animales-fotos').getPublicUrl(path);
    foto_url = publicUrl;
  }

  const payload = {
    nombre: document.getElementById('f-nombre').value.trim(),
    especie: document.getElementById('f-especie').value,
    edad: document.getElementById('f-edad').value.trim(),
    historia: document.getElementById('f-historia').value.trim(),
    ...(foto_url && { foto_url })
  };

  const { error } = editingId
    ? await window.supabaseClient.from('animales').update(payload).eq('id', editingId)
    : await window.supabaseClient.from('animales').insert(payload);

  if (error) {
    alert('Error al guardar: ' + error.message);
  } else {
    closeModal();
    await loadAnimales();
  }

  btn.disabled = false;
  btn.textContent = 'Guardar';
}

async function deleteAnimal(id, nombre) {
  if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
  await window.supabaseClient.from('animales').delete().eq('id', id);
  await loadAnimales();
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!await checkAuth()) return;
  document.getElementById('admin-email').textContent =
    (await window.supabaseClient.auth.getUser()).data.user?.email || '';
  await loadAnimales();
  document.getElementById('animal-form').addEventListener('submit', saveAnimal);
});
