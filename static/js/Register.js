// register.js

// Pedir ubicación al cargar
window.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                document.getElementById('lat').value = pos.coords.latitude;
                document.getElementById('long').value = pos.coords.longitude;
            },
            (err) => {
                console.warn('Ubicación no disponible:', err.message);
            }
        );
    } else {
        console.warn('Geolocalización no soportada en este navegador');
    }
});

document.querySelector('form').addEventListener('submit', function (e) {
    const email = this.email.value.trim();
    const password = this.password.value;
    const confirmPassword = this.confirm_password.value;
    const name = this.nombre.value.trim(); // nombre, no name

    if (name === '') {
        alert('Por favor ingresa tu nombre completo.');
        e.preventDefault();
        return;
    }
    if (!email.includes('@')) {
        alert('Por favor ingresa un correo válido.');
        e.preventDefault();
        return;
    }
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        e.preventDefault();
        return;
    }
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        e.preventDefault();
    }
});
