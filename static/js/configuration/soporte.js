import { obtenerDispositivos } from './dispositivos.js';
import { authFetch } from '../utils/authFetch.js';

async function activarModoErrorDispositivo() {
    const grupoDispositivo = document.getElementById('grupo-dispositivo');
    const selectDispositivo = document.getElementById('dispositivo-reporte');

    // Mostrar grupo
    grupoDispositivo.classList.remove('hidden');

    // Cargar dispositivos
    try {
        const dispositivos = await obtenerDispositivos();
        selectDispositivo.innerHTML = '';

        dispositivos.forEach(dev => {
            const option = document.createElement('option');
            option.value = dev._id;
            option.textContent = dev.nombre || `Dispositivo ${dev._id}`;
            selectDispositivo.appendChild(option);
        });

        // Guardar mapeo local para usar en envío
        localStorage.setItem('mapaDispositivos', JSON.stringify(dispositivos));
    } catch (err) {
        console.error('Error al cargar dispositivos:', err);
        selectDispositivo.innerHTML = '<option value="">Error al cargar</option>';
    }
}

async function activarModoSubusuario() {
    const grupoSubusuarios = document.getElementById('grupo-subusuario');
    const selectSubusuario = document.getElementById('subusuario-reporte');

    // Mostrar el grupo condicional
    grupoSubusuarios.classList.remove('hidden');

    try {
        const res = await authFetch('/api/usuarios/subusuarios');
        const subusuarios = await res.json();

        if (!Array.isArray(subusuarios)) throw new Error('Respuesta inesperada del servidor');

        selectSubusuario.innerHTML = '';

        if (subusuarios.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay subusuarios registrados';
            selectSubusuario.appendChild(option);
            return;
        }

        subusuarios.forEach(su => {
            const option = document.createElement('option');
            option.value = su._id;
            option.textContent = su.nombre || su.email || `Subusuario ${su._id}`;
            selectSubusuario.appendChild(option);
        });

        // Guardar por si se quiere mostrar nombre en el correo
        localStorage.setItem('mapaSubusuarios', JSON.stringify(subusuarios));
    } catch (err) {
        console.error('Error al cargar subusuarios:', err);
        selectSubusuario.innerHTML = '<option value="">Error al cargar subusuarios</option>';
    }
}

function activarModoErrorCuenta() {
    const grupoCuenta = document.getElementById('grupo-error-cuenta');
    grupoCuenta.classList.remove('hidden');
}

function activarModoErrorPagina() {
    const grupoPagina = document.getElementById('grupo-error-pagina');
    const grupoImagen = document.getElementById('grupo-imagen');

    grupoPagina.classList.remove('hidden');
    grupoImagen.classList.remove('hidden');
}


function ocultarTodosLosCamposCondicionales() {
    document.querySelectorAll('.conditional-group').forEach(grupo => grupo.classList.add('hidden'));
}

