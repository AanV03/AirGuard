import { authFetch } from './utils/authFetch.js';

window.login = function () {
    window.location.href = "/login";
};

window.register = function () {
    window.location.href = "/register";
};

window.logout = function () {
    localStorage.removeItem("usuarioLogueado");
    window.location.reload();
};

document.addEventListener("DOMContentLoaded", async () => {
    const nav = document.querySelector("nav");

    try {
        const res = await authFetch('/api/users/me');
        if (!res.ok) throw new Error('Sesión inválida');

        // Renderizar botones para sesión activa
        nav.innerHTML = `
        <button id="btn-configuracion" class="buttonConfig">Configuración</button>
        <button id="btn-logout" class="buttonLogout">Cerrar sesión</button>
    `;

        document.getElementById('btn-configuracion').addEventListener('click', () => {
            window.location.href = "/configuration";
        });

        document.getElementById('btn-logout').addEventListener('click', async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' }); // Elimina la cookie httpOnly
            } catch (e) {
                console.warn('Error cerrando sesión:', e);
            }

            localStorage.clear(); // Limpia todo el almacenamiento local
            window.location.reload(); // Fuerza recarga para reconstruir la vista sin sesión
        });

    } catch {
        // Sesión no activa: mostrar botones de login/register
        localStorage.removeItem("usuarioLogueado");

        nav.innerHTML = `
        <button class="buttonLogin" onclick="login()">Iniciar sesión</button>
        <button class="buttonRegister" onclick="register()">Registrarse</button>
        <button class="buttonShop" onclick="location.href='/carrito'">
        <i class="bi bi-cart4"></i>
        </button>
    `;
    }


    // Toggle hamburguesa
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("main-menu");
    toggle.addEventListener("click", () => {
        menu.classList.toggle("active");
    });

    // Detectar si vino redirigido como subusuario
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'subusuario') {
        mostrarToast('Esta cuenta es un subusuario. Solo el usuario principal puede acceder a la configuración.', 'info');
    }

    const mensaje = localStorage.getItem('toastMensaje');
    if (mensaje) {
        mostrarToast(mensaje, 'error');
        localStorage.removeItem('toastMensaje');
    }
});

const mensaje = localStorage.getItem('toastMensaje');
if (mensaje) {
    mostrarToast(mensaje, 'error');
    localStorage.removeItem('toastMensaje');
}

// toast de mensajes de error o success
function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast-mensaje');
    toast.textContent = mensaje;
    toast.className = `toast show ${tipo}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}
