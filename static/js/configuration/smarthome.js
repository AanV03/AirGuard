import { obtenerDispositivos } from './dispositivos.js';
import { authFetch } from '../utils/authFetch.js';

// funcion para obtener el nombre por id
function getDeviceNameById(id) {
    const d = dispositivosDisponibles.find(d => d._id === id);
    return d ? d.nombre : 'Dispositivo desconocido';
}

// Variables globables para llevar el conteo de habitaciones por piso
let roomCounters = {}; // Ej: { 1: 3, 2: 1 }
let currentFloor = 1;
let floorTabs, floorContainer;
let dispositivosDisponibles = [];

// Crea un nuevo piso y lo agrega a la interfaz
function createFloor(floorNumber) {
    const btn = document.createElement('button');
    btn.className = 'floor-tab';
    btn.dataset.floor = floorNumber;
    btn.innerHTML = `Piso ${floorNumber} <span class="delete-floor" title="Eliminar piso"><i class="bi bi-trash3"></i></span>`;
    floorTabs.insertBefore(btn, document.getElementById('add-floor-btn'));

    const layout = document.createElement('div');
    layout.className = 'house-layout hidden';
    layout.dataset.floor = floorNumber;
    floorContainer.appendChild(layout);
}

// Activa visualmente y funcionalmente un piso específico
function activateFloor(floorNumber) {
    currentFloor = floorNumber;

    document.querySelectorAll('.floor-tab').forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.floor) === floorNumber);
    });

    document.querySelectorAll('.house-layout').forEach(layout => {
        layout.classList.toggle('hidden', parseInt(layout.dataset.floor) !== floorNumber);
    });
}

// Obtiene el layout (contenedor) del piso actualmente activo
function getCurrentLayout() {
    return document.querySelector(`.house-layout[data-floor="${currentFloor}"]`);
}

