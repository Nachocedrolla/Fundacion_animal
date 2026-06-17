// js/admin/auth.js

async function checkAuth() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = '/admin/';
    return false;
  }
  return true;
}

async function logout() {
  await window.supabaseClient.auth.signOut();
  window.location.href = '/admin/';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  btn.disabled = true;
  btn.textContent = 'Ingresando...';
  errEl.style.display = 'none';

  const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password: pass });

  if (error) {
    errEl.textContent = 'Email o contraseña incorrectos.';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Ingresar';
  } else {
    window.location.href = '/admin/animales.html';
  }
}