export function initSoporte() {
    const btnContactar = document.getElementById('btn-contactar-soporte');
    const modal = document.getElementById('modal-reporte');
    const cancelarBtn = document.getElementById('cancelar-reporte');
    const formReporte = document.getElementById('form-reporte');
    const selectDispositivo = document.getElementById('dispositivo-reporte');
    const contenedorCards = document.getElementById('dispositivos-reinicio');

    if (!btnContactar || !modal || !cancelarBtn || !formReporte || !selectDispositivo || !contenedorCards) {
        console.warn('Soporte: elementos del DOM no disponibles aún');
        return;
    }

    document.getElementById('tipo-error').addEventListener('change', async (e) => {
        ocultarTodosLosCamposCondicionales();

        const tipo = e.target.value;

        if (tipo === 'error_dispositivo') {
            await activarModoErrorDispositivo();
        }
        if (tipo === 'error_subusuarios') {
            await activarModoSubusuario();
        }
        if (tipo === 'error_cuenta') {
            activarModoErrorCuenta();
        }
        if (tipo === 'error_pagina') {
            activarModoErrorPagina();
        }

    });

    // Abrir modal
    btnContactar.addEventListener('click', async () => {
        modal.classList.remove('hidden');
    });

    // Cerrar modal
    cancelarBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        formReporte.reset();
        ocultarTodosLosCamposCondicionales();
    });


    // Enviar reporte al backend
    formReporte.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tipo = document.getElementById('tipo-error').value;
        const nombre = localStorage.getItem('nombreUsuario') || 'Desconocido';
        const email = localStorage.getItem('correoUsuario') || 'desconocido@airguard.com';
        const descripcion = document.getElementById('descripcion-problema').value;
        const submitBtn = formReporte.querySelector('button[type="submit"]');

        let body;
        let headers = {};
        let esFormData = false;

        // Validaciones previas según tipo
        if (tipo === 'error_dispositivo') {
            const dispositivo = document.getElementById('dispositivo-reporte').value;
            if (!dispositivo) {
                mostrarToast('Selecciona un dispositivo válido', 'error');
                return;
            }
            body = { tipo, nombre, email, descripcion, dispositivo };
        }

        else if (tipo === 'error_subusuarios') {
            const subusuarioId = document.getElementById('subusuario-reporte').value;
            const subusuariosMap = JSON.parse(localStorage.getItem('mapaSubusuarios')) || [];
            const sub = subusuariosMap.find(u => u._id === subusuarioId);
            const subusuario = sub?.nombre || sub?.email || subusuarioId;
            body = { tipo, nombre, email, descripcion, subusuario };
        }

        else if (tipo === 'error_cuenta') {
            body = { tipo, nombre, email, descripcion };
        }

        else if (tipo === 'error_pagina') {
            esFormData = true;
            const imagen = document.getElementById('captura-reporte').files[0];
            const fd = new FormData();
            fd.append('tipo', tipo);
            fd.append('nombre', nombre);
            fd.append('email', email);
            fd.append('descripcion', descripcion);
            if (imagen) fd.append('imagen', imagen);
            body = fd;
        }

        // Activar feedback de envío
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            const res = await fetch('/api/soporte/reporte', {
                method: 'POST',
                headers: esFormData ? undefined : { 'Content-Type': 'application/json' },
                body: esFormData ? body : JSON.stringify(body)
            });

            const data = await res.json();
            if (res.ok) {
                mostrarToast('Reporte enviado correctamente', 'success');
            } else {
                mostrarToast(data.error || 'Error al enviar reporte', 'error');
            }
        } catch (err) {
            console.error('Error al enviar el reporte:', err);
            mostrarToast('Fallo en el envío del reporte');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar';
            modal.classList.add('hidden');
            formReporte.reset();
            ocultarTodosLosCamposCondicionales();
        }
    });

    cargarDispositivosParaReiniciar(contenedorCards);
}

// === Helpers ===

async function cargarDispositivosParaReiniciar(contenedor) {
    contenedor.innerHTML = 'Cargando...';

    try {
        const dispositivos = await obtenerDispositivos(); // ya autenticado

        contenedor.innerHTML = '';

        dispositivos.forEach(d => {
            const card = document.createElement('div');
            const imagen = d.imagen || '/static/img/DispositivoBlanco_Azul.png';
            const estado = d.estado?.toLowerCase() || 'desconocido';
            const claseEstado = estado === 'activo' ? 'estado-activo' : 'estado-inactivo';
            card.className = 'card-dispositivo-soporte';

            card.innerHTML = `
                <img src="${imagen}" alt="Imagen dispositivo">
                <h4>${d.nombre || 'Dispositivo sin nombre'}</h4>
                <div class="estado">Estado: <span class="${claseEstado}">${estado}</span></div>
                <button data-id="${d._id}"><i class="bi bi-arrow-repeat"></i> Reiniciar</button>
            `;

            const boton = card.querySelector('button');

            boton.addEventListener('click', async () => {
                const confirmar = confirm(`¿Reiniciar ${d.nombre}?`);
                if (!confirmar) return;

                try {
                    const reinicio = await authFetch(`/api/devices/reiniciar/${d._id}`, {
                        method: 'POST',
                    });

                    const respuesta = await reinicio.json();
                    mostrarToast(respuesta.mensaje || 'Reinicio exitoso', 'success');

                } catch (err) {
                    console.error(err);
                    mostrarToast('Error al reiniciar el dispositivo', 'error');
                }
            });

            contenedor.appendChild(card);
        });

    } catch (err) {
        console.error('Error al cargar dispositivos:', err);
        contenedor.innerHTML = '<p>Error al cargar dispositivos</p>';
    }
}


