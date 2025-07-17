// register.js

// Obtener coordenadas al cargar la página
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

document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = this.email.value.trim();
    const password = this.password.value;
    const confirmPassword = this.confirm_password.value;
    const nombre = this.nombre.value.trim();
    const lat = this.lat.value;
    const long = this.long.value;

    // Validaciones
    if (nombre === '') return alert('Por favor ingresa tu nombre completo.');
    if (!email.includes('@')) return alert('Por favor ingresa un correo válido.');
    if (password.length < 6) return alert('La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirmPassword) return alert('Las contraseñas no coinciden.');

    const data = { nombre, email, password, lat, long };

    try {
        const res = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', //  permite recibir la cookie httpOnly
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            // Registro exitoso con login automático
            alert('Bienvenido, ' + result.usuario.nombre);
            window.location.href = '/configuration';
        } else {
            alert(result.error || 'Error al registrar usuario');
        }
    } catch (error) {
        console.error('[register] Error de red:', error);
        alert('Error al conectar con el servidor');
    }
});