// Habilita interacción (drag y resize) para una habitación recién creada
function initRoomInteraction(el, layoutRef) {

    // Limpia cualquier configuración previa de interact
    interact(el).unset();

    const deleteBtn = el.querySelector('.btn-delete');
    const resizeBtn = el.querySelector('.btn-resize');

    const btnVincular = el.querySelector('.btn-vincular-dispositivo');
    if (btnVincular) {
        btnVincular.addEventListener('click', () => {
            habitacionSeleccionada = el;
            abrirModalSeleccionDispositivo(el);
        });
    }

    // Elimina la habitación
    deleteBtn.addEventListener('click', () => el.remove());

    let resizingEnabled = false;

    // Alterna modo de redimensionar
    resizeBtn.addEventListener('click', () => {
        layoutRef.querySelectorAll('.room-block.resizing').forEach(rb => {
            if (rb !== el) {
                rb.classList.remove('resizing');
                interact(rb).resizable({ enabled: false });
            }
        });

        resizingEnabled = !resizingEnabled;
        el.classList.toggle('resizing', resizingEnabled);
        interact(el).resizable({ enabled: resizingEnabled });
    });

    // Lleva la habitación al frente
    el.addEventListener('mousedown', () => {
        layoutRef.querySelectorAll('.room-block').forEach(rb => rb.style.zIndex = '1');
        el.style.zIndex = '999';
    });

    // Función auxiliar para sincronizar transform -> dataset.x/y
    function syncTransformToDataset(target) {
        const transform = window.getComputedStyle(target).transform;
        if (transform && transform !== 'none') {
            const match = transform.match(/matrix.*\(([^,]+),[^,]+,[^,]+,[^,]+,([^,]+),([^,]+)\)/);
            if (match) {
                target.dataset.x = Math.round(parseFloat(match[2]) || 0);
                target.dataset.y = Math.round(parseFloat(match[3]) || 0);
            }
        }
    }

    // Interacción de arrastre (drag)
    interact(el)
        .draggable({
            modifiers: [
                interact.modifiers.restrictRect({ restriction: layoutRef, endOnly: true }),
                interact.modifiers.snap({ targets: [interact.snappers.grid({ x: 20, y: 20 })] })
            ],
            listeners: {
                move(event) {
                    const target = event.target;
                    let x = (parseFloat(target.dataset.x) || 0) + event.dx;
                    let y = (parseFloat(target.dataset.y) || 0) + event.dy;

                    x = Math.round(x / 20) * 20;
                    y = Math.round(y / 20) * 20;

                    const futureRect = {
                        left: x,
                        top: y,
                        right: x + target.offsetWidth,
                        bottom: y + target.offsetHeight
                    };

                    const collision = [...layoutRef.querySelectorAll('.room-block')]
                        .filter(el2 => el2 !== target)
                        .some(other => {
                            const otherX = parseFloat(other.dataset.x) || 0;
                            const otherY = parseFloat(other.dataset.y) || 0;
                            return rectsIntersect(futureRect, {
                                left: otherX,
                                top: otherY,
                                right: otherX + other.offsetWidth,
                                bottom: otherY + other.offsetHeight
                            });
                        });

                    if (!collision) {
                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.dataset.x = x;
                        target.dataset.y = y;
                    }
                },
                end(event) {
                    event.target.style.zIndex = '';
                    document.body.style.cursor = '';
                    syncTransformToDataset(event.target); // <-- asegura posición real
                }
            }
        })

        // Interacción de redimensionamiento (resize)
        .resizable({
            enabled: false,
            edges: { left: true, right: true, bottom: true, top: true },

            modifiers: [
                interact.modifiers.restrictEdges({ outer: layoutRef }),
                interact.modifiers.restrictSize({
                    min: { width: 60, height: 60 },
                    max: { width: 600, height: 600 }
                }),
                interact.modifiers.snapSize({
                    targets: [interact.snappers.grid({ x: 20, y: 20 })]
                })
            ],

            listeners: {
                move(event) {
                    const target = event.target;
                    let { width, height } = event.rect;

                    const x = (parseFloat(target.dataset.x) || 0) + event.deltaRect.left;
                    const y = (parseFloat(target.dataset.y) || 0) + event.deltaRect.top;

                    const futureRect = {
                        left: x + 1,
                        top: y + 1,
                        right: x + width - 1,
                        bottom: y + height - 1
                    };

                    const collision = [...layoutRef.querySelectorAll('.room-block')]
                        .filter(el2 => el2 !== target)
                        .some(other => {
                            const otherX = parseFloat(other.dataset.x) || 0;
                            const otherY = parseFloat(other.dataset.y) || 0;

                            return rectsIntersect(futureRect, {
                                left: otherX,
                                top: otherY,
                                right: otherX + other.offsetWidth,
                                bottom: otherY + other.offsetHeight
                            });
                        });

                    if (!collision) {
                        target.style.width = `${width}px`;
                        target.style.height = `${height}px`;
                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.dataset.x = x;
                        target.dataset.y = y;
                    }
                },
                end(event) {
                    syncTransformToDataset(event.target); // <-- asegura posición final
                }
            }
        });

    // Observa el ancho para ajustar el título en estructuras
    if (el.classList.contains('room-block-estructura')) {
        const h4 = el.querySelector('h4');
        if (h4) {
            const resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    const width = entry.contentRect.width;
                    if (width < 80) {
                        h4.classList.add('vertical-text');
                    } else {
                        h4.classList.remove('vertical-text');
                    }
                }
            });
            resizeObserver.observe(el);
        }
    }
}

// Detecta si dos rectángulos se están superponiendo
function rectsIntersect(a, b) {
    return (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
    );
}

