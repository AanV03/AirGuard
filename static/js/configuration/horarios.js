import { obtenerDispositivos } from './dispositivos.js';
import { authFetch } from '../utils/authFetch.js';

let dispositivosEnHorarios = [];

function cargarDispositivosEnHorario() {
    const select = document.getElementById('device-select');
    if (!select) return;

    select.innerHTML = '<option value="">Selecciona un dispositivo</option>';

    dispositivosEnHorarios.forEach(device => {
        const opt = document.createElement('option');
        opt.value = device._id;
        opt.textContent = device.nombre || `Dispositivo ${device._id}`;
        select.appendChild(opt);
    });
}

function getDeviceNameById(id) {
    const d = dispositivosEnHorarios.find(d => d._id === id);
    return d ? d.nombre : 'Dispositivo desconocido';
}

async function mostrarHorarios() {
    const contenedor = document.getElementById('horarios-lista');
    contenedor.innerHTML = '';

    // Aseguramos que la lista de dispositivos esté cargada
    if (!dispositivosEnHorarios.length) {
        dispositivosEnHorarios = await obtenerDispositivos();
    }

    const res = await authFetch('/api/schedules');
    const horarios = await res.json();

    horarios.forEach(h => {
        const nombre = getDeviceNameById(h.deviceId);
        const dias = h.activeDays.join(', ');
        const div = document.createElement('div');
        div.className = 'card-horario';

        let descripcionHTML = '';
        if (h.descripcion && h.descripcion.trim()) {
            descripcionHTML = `
            <div class="descripcion-card">
                <strong>Descripción:</strong>
                <div>${h.descripcion}</div>
            </div>`;
        }

        div.innerHTML = `
        <i class="bi bi-x-circle-fill icon-eliminar" data-id="${h._id}" title="Eliminar"></i>
        <h4>${nombre}</h4>
        <div class="contenido-horario">
            <div class="dispositivo-img-horario">
                <img src="/static/img/DispositivoBlanco_Azul.png" alt="Dispositivo" title="Dispositivo">
            </div>
            <div class="detalle-horario">
                <p><strong>Días:</strong> ${dias}</p>
                <p><strong>De:</strong> ${h.startTime} <strong>a</strong> ${h.endTime}</p>
                <p><strong>Intervalo:</strong> cada ${h.interval} min</p>
            </div>
            ${descripcionHTML}
        </div>
    `;

        contenedor.appendChild(div);
    });

    document.querySelectorAll('.icon-eliminar').forEach(icon => {
        icon.addEventListener('click', async () => {
            const id = icon.dataset.id;
            if (confirm('¿Eliminar este horario?')) {
                const del = await authFetch(`/api/schedules/${id}`, { method: 'DELETE' });
                if (del.ok) mostrarHorarios();
                else mostrarToast('Error al eliminar', 'error');
            }
        });
    });
}

export async function initHorarios() {
    dispositivosEnHorarios = await obtenerDispositivos(); 
    cargarDispositivosEnHorario();

    const form = document.getElementById("form-horarios");
    const submitBtn = form.querySelector('button[type="submit"]');
    let envioEnProgreso = false;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (envioEnProgreso) return;
        envioEnProgreso = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        const deviceId = document.getElementById("device-select").value;
        const interval = parseInt(document.getElementById("interval").value);
        let startTime = document.getElementById("start-time").value;
        let endTime = document.getElementById("end-time").value;

        // Validación UX de rango parcial
        if (startTime === "00:00" && endTime === "12:00") {
            mostrarToast("Este horario solo cubre hasta el mediodía. Si deseas monitoreo 24 horas, usa de 00:00 a 23:59.",'info');
        }

        // Interpretar '00:00 a 00:00' como 'todo el día'
        if (startTime === "00:00" && endTime === "00:00") {
            endTime = "23:59";
        }
        const activeDays = Array.from(document.querySelectorAll('input[name="dias"]:checked')).map(cb => cb.value);
        const descripcion = document.getElementById("descripcion").value.trim();

        console.log("Debug horario:", startTime, endTime);

        if (!deviceId || !startTime || !endTime || !activeDays.length) {
            mostrarToast("Completa todos los campos.", 'error');
            envioEnProgreso = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar horarios';
            return;
        }

        // Verificar si ya existe un horario igual
        try {
            const resExistentes = await authFetch('/api/schedules');
            const existentes = await resExistentes.json();

            const yaExiste = existentes.some(h =>
                h.deviceId === deviceId &&
                h.startTime === startTime &&
                h.endTime === endTime &&
                h.interval === interval &&
                JSON.stringify([...h.activeDays].sort()) === JSON.stringify([...activeDays].sort())
            );

            if (yaExiste) {
                mostrarToast("Ya existe un horario idéntico para este dispositivo.",'error');
                envioEnProgreso = false;
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar horarios';
                return;
            }

            // Si no existe, proceder con POST
            const res = await authFetch("/api/schedules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deviceId,
                    interval,
                    startTime,
                    endTime,
                    activeDays,
                    descripcion
                })
            });

            if (!res.ok) throw new Error("No se pudo guardar el horario.");

            mostrarToast("Horario guardado correctamente.",'success');
            form.reset();
            await mostrarHorarios();
        } catch (err) {
            console.error(err);
            mostrarToast("Error al guardar horario.",'error');
        } finally {
            envioEnProgreso = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar horarios';
        }
    });

    await mostrarHorarios();
}
