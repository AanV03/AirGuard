// login.js

document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault(); // evitar submit tradicional

    const email = this.email.value.trim();
    const password = this.password.value.trim();

    if (!email.includes('@')) {
        alert('Por favor ingresa un correo válido.');
        return;
    }

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Guardar estado de sesión
            localStorage.setItem('usuarioLogueado', data.usuario);
            window.location.href = '/';
        } else {
            alert(data.error || 'Error al iniciar sesión');
        }

    } catch (error) {
        console.error(error);
        alert('Error de conexión con el servidor');
    }
});