// funcion apara resetaer el layout o borrar la casa de la bd
async function resetHouse() {
    // Limpia visualmente
    floorContainer.innerHTML = '';
    floorTabs.querySelectorAll('.floor-tab').forEach(tab => tab.remove());
    roomCounters = {};
    currentFloor = null;
    document.getElementById('add-room-btn').disabled = true;

    // Intenta eliminar del backend
    try {
        const res = await authFetch('/api/home', { method: 'DELETE' });
        if (res.ok) {
            mostrarToast('Casa eliminada correctamente', 'success');
        } else {
            const data = await res.json();
            mostrarToast(data.error || 'Error al eliminar en el servidor', 'error');
        }
    } catch (err) {
        console.error('[resetHouse] Error al eliminar en backend:', err);
        mostrarToast('Error de conexión al eliminar', 'error');
    }
}

function getSensorStatus(sensor, value) {
    const rangos = {
        CO: {
            min: 0, max: 50, // ppm
            limites: [9, 35] // <=9 bueno, 10-35 moderado, >35 peligroso (EPA/OMS)
        },
        PM1_0: {
            min: 0, max: 50, // μg/m³
            limites: [10, 25] // estimado por analogía a PM2.5
        },
        PM2_5: {
            min: 0, max: 100,
            limites: [12, 35] // OMS: 12 bueno, 12–35 moderado, >35 peligroso
        },
        PM10: {
            min: 0, max: 150,
            limites: [50, 100] // OMS: <50 bueno, 51–100 moderado, >100 peligroso
        },
        Humedad: {
            min: 0, max: 100,
            limites: [30, 60] // ASHRAE: zona de confort 30–60%
        },
        Temperatura: {
            min: 0, max: 50,
            limites: [20, 26] // ASHRAE: confort interior entre 20–26°C
        },
        VOCs: {
            min: 0, max: 1000, // ppb
            limites: [300, 700] // fuente: Bosch BME680 datasheet
        },
        H2: {
            min: 0, max: 10,
            limites: [5, 7] // estimado, sin regulación directa
        },
        CH4: {
            min: 0, max: 10,
            limites: [5, 7] // valores típicos en sensores MQ-4 o CCS811
        },
        IAQ: {
            min: 0, max: 500,
            limites: [100, 300] // índice típico: 0–100 bueno, 101–300 moderado, >300 malo
        }
    };

    const r = rangos[sensor] || { min: 0, max: 100, limites: [30, 70] };
    const [lim1, lim2] = r.limites;

    let estado = 'normal';
    if (value > lim2) estado = 'peligroso';
    else if (value > lim1) estado = 'moderado';

    const percent = Math.min(100, Math.max(0, ((value - r.min) / (r.max - r.min)) * 100));

    return { percent, estado };
}

function abrirModalSeleccionDispositivo(roomElement) {
    // Validaciones iniciales
    if (!roomElement || !(roomElement instanceof HTMLElement)) {
        console.warn('[abrirModalSeleccionDispositivo] Se llamó sin una habitación válida.');
        return;
    }

    // Si es un bloque vacío (estructura), no se debe permitir vincular dispositivos
    if (roomElement.classList.contains('room-block-estructura')) {
        console.warn('[abrirModalSeleccionDispositivo] No se puede asignar dispositivo a una estructura vacía.');
        return;
    }

    const modal = document.getElementById('modal-dispositivos');
    const lista = document.getElementById('lista-dispositivos-modal');
    if (!modal || !lista) {
        console.error('[abrirModalSeleccionDispositivo] Modal o lista no encontrados.');
        return;
    }

    // roomId único para esta habitación
    const roomId = roomElement.dataset.roomId || crypto.randomUUID();
    roomElement.dataset.roomId = roomId;
    modal.dataset.roomId = roomId;

    // Limpiar lista del modal
    lista.innerHTML = '';

    // Buscar todos los dispositivos renderizados
    const dispositivos = dispositivosDisponibles;

    dispositivos.forEach(d => {
        const id = d._id;
        const nombre = d.nombre;
        const imagen = d.imagen || '/static/img/Dispositivo.png';

        const yaAsignado = document.querySelector(`[data-device-id="${id}"]`);
        if (yaAsignado) return;

        const item = document.createElement('li');
        item.className = 'item-dispositivo-modal';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '10px';
        item.style.marginBottom = '8px';
        item.style.cursor = 'pointer';

        item.innerHTML = `
        <img src="${imagen}" alt="${nombre}">
        <span>${nombre}</span>
    `;

        item.addEventListener('click', () => {
            roomElement.dataset.deviceId = id;
            mostrarDispositivoEnHabitacion(roomElement, imagen, nombre, d.estado);
            cerrarModal();
        });

        lista.appendChild(item);
    });

    modal.classList.remove('hidden');
}

