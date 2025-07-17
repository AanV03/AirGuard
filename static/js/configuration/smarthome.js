// Función principal para inicializar la interfaz de Smart Home
export function initSmartHome() {
    // Botones e interfaces principales del DOM
    const addRoomBtn = document.getElementById('add-room-btn');
    const floorTabs = document.getElementById('floor-tabs');
    const floorContainer = document.getElementById('floor-container');


    // Objeto para llevar el conteo de habitaciones por piso
    let roomCounters = {}; // Ej: { 1: 3, 2: 1 }
    let currentFloor = 1;


    // Inicializa la interfaz con el primer piso visible y activo
    createFloor(1);
    activateFloor(1);


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


    // Al hacer clic en "Agregar habitación"
    addRoomBtn.addEventListener('click', () => {
        const houseLayout = getCurrentLayout();
        const room = document.createElement('div');
        room.className = 'room-block';

        // Se calcula la posición de la habitación en la cuadrícula
        // Cada fila tiene hasta 4 habitaciones, por lo tanto:
        // row determina la fila (0,1,2,...) y col la columna (0 a 3)
        const roomNumber = getNextRoomNumber(currentFloor);
        const row = Math.floor((roomNumber - 1) / 4); // División entera para fila
        const col = (roomNumber - 1) % 4; // Módulo para columna
        const posX = col * 160; // 160px es el ancho por celda horizontal
        const posY = row * 160; // 160px es la altura por celda vertical

        // Guardamos posición como atributos personalizados
        room.dataset.x = posX;
        room.dataset.y = posY;

        // Se generan lecturas simuladas para cada sensor
        const lecturas = sensoresSimulados();
        const keys = Object.keys(lecturas);

        // Se construye el HTML interno de la habitación con botones y lecturas
        room.innerHTML = `
        <div class="room-controls">
            <button class="btn-delete" title="Eliminar"><i class="bi bi-x-circle-fill"></i></button>
            <button class="btn-resize" title="Redimensionar"><i class="bi bi-pencil-square"></i></button>
        </div>
        <h4 contenteditable="true">Habitación ${roomNumber}</h4>
        <div class="lecturas-grid">
            ${keys.map(k => `
                <div class="sensor-nombre">${k}</div>
                <div class="sensor-valor">${lecturas[k]}</div>
            `).join("")}
        </div>
    `;

        // Posicionamiento y dimensiones iniciales de la habitación
        room.style.transform = `translate(${posX}px, ${posY}px)`;
        room.style.width = '140px';
        room.style.height = '140px';

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


    // Devuelve el número de habitación siguiente para un piso específico
    function getNextRoomNumber(floor) {
        if (!roomCounters[floor]) roomCounters[floor] = 0;
        roomCounters[floor]++;
        return roomCounters[floor];
    }


    // Obtiene el layout (contenedor) del piso actualmente activo
    function getCurrentLayout() {
        return document.querySelector(`.house-layout[data-floor="${currentFloor}"]`);
    }


    // Habilita interacción (drag y resize) para una habitación recién creada
    function initRoomInteraction(el, layoutRef) {
        const deleteBtn = el.querySelector('.btn-delete');
        const resizeBtn = el.querySelector('.btn-resize');

        // Elimina la habitación cuando se hace clic en el botón correspondiente
        deleteBtn.addEventListener('click', () => el.remove());

        let resizingEnabled = false;

        // Alterna el modo redimensionar al presionar el botón de editar tamaño
        resizeBtn.addEventListener('click', () => {
            resizingEnabled = !resizingEnabled;
            el.classList.toggle('resizing', resizingEnabled);
            interact(el).resizable({ enabled: resizingEnabled });
        });

        // Eleva la habitación seleccionada al frente del resto
        el.addEventListener('mousedown', () => {
            document.querySelectorAll('.room-block').forEach(rb => rb.style.zIndex = '1');
            el.style.zIndex = '999';
        });

        // Configura la funcionalidad de arrastrar usando Interact.js
        interact(el)
            .draggable({
                modifiers: [
                    // Restringe el movimiento dentro del layout actual
                    interact.modifiers.restrictRect({ restriction: layoutRef, endOnly: true }),
                    // Alinea el movimiento al grid de 20x20 px para mantener orden visual
                    interact.modifiers.snap({ targets: [interact.snappers.grid({ x: 20, y: 20 })] })
                ],
                listeners: {
                    move(event) {
                        const target = event.target;

                        // Calcula la nueva posición sumando el desplazamiento del evento al estado previo
                        let x = (parseFloat(target.dataset.x) || 0) + event.dx;
                        let y = (parseFloat(target.dataset.y) || 0) + event.dy;

                        // Ajusta al grid más cercano redondeando a múltiplos de 20
                        x = Math.round(x / 20) * 20;
                        y = Math.round(y / 20) * 20;

                        // Se construye un rectángulo proyectado en la nueva posición
                        const futureRect = {
                            left: x,
                            top: y,
                            right: x + target.offsetWidth,
                            bottom: y + target.offsetHeight
                        };

                        // Se verifica si ese nuevo rectángulo colisionaría con alguna otra habitación
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

                        // Si no hay colisión, se actualiza la posición visual y los datos
                        if (!collision) {
                            target.style.transform = `translate(${x}px, ${y}px)`;
                            target.dataset.x = x;
                            target.dataset.y = y;
                        }
                    },
                    end(event) {
                        event.target.style.zIndex = '';
                    }
                }
            })
            // Configura la funcionalidad de redimensionar usando Interact.js
            .resizable({
                enabled: false,
                edges: { left: true, right: true, bottom: true, top: true },
                modifiers: [
                    // Limita el redimensionado a dentro del contenedor del piso
                    interact.modifiers.restrictEdges({ outer: layoutRef }),
                    // Define límites mínimos y máximos del tamaño de habitación
                    interact.modifiers.restrictSize({
                        min: { width: 100, height: 100 },
                        max: { width: 500, height: 500 }
                    }),
                    // Ajusta el tamaño al grid para mantener coherencia visual
                    interact.modifiers.snapSize({
                        targets: [interact.snappers.grid({ x: 20, y: 20 })]
                    })
                ],
                listeners: {
                    move(event) {
                        const target = event.target;
                        let { width, height } = event.rect;

                        // Calcula el nuevo punto superior izquierdo según el desplazamiento durante el resize
                        const x = (parseFloat(target.dataset.x) || 0) + event.deltaRect.left;
                        const y = (parseFloat(target.dataset.y) || 0) + event.deltaRect.top;

                        // Se construye un rectángulo proyectado con las nuevas dimensiones
                        const futureRect = {
                            left: x,
                            top: y,
                            right: x + width,
                            bottom: y + height
                        };

                        // Verifica si hay colisión con otras habitaciones
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

                        // Si no colisiona, se actualiza la visualización y las coordenadas
                        if (!collision) {
                            target.style.width = `${width}px`;
                            target.style.height = `${height}px`;
                            target.style.transform = `translate(${x}px, ${y}px)`;
                            target.dataset.x = x;
                            target.dataset.y = y;
                        }
                    }
                }
            });
    }


    // Detecta si dos rectángulos se están superponiendo
    function rectsIntersect(a, b) {
        return !(a.left >= b.right || a.right <= b.left || a.top >= b.bottom || a.bottom <= b.top);
    }


    // Generador de números aleatorios enteros dentro de un rango (para los valores de los sensores simulados)
    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
