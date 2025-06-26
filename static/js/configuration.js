// Redirigir si no hay sesión activa
if (!localStorage.getItem('usuarioLogueado')) {
    window.location.href = '/login';
}

const tabContents = document.querySelectorAll('.tab-content');
const tabs = document.querySelectorAll('.tab');
const aside = document.querySelector('aside');

const asideContents = {
    estado: "<h2>Estado del dispositivo</h2><p>Muestra valores actuales de sensores como CO, PM2.5, temperatura y humedad.</p>",
    dispositivos: "<h2>Red y conectividad</h2><p>Configura WiFi, IPs estáticas y nombre del dispositivo.</p>",
    casa: "<h2>Parámetros del hogar</h2><p>Zona horaria, ubicación y condiciones ambientales típicas del lugar.</p>",
    horarios: "<h2>Programación</h2><p>Define cuándo el dispositivo estará activo para medir o enviar datos.</p>",
    filtros: "<h2>Umbrales y sensores</h2><p>Configura umbrales de alerta y sensores activos.</p>",
    usuarios: "<h2>Gestión de usuarios</h2><p>Añade o cambia contraseñas de acceso.</p>",
    soporte: "<h2>Soporte técnico</h2><p>Consulta logs y realiza reinicios del dispositivo.</p>",
    salir: "<h2>Salir</h2><p>Finaliza la sesión actual de configuración.</p>"
};

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Cambiar pestaña activa
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Mostrar sección principal
        tabContents.forEach(content => content.classList.add('hidden'));
        const section = document.getElementById(tab.dataset.tab);
        section.classList.remove('hidden');

        // Cambiar contenido del aside
        aside.innerHTML = asideContents[tab.dataset.tab] || "<h2>Info</h2><p>Selecciona una pestaña.</p>";

        // Si se hace clic en "salir", esperar el botón y vincular logout
        if (tab.dataset.tab === "salir") {
            setTimeout(() => {
                const logoutBtn = document.getElementById('btn-logout');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('usuarioLogueado');
                        window.location.href = "/";
                    });
                }
            }, 50);
        }
    });
});