// funcion para cerrar el modal
function cerrarModal() {
    document.getElementById('modal-dispositivos').classList.add('hidden');
}
document.getElementById('cerrar-modal-dispositivos').addEventListener('click', cerrarModal);


function mostrarDispositivoEnHabitacion(roomElement, imagen, nombre, estado) {
    if (!roomElement || !(roomElement instanceof HTMLElement)) return;
    if (roomElement.classList.contains('room-block-estructura')) return;

    const anteriorWrapper = roomElement.querySelector('.contenido-room');
    if (anteriorWrapper) anteriorWrapper.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'contenido-room';

    const estadoColor = {
        activo: '#4caf50',
        inactivo: '#e53935',
        mantenimiento: '#ff9800'
    };

    const dispositivo = document.createElement('div');
    dispositivo.className = 'dispositivo-asignado';
    dispositivo.innerHTML = `
        <img src="${imagen}" alt="${nombre}">
        <small>${nombre}</small>
        <small style="font-size: 10px; color: ${estadoColor[estado] || '#ccc'}">
            ${estado}
        </small>
        <button class="btn-quitar-dispositivo" title="Quitar dispositivo">
            <i class="bi bi-x-circle-fill"></i>
        </button>
    `;

    const lecturas = roomElement.querySelector('.lecturas-grid');
    if (!lecturas) return;

    wrapper.appendChild(dispositivo);
    wrapper.appendChild(lecturas);

    const btn = roomElement.querySelector('.btn-vincular-dispositivo');
    if (btn) btn.remove();

    roomElement.appendChild(wrapper);

    if (!roomElement.style.width) roomElement.style.width = '260px';

    dispositivo.querySelector('.btn-quitar-dispositivo').addEventListener('click', () => {
        if (confirm('¿Quitar el dispositivo?')) {
            roomElement.removeAttribute('data-device-id');
            wrapper.remove();

            const newBtn = document.createElement('button');
            newBtn.className = 'btn-vincular-dispositivo';
            newBtn.textContent = '+ Añadir dispositivo';
            newBtn.addEventListener('click', () => abrirModalSeleccionDispositivo(roomElement));

            roomElement.insertBefore(newBtn, roomElement.querySelector('h4').nextSibling);
            roomElement.appendChild(lecturas);
            roomElement.style.width = '180px';
        }
    });
}

let modalDispositivo, selectDispositivo;
let habitacionSeleccionada = null;

