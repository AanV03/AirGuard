// login.js
document.querySelector('form').addEventListener('submit', function (e) {
    const email = this.email.value.trim();
    const password = this.password.value.trim();

    if (!email.includes('@')) {
        alert('Por favor ingresa un correo válido.');
        e.preventDefault();
        return;
    }
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        e.preventDefault();
    }
});