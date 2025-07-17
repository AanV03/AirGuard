
//  Modulos de logica separada
import { initCuenta } from './configuration/cuenta.js';
import { initDispositivos } from './configuration/dispositivos.js';
import { initSmartHome } from './configuration/smarthome.js';


// Redirigir si no hay sesión activa
if (!localStorage.getItem('usuarioLogueado')) {
    window.location.href = '/login';
}

const tabContents = document.querySelectorAll('.tab-content');
const tabs = document.querySelectorAll('.tab');
const aside = document.querySelector('aside');

const asideContents = {
    cuenta: "<h2>Cuenta de usuario</h2><p>Edita tu nombre, correo o cambia tu contraseña.</p>",
    dispositivos: "<h2>Dispositvos</h2><p>Añade tus dispositivos AirGuard, modificalos y eliminalos en el momento que lo requieras</p>",
    smarthome: "<h2>Smart-Home</h2><p>Apartado para crear tu casa virtual y poder visualzar tus dispotivos, aqui podras:.</p>",
    horarios: "<h2>Programación</h2><p>Define cuándo el dispositivo estará activo para medir o enviar datos.</p>",
    usuarios: "<h2>Gestión de usuarios</h2><p>Agrega o edita usuarios vinculados.</p>",
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

        // Ejecutar lógica específica por pestaña
        if (tab.dataset.tab === 'cuenta') initCuenta();
        if (tab.dataset.tab === 'dispositivos') initDispositivos();
        if (tab.dataset.tab === 'smarthome') initSmartHome();

        // Cambiar contenido del aside
        aside.innerHTML = asideContents[tab.dataset.tab] || "<h2>Info</h2><p>Selecciona una pestaña.</p>";

        // Logout
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

// Dark mode con switch
const darkToggle = document.getElementById("dark-toggle");

darkToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    const modo = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("airguard_theme", modo);
});

document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("airguard_theme");
    if (saved === "dark") {
        document.body.classList.add("dark-mode");
        darkToggle.checked = true;
    }
    const firstTab = document.querySelector('.tab.active')?.dataset.tab;
    if (firstTab === 'cuenta') {
        initCuenta();
    }
});