function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Función principal para inicializar la interfaz de Smart Home
export async function initSmartHome() {

    dispositivosDisponibles = await obtenerDispositivos();

    // Botones e interfaces principales del DOM
    const addRoomBtn = document.getElementById('add-room-btn');
    floorTabs = document.getElementById('floor-tabs');
    floorContainer = document.getElementById('floor-container');
    modalDispositivo = document.getElementById('modal-dispositivo');
    selectDispositivo = document.getElementById('select-dispositivo');

    await cargarLayout();

    // Generador de datos simulados para los sensores de cada habitación
    const sensoresSimulados = () => ({
        CO: rand(0, 20),
        PM1_0: rand(0, 10),
        PM2_5: rand(0, 25),
        PM10: rand(0, 50),
        Humedad: rand(30, 70),
        Temperatura: rand(18, 32),
        VOCs: rand(0, 1000),
        H2: rand(0, 10),
        CH4: rand(0, 5),
        IAQ: rand(0, 500)
    });

    function findFreePosition(layout, className = 'room-block') {
        const gridSize = 20;

        // Crear un bloque temporal para medir su tamaño exacto
        const temp = document.createElement('div');
        temp.className = className;
        temp.style.visibility = 'hidden';
        temp.style.position = 'absolute';
        layout.appendChild(temp);

        const blockWidth = temp.offsetWidth || 180;
        const blockHeight = temp.offsetHeight || 220;
        layout.removeChild(temp);

        const maxX = layout.clientWidth - blockWidth;
        const maxY = layout.clientHeight - blockHeight;

        for (let y = 0; y <= maxY; y += gridSize) {
            for (let x = 0; x <= maxX; x += gridSize) {
                const testRect = {
                    left: x,
                    top: y,
                    right: x + blockWidth,
                    bottom: y + blockHeight
                };

                const collision = [...layout.querySelectorAll('.room-block')].some(other => {
                    const ox = parseFloat(other.dataset.x) || 0;
                    const oy = parseFloat(other.dataset.y) || 0;
                    const ow = other.offsetWidth;
                    const oh = other.offsetHeight;

                    return rectsIntersect(testRect, {
                        left: ox,
                        top: oy,
                        right: ox + ow,
                        bottom: oy + oh
                    });
                });

                if (!collision) return { x, y };
            }
        }

        return { x: 0, y: 0 }; // fallback
    }

    // boton para "Agregar habitación"
    addRoomBtn.addEventListener('click', () => {
        const houseLayout = getCurrentLayout();
        const room = document.createElement('div');
        room.className = 'room-block';

        // Se calcula la posición de la habitación en la cuadrícula
        // Cada fila tiene hasta 4 habitaciones, por lo tanto:
        // row determina la fila (0,1,2,...) y col la columna (0 a 3)
        const roomNumber = getNextRoomNumber(currentFloor);
        const { x: posX, y: posY } = findFreePosition(houseLayout, 'room-block');

        // Guardamos posición como atributos personalizados
        room.dataset.x = posX;
        room.dataset.y = posY;

        // Se generan lecturas simuladas para cada sensor
        const lecturas = sensoresSimulados();
        const keys = Object.keys(lecturas);

        room.innerHTML = `
            <div class="room-controls">
                <button class="btn-delete" title="Eliminar"><i class="bi bi-x-circle-fill"></i></button>
                <button class="btn-resize" title="Redimensionar"><i class="bi bi-pencil-square"></i></button>
            </div>
            <h4 contenteditable="true">Habitación ${roomNumber}</h4>
            <button class="btn-vincular-dispositivo">+ Añadir dispositivo</button>
            <div class="lecturas-grid">
                ${keys.map(k => {
            const valor = lecturas[k];
            const { percent, estado } = getSensorStatus(k, valor);
            return `
                        <div class="sensor-item">
                            <div class="sensor-header">
                                <span class="sensor-nombre">${k}</span>
                                <span class="sensor-bar-label">${valor}</span>
                            </div>
                            <div class="sensor-bar-container">
                                <div class="sensor-bar ${estado}" style="--value:${percent}"></div>
                            </div>
                        </div>
                    `;
        }).join("")}
            </div>
        `;

        // Posicionamiento y dimensiones iniciales de la habitación
        room.style.transform = `translate(${posX}px, ${posY}px)`;
        room.style.width = '180px';
        room.style.height = '220px';

        // Si hay otras habitaciones en modo redimensionar, se desactiva esa funcionalidad
        document.querySelectorAll('.room-block.resizing').forEach(rb => {
            rb.classList.remove('resizing');
            interact(rb).resizable({ enabled: false });
        });

        // Se agrega la habitación al piso actual y se habilita su interacción
        houseLayout.appendChild(room);
        initRoomInteraction(room, houseLayout);
    });

    // Evento principal para manejar la interacción con los botones de pisos
    floorTabs.addEventListener('click', (e) => {

        // Eliminar un piso específico
        if (e.target.closest('.delete-floor')) {
            const parentBtn = e.target.closest('.floor-tab');
            const floorToDelete = parseInt(parentBtn.dataset.floor);

            if (!confirm(`¿Seguro que deseas borrar el piso ${floorToDelete}?`)) return;

            const layoutToRemove = document.querySelector(`.house-layout[data-floor="${floorToDelete}"]`);
            if (layoutToRemove) layoutToRemove.remove();

            parentBtn.remove();
            delete roomCounters[floorToDelete];

            // Si el piso eliminado estaba activo, se activa uno restante o se limpia todo
            if (currentFloor === floorToDelete) {
                const remainingFloors = [...document.querySelectorAll('.floor-tab')].map(f => parseInt(f.dataset.floor));
                const fallback = remainingFloors.length > 0 ? remainingFloors[0] : null;
                if (fallback) {
                    activateFloor(fallback);
                } else {
                    currentFloor = null;
                }
            }

            // elimina el piso en back después de eliminar visualmente el piso:
            actualizarBackendConPisos();

            return;
        }

        // Activar un piso al hacer clic en su botón
        if (e.target.classList.contains('floor-tab')) {
            const piso = parseInt(e.target.dataset.floor);
            activateFloor(piso);
        }

        // Crear un nuevo piso
        if (e.target.closest('#add-floor-btn')) {
            const currentFloors = [...document.querySelectorAll('.floor-tab')]
                .map(btn => parseInt(btn.dataset.floor))
                .filter(num => !isNaN(num));

            const newFloor = currentFloors.length > 0 ? Math.max(...currentFloors) + 1 : 1;

            createFloor(newFloor);
            activateFloor(newFloor);
        }
    });

    // Devuelve el número de habitación siguiente para un piso específico
    function getNextRoomNumber(floor) {
        if (!roomCounters[floor]) roomCounters[floor] = 0;
        roomCounters[floor]++;
        return roomCounters[floor];
    }

    // Generador de números aleatorios enteros dentro de un rango (para los valores de los sensores simulados)
    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Guardar la casa (pisos + habitaciones)
    document.getElementById('save-house-btn').addEventListener('click', async () => {

        const floors = [];

        document.querySelectorAll('.house-layout').forEach(layout => {

            const floorNumber = parseInt(layout.dataset.floor);
            if (isNaN(floorNumber)) return; // Ignora layouts corruptos o sin número

            const rooms = [];

            layout.querySelectorAll('.room-block').forEach(room => {

                let nombre = room.querySelector('h4')?.textContent.trim();
                if (!nombre) nombre = `Habitación`;

                const x = parseFloat(room.dataset.x) || 0;
                const y = parseFloat(room.dataset.y) || 0;

                let width = room.offsetWidth;
                let height = room.offsetHeight;

                if (!width || width <= 0) width = parseFloat(room.style.width) || 180;
                if (!height || height <= 0) height = parseFloat(room.style.height) || 220;

                const lecturas = {};
                const sensores = room.querySelectorAll('.lecturas-grid .sensor-item');
                const deviceId = room.dataset.deviceId || null;
                sensores.forEach(item => {
                    const nombre = item.querySelector('.sensor-nombre')?.textContent;
                    const valorTexto = item.querySelector('.sensor-bar-label')?.textContent;
                    const valor = parseFloat(valorTexto);
                    if (nombre) lecturas[nombre] = isNaN(valor) ? 0 : valor;
                });

                rooms.push({
                    nombre, x, y, width, height,
                    lecturas: Object.keys(lecturas).length > 0 ? lecturas : undefined,
                    deviceId: deviceId || undefined
                });
            });

            floors.push({ numero: floorNumber, habitaciones: rooms });
        });

        try {
            const res = await authFetch('/api/home', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pisos: floors })  // sin userId
            });

            if (res.ok) {
                mostrarToast('Casa guardada exitosamente', 'success');
            } else {
                const data = await res.json();
                mostrarToast(data.error || 'Error al guardar', 'error');
            }
        } catch (err) {
            console.error('[Guardar casa] Error:', err);
            mostrarToast('Error de conexión al guardar', 'error');
        }
    });

    // Botón para añadir bloque vacío (estructura sin sensores)
    document.getElementById('add-structure-btn').addEventListener('click', () => {
        const houseLayout = getCurrentLayout();
        const { x: posX, y: posY } = findFreePosition(houseLayout, 'room-block room-block-estructura');

        const block = document.createElement('div');
        block.className = 'room-block room-block-estructura';
        block.dataset.x = posX;
        block.dataset.y = posY;
        block.style.width = '180px';
        block.style.height = '220px';
        block.style.transform = `translate(${posX}px, ${posY}px)`;

        block.innerHTML = `
        <div class="room-controls">
            <button class="btn-delete" title="Eliminar"><i class="bi bi-x-circle-fill"></i></button>
            <button class="btn-resize" title="Redimensionar"><i class="bi bi-pencil-square"></i></button>
        </div>
        <h4 contenteditable="true">Zona vacía</h4>
    `;

        houseLayout.appendChild(block);
        initRoomInteraction(block, houseLayout);
    });

    // Botón de resetear toda la casa
    document.getElementById('reset-house-btn').addEventListener('click', () => {
        if (confirm('¿Seguro que deseas borrar todos los pisos y habitaciones?')) {
            resetHouse();
        }
    });

    // muestra el mensaje de ayuda para pantallas pequeñas

    let hintVisible = false;
    let hintTimeout = null;

    function mostrarHintScroll() {
        const hint = document.getElementById('scroll-hint');
        if (!hint || hintVisible || window.innerWidth > 600) return;

        hint.classList.remove('hidden');
        hintVisible = true;

        clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => {
            hint.classList.add('hidden');
            hintVisible = false;
        }, 5000);
    }

    // Mostrar al cargar
    mostrarHintScroll();

    window.addEventListener('resize', debounce(() => {
        const hint = document.getElementById('scroll-hint');

        if (window.innerWidth > 600 && hint) {
            hint.classList.add('hidden');
            hintVisible = false;
            clearTimeout(hintTimeout);
        }

        mostrarHintScroll();
    }, 300));

}

