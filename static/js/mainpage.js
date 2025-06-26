function login() {
    window.location.href = "/login";
}

function register() {
    window.location.href = "/register";
}

function logout() {
    localStorage.removeItem("usuarioLogueado");
    window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector("nav");
    const isLoggedIn = localStorage.getItem("usuarioLogueado");

    nav.innerHTML = isLoggedIn
        ? `
        <button class="buttonConfig" onclick="window.location.href='/configuration'">Configuración</button>
        <button class="buttonLogout" onclick="logout()">Cerrar sesión</button>
        <button class="buttonShop"><i class="bi bi-cart4"></i></button>
        `
        : `
        <button class="buttonLogin" onclick="login()">Iniciar sesión</button>
        <button class="buttonRegister" onclick="register()">Registrarse</button>
        <button class="buttonShop"><i class="bi bi-cart4"></i></button>
        `;

    // Toggle hamburguesa
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("main-menu");

    toggle.addEventListener("click", () => {
        menu.classList.toggle("active");
    });
});
