export async function initDispositivos() {
    const lista = document.getElementById('lista-dispositivos');
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
        if (!nombre || !modelo) return alert('Completa todos los campos');

        const res = await fetch('/api/devices', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, modelo })
        });

        const data = await res.json();
        if (res.ok) {
            form.reset();
            form.classList.add('hidden');
            await cargarDispositivos();
        } else alert(data.error || 'Error al registrar dispositivo');
    });

    async function cargarDispositivos() {
        try {
            const res = await fetch('/api/devices', { method: 'GET', credentials: 'include' });
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

            dispositivos.forEach(dispositivo => {
                const card = document.createElement('div');
                card.className = 'card-dispositivo';
                card.innerHTML = `
                    <div class="dispositivo-img">
                        <img src="/static/img/Dispositivo.png" alt="Dispositivo" title="Dispositivo">
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
                    const delRes = await fetch(`/api/devices/${dispositivo._id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (delRes.ok) cargarDispositivos();
                    else alert('Error al eliminar');
                });

                // Editar
                const btnEditar = card.querySelector('.editar');
                const formEdit = card.querySelector('.dispositivo-form');
                btnEditar.addEventListener('click', () => {
                    formEdit.classList.toggle('hidden');
                });

                formEdit.addEventListener('submit', async e => {
                    e.preventDefault();
                    const datos = new FormData(formEdit);
                    const body = {
                        nombre: datos.get('nombre'),
                        modelo: datos.get('modelo')
                    };
                    const updateRes = await fetch(`/api/devices/${dispositivo._id}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if (updateRes.ok) cargarDispositivos();
                    else alert('Error al actualizar');
                });

                lista.appendChild(card);
            });
        } catch (err) {
            console.error('Error al cargar:', err);
            lista.textContent = 'Error al cargar dispositivos';
        }
    }

    cargarDispositivos();
}