async function actualizarBackendConPisos() {
    const floors = [];

    document.querySelectorAll('.house-layout').forEach(layout => {
        const floorNumber = parseInt(layout.dataset.floor);
        if (isNaN(floorNumber)) return;

        const rooms = [];
        layout.querySelectorAll('.room-block').forEach(room => {
            const nombre = room.querySelector('h4')?.textContent.trim() || 'Habitación';
            const x = parseFloat(room.dataset.x) || 0;
            const y = parseFloat(room.dataset.y) || 0;
            const width = room.offsetWidth;
            const height = room.offsetHeight;

            const lecturas = {};
            const sensores = room.querySelectorAll('.lecturas-grid .sensor-item');
            const deviceId = room.dataset.deviceId || null;

            sensores.forEach(item => {
                const nombre = item.querySelector('.sensor-nombre')?.textContent;
                const valorTexto = item.querySelector('.sensor-bar-label')?.textContent;
                const valor = parseFloat(valorTexto);
                if (nombre) lecturas[nombre] = isNaN(valor) ? 0 : valor;
            });

            rooms.push({
                nombre, x, y, width, height,
                lecturas: Object.keys(lecturas).length > 0 ? lecturas : undefined,
                deviceId: deviceId || undefined
            });
        });

        floors.push({ numero: floorNumber, habitaciones: rooms });
    });

    try {
        const res = await authFetch('/api/home', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pisos: floors })
        });

        if (!res.ok) {
            const data = await res.json();
            console.warn('[actualizarBackendConPisos] Error:', data.error || 'Error desconocido');
        }
    } catch (err) {
        console.error('[actualizarBackendConPisos] Error de red:', err);
    }
}

