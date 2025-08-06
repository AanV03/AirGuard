import { authFetch } from '../utils/authFetch.js';

const lista = document.getElementById('lista-dispositivos');

async function cargarDispositivos() {
    try {
        const res = await authFetch('/api/devices', { method: 'GET' });
        const dispositivos = await res.json();
        lista.innerHTML = '';

        if (!res.ok || !Array.isArray(dispositivos)) {
            lista.textContent = 'Error al cargar dispositivos';
            return;
        }

        if (dispositivos.length === 0) {
            lista.textContent = 'No tienes dispositivos registrados.';
            return;
        }

        dispositivos.forEach((dispositivo, i) => {
            const card = document.createElement('div');
            card.className = 'card-dispositivo';

            // Agregar delay dinámico
            card.style.animationDelay = `${i * 200}ms`; // 0.2s entre cada animacion

            card.innerHTML = `
                    <div class="dispositivo-img">
                        <img src="/static/img/DispositivoBlanco_Azul.png" alt="Dispositivo" title="Dispositivo">
                    </div>
                    <div class="dispositivo-info">
                        <h3>${dispositivo.nombre}</h3>
                        <p><strong>Modelo:</strong> ${dispositivo.modelo}</p>
                        <p><strong>Estado:</strong> ${dispositivo.estado}</p>
                        <p class="dispositivo-fecha">Registrado: ${new Date(dispositivo.fecha_registro).toLocaleString()}</p>
                    </div>
                    <form class="dispositivo-form hidden">
                        <input type="text" name="nombre" value="${dispositivo.nombre}" required>
                        <input type="text" name="modelo" value="${dispositivo.modelo}" required>
                        <button type="submit">Guardar</button>
                    </form>
                    <div class="acciones-dispositivo">
                        <button class="btn-icon editar" title="Editar"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn-icon eliminar" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
                    </div>
                `;

            // Eliminar
            card.querySelector('.eliminar').addEventListener('click', async () => {
                const confirmar = confirm('¿Eliminar este dispositivo?');
                if (!confirmar) return;

                const delRes = await authFetch(`/api/devices/${dispositivo._id}`, {
                    method: 'DELETE'
                });

                if (delRes.ok) await cargarDispositivos();
                else mostrarToast('Error al eliminar','error');
            });

            // Editar
            const btnEditar = card.querySelector('.editar');
            const formEdit = card.querySelector('.dispositivo-form');

            btnEditar.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    abrirModalEdicion(dispositivo); // función externa con lógica modal
                } else {
                    formEdit.classList.toggle('hidden');
                }
            });

            formEdit.addEventListener('submit', async e => {
                e.preventDefault();
                const datos = new FormData(formEdit);
                const body = {
                    nombre: datos.get('nombre'),
                    modelo: datos.get('modelo')
                };
                const updateRes = await authFetch(`/api/devices/${dispositivo._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (updateRes.ok) await cargarDispositivos();
                else mostrarToast('Error al actualizar','error');
            });

            lista.appendChild(card);
        });
    } catch (err) {
        console.error('Error al cargar:', err);
        lista.textContent = 'Error al cargar dispositivos';
    }
}

export async function initDispositivos() {
    const btnAgregar = document.getElementById('btn-agregar-dispositivo');

    if (!lista || !btnAgregar) return;

    // Formulario superior para registrar nuevo dispositivo
    const formHTML = `
        <form id="form-dispositivo" class="form hidden" style="margin-top: 1rem;">
            <label>Nombre del dispositivo:</label>
            <input type="text" id="nombre-dispositivo" required>
            <label>Modelo:</label>
            <input type="text" id="modelo-dispositivo" value="AirGuard-1" required>
            <button type="submit">Guardar dispositivo</button>
        </form>
    `;
    btnAgregar.insertAdjacentHTML('afterend', formHTML);
    const form = document.getElementById('form-dispositivo');

    btnAgregar.addEventListener('click', () => form.classList.toggle('hidden'));

    // Envío de nuevo dispositivo
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const nombre = document.getElementById('nombre-dispositivo').value.trim();
        const modelo = document.getElementById('modelo-dispositivo').value.trim();
        if (!nombre || !modelo) return mostrarToast('Completa todos los campos','error');

        const res = await authFetch('/api/devices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, modelo })
        });

        const data = await res.json();
        if (res.ok) {
            form.reset();
            form.classList.add('hidden');
            await cargarDispositivos();
        } else mostrarToast(data.error || 'Error al registrar dispositivo','error');
    });

    await cargarDispositivos();
}

export async function obtenerDispositivos() {
    try {
        const res = await authFetch('/api/devices');
        if (!res.ok) throw new Error('Error al obtener dispositivos');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('[obtenerDispositivos] Error:', err);
        return [];
    }
}

function abrirModalEdicion(dispositivo) {
    const modal = document.getElementById('modal-editar-dispositivo');
    const form = document.getElementById('modal-form-edit');
    form.nombre.value = dispositivo.nombre;
    form.modelo.value = dispositivo.modelo;

    modal.classList.remove('hidden');

    form.onsubmit = async (e) => {
        e.preventDefault();
        const body = {
            nombre: form.nombre.value,
            modelo: form.modelo.value
        };
        const res = await authFetch(`/api/devices/${dispositivo._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (res.ok) {
            modal.classList.add('hidden');
            await cargarDispositivos();
        } else {
            mostrarToast('Error al actualizar','error');
        }
    };
}

document.getElementById('cerrar-modal').addEventListener('click', () => {
    document.getElementById('modal-editar-dispositivo').classList.add('hidden');
});

