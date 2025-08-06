//  Modulos de logica separada
import { initCuenta } from './configuration/cuenta.js';
import { initDispositivos } from './configuration/dispositivos.js';
import { initSmartHome, detenerAutoActualizacionLecturas } from './configuration/smarthome.js';
import { initHorarios } from './configuration/horarios.js';
import { initUsuarios } from './configuration/usuarios.js';
import { initSoporte } from './configuration/soporte.js';

import { authFetch } from './utils/authFetch.js';

// Verificar si el token sigue válido antes de continuar
// si no, redirige directamente al inicio
(async () => {
    try {
        const res = await authFetch('/api/users/me'); 
        if (!res.ok) throw new Error();
    } catch (err) {
        localStorage.setItem('toastMensaje', 'Sesión expirada. Vuelve a iniciar sesión.');
        window.location.href = '/';
    }
})();

// Redirigir si no hay sesión activa
if (!localStorage.getItem('usuarioLogueado')) {
    window.location.href = '/login';
}

const tabContents = document.querySelectorAll('.tab-content');
const tabs = document.querySelectorAll('.tab');
const aside = document.querySelector('aside');
const layout = document.getElementById('layout-container');

const asideContents = {
    cuenta: `
        <h2>Cuenta de usuario</h2>
        <p>Gestiona tu perfil personal:</p>
        <ul>
            <li>Edita tus datos, asi como nombre y correo electrónico</li>
            <li>Cambia tu contraseña sin problemas</li>
        </ul>
    `,
    dispositivos: `
        <h2>Dispositivos</h2>
        <p>Gestiona tus dispositivos AirGuard:</p>
        <ul>
            <li>Registra tus nuevos dispositivos</li>
            <li>Ve el estado de tus dispositivos asi como nombre e imagen</li>
            <li>Elimina tus dispositivos</li>
        </ul>
    `,
    smarthome: `
        <h2>Smart-Home</h2>
        <p>Diseña tu casa virtual y asigna sensores:</p>
        <ul>
            <li>Crear múltiples pisos</li>
            <li>Añade habitaciones y bloques estructurales</li>
            <li>Vincula tus dispositivos registrados</li>
            <li>Redimensiona y mueve cada bloque</li>
            <li>Visualiza lecturas ambientales</li>
            <li>Guarda y carga el diseño completo para acceder a el de nuevo</li>
        </ul>
    `,
    horarios: `
        <h2>Programación de horarios</h2>
        <p>Define cuándo tus dispositivos estarán activos:</p>
        <ul>
            <li>Selecciona días de la semana</li>
            <li>Asigna intervalos de tiempo</li>
            <li>Agrega descripciones personalizadas para mayor contexto</li>
            <li>Elimina o evita horarios duplicados</li>
        </ul>
    `,
    usuarios: `
        <h2>Gestión de usuarios</h2>
        <p>Administra subusuarios con permisos limitados:</p>
        <ul>
            <li>Crear cuentas para acceder desde la app</li>
            <li>Edita datos de subusuarios</li>
            <li>Elimina usuarios vinculados</li>
        </ul>
    `,
    soporte: `
        <h2>Soporte técnico</h2>
        <p>Reporta problemas técnicos desde este módulo:</p>
        <ul>
            <li>Selecciona tipo de problema (dispositivo, cuenta, etc.)</li>
            <li>Adjunta imagen o descripción del error</li>
            <li>Envia tu reporte directamente al sistema</li>
            <li>Reinicia tus dispositivos en caso de errores</li>
        </ul>
    `,
    salir: `
        <h2>Salir</h2>
        <p>Cierra sesión de forma segura</p>
    `
};

const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {

        // Cerrar menú si está abierto (solo para pantallas pequeñas)
        navMenu.classList.remove('open');

        // Cambiar pestaña activa
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Mostrar sección principal
        tabContents.forEach(content => content.classList.add('hidden'));
        const section = document.getElementById(tab.dataset.tab);
        section.classList.remove('hidden');

        const tabSeleccionada = tab.dataset.tab;

        // Solo detener auto-actualización de lecturas si salimos de SmartHome
        if (tabSeleccionada !== 'smarthome') {
            detenerAutoActualizacionLecturas();
        }

        // Ejecutar lógica específica por pestaña
        if (tab.dataset.tab === 'cuenta') initCuenta();
        if (tab.dataset.tab === 'dispositivos') initDispositivos();
        if (tab.dataset.tab === 'smarthome') initSmartHome();
        if (tab.dataset.tab === 'horarios') initHorarios();
        if (tab.dataset.tab === 'usuarios') initUsuarios();
        if (tab.dataset.tab === 'soporte') initSoporte();

        // Mostrar/ocultar aside y ajustar layout
        if (tab.dataset.tab === 'intro') {
            aside.style.display = 'none';
            layout.classList.add('full-width');
        } else {
            aside.style.display = '';
            layout.classList.remove('full-width');
            aside.innerHTML = asideContents[tab.dataset.tab] || "<h2>Info</h2><p>Selecciona una pestaña.</p>";
        }

        // Logout
        if (tab.dataset.tab === "salir") {
            setTimeout(() => {
                const logoutBtn = document.getElementById('btn-logout');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async () => {
                        try {
                            await fetch('/api/auth/logout', { method: 'POST' });
                        } catch (e) {
                            console.warn('Error al cerrar sesión:', e);
                        }
                        localStorage.clear();
                        window.location.href = "/";
                    });
                }
            }, 50);
        }
    });
});

// toast de mensajes de error o success
window.mostrarToast = function (mensaje, tipo = 'success') {
    const toast = document.getElementById('toast-mensaje');
    toast.textContent = mensaje;
    toast.className = `toast show ${tipo}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}

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

    // Detectar si estamos en la intro al cargar
    const currentVisible = document.querySelector('.tab-content:not(.hidden)');
    if (currentVisible?.id === 'intro') {
        aside.style.display = 'none';
        layout.classList.add('full-width');
    } else {
        aside.style.display = '';
        layout.classList.remove('full-width');
    }
});
