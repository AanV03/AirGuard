import { authFetch } from '../utils/authFetch.js';

const listaUsuarios = document.getElementById('lista-usuarios');
const form = document.getElementById('form-usuarios');
let usuarioEditandoId = null;
const modal = document.getElementById('modal-editar-usuario');
const formEditar = document.getElementById('form-editar-usuario');
const inputNombre = document.getElementById('editar-nombre');
const inputEmail = document.getElementById('editar-email');

async function cargarUsuarios() {
    try {
        const res = await authFetch('/api/usuarios/subusuarios');
        if (!res.ok) throw new Error('Error al obtener subusuarios');
        const subusuarios = await res.json();

        listaUsuarios.innerHTML = '';

        subusuarios.forEach(u => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="usuario-card">
                    <span class="nombre">${u.nombre || 'Sin nombre'}</span>
                    <span class="email">${u.email}</span>
                    <div class="acciones">
                        <button class="btn-editar" data-id="${u._id}" title="Editar">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn-eliminar" data-id="${u._id}" title="Eliminar">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </div>
            `;

            listaUsuarios.appendChild(li);
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (confirm('¿Eliminar este subusuario?')) {
                    const del = await authFetch(`/api/usuarios/subusuarios/${id}`, { method: 'DELETE' });
                    if (del.ok) cargarUsuarios();
                    else mostrarToast('No se pudo eliminar.', 'error');
                }
            });
        });

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const card = btn.closest('.usuario-card');
                const nombre = card.querySelector('.nombre').textContent;
                const email = card.querySelector('.email').textContent;

                usuarioEditandoId = id;
                inputNombre.value = nombre;
                inputEmail.value = email;
                modal.classList.remove('hidden');
            });
        });


    } catch (err) {
        console.error(err);
        mostrarToast('Error cargando usuarios.', 'error');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre-hijo').value.trim();
    const email = document.getElementById('email-hijo').value.trim();
    const password = crypto.randomUUID().slice(0, 10); // ← contraseña temporal aleatoria

    if (!email) return mostrarToast('Email requerido', 'error');

    try {
        const res = await authFetch('/api/usuarios/subusuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        if (!res.ok) throw new Error('No se pudo crear el subusuario');
        form.reset();
        await cargarUsuarios();
    } catch (err) {
        console.error(err);
        mostrarToast('Error al crear subusuario.', 'error');
    }
});

export async function initUsuarios() {
    await cargarUsuarios();
}

formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = inputNombre.value.trim();
    const email = inputEmail.value.trim();

    if (!nombre || !email) return;

    try {
        const res = await authFetch(`/api/usuarios/subusuarios/${usuarioEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email })
        });

        if (!res.ok) throw new Error('Error al actualizar');

        modal.classList.add('hidden');
        await cargarUsuarios();
    } catch (err) {
        console.error(err);
        mostrarToast('Error al actualizar subusuario.', 'error');
    }
});

document.getElementById('cancelar-edicion').addEventListener('click', () => {
    modal.classList.add('hidden');
});