async function cargarLayout() {
    try {
        dispositivosDisponibles = await obtenerDispositivos();

        const res = await authFetch('/api/home');
        if (!res.ok) throw new Error('No se pudo cargar');

        const data = await res.json();
        console.log('[debug] data:', data);
        if (!Array.isArray(data.pisos)) return;

        roomCounters = {}; // Reinicia contadores

        data.pisos.forEach(p => {
            let layout = document.querySelector(`.house-layout[data-floor="${p.numero}"]`);

            // Si no existe el piso, créalo
            if (!layout) {
                createFloor(p.numero);
                layout = document.querySelector(`.house-layout[data-floor="${p.numero}"]`);
            }

            if (!layout) {
                console.warn(`[cargarLayout] No se encontró o no se pudo crear el layout del piso ${p.numero}`);
                return;
            }

            layout.innerHTML = ''; // Limpia habitaciones anteriores del piso
            roomCounters[p.numero] = p.habitaciones.length;

            p.habitaciones.forEach(h => {
                const keys = Object.keys(h.lecturas || {});
                const esHabitacion = keys.length > 0 && Object.values(h.lecturas).some(v => typeof v === 'number');

                const room = document.createElement('div');
                room.className = esHabitacion ? 'room-block' : 'room-block room-block-estructura';

                layout.appendChild(room);

                room.dataset.x = h.x;
                room.dataset.y = h.y;
                room.style.transform = `translate(${h.x}px, ${h.y}px)`;

                const width = (typeof h.width === 'number' && h.width > 0) ? h.width : 180;
                const height = (typeof h.height === 'number' && h.height > 0) ? h.height : 220;

                room.style.width = `${width}px`;
                room.style.height = `${height}px`;

                room.innerHTML = `
                    <div class="room-controls">
                        <button class="btn-delete" title="Eliminar"><i class="bi bi-x-circle-fill"></i></button>
                        <button class="btn-resize" title="Redimensionar"><i class="bi bi-pencil-square"></i></button>
                    </div>
                    <h4 contenteditable="true">${h.nombre || 'Sin nombre'}</h4>
                    ${(!h.deviceId && esHabitacion) ? `<button class="btn-vincular-dispositivo">+ Añadir dispositivo</button>` : ''}
                    <div class="lecturas-grid">
                        ${esHabitacion ? keys.map(k => {
                    const valor = h.lecturas[k];
                    const { percent, estado } = getSensorStatus(k, valor);
                    return `
                                <div class="sensor-item">
                                    <div class="sensor-header">
                                        <span class="sensor-nombre">${k}</span>
                                        <span class="sensor-bar-label">${valor}</span>
                                    </div>
                                    <div class="sensor-bar-container">
                                        <div class="sensor-bar ${estado}" style="--value:${percent}"></div>
                                    </div>
                                </div>
                            `;
                }).join('') : ''}
                    </div>
                `;

                if (h.deviceId) {
                    room.dataset.deviceId = h.deviceId;
                    const dispositivo = dispositivosDisponibles.find(d => d._id === h.deviceId);
                    if (dispositivo) {
                        mostrarDispositivoEnHabitacion(
                            room,
                            dispositivo.imagen || '/static/img/Dispositivo.png',
                            dispositivo.nombre,
                            dispositivo.estado
                        );
                    } else {
                        console.warn(`[cargarLayout] Dispositivo no encontrado para ID: ${h.deviceId}`);
                    }
                }

                initRoomInteraction(room, layout);
                console.log('[debug] habitación cargada:', h);
            });
        });

        const primerPiso = data.pisos[0]?.numero || 1;
        activateFloor(primerPiso);
    } catch (err) {
        console.error('[cargarLayout] Error:', err);
    }
}