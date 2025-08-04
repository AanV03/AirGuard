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

    // Validaciones básicas
    if (nombre === '') return mostrarToast('Por favor ingresa tu nombre completo.', 'error');
    if (!email.includes('@')) return mostrarToast('Por favor ingresa un correo válido.', 'error');
    if (password.length < 6) return mostrarToast('La contraseña debe tener al menos 6 caracteres.', 'error');
    if (password !== confirmPassword) return mostrarToast('Las contraseñas no coinciden.', 'error');

    // Validaciones de dominio
    const dominio = email.split('@')[1];

    const dominiosValidos = [
        "gmail.com",
        "outlook.com",
        "hotmail.com",
        "yahoo.com",
        "icloud.com",
        "proton.me"
    ];

    const dominiosBloqueados = [
        "mailinator.com",
        "10minutemail.com",
        "tempmail.com",
        "yopmail.com",
        "guerrillamail.com",
        "dispostable.com",
        "trashmail.com"
    ];

    if (dominiosBloqueados.includes(dominio)) {
        return mostrarToast('No se permite registrar con correos temporales o desechables.', 'info');
    }

    if (!dominiosValidos.includes(dominio)) {
        return mostrarToast('Solo se permiten correos con dominios populares como gmail.com, outlook.com, etc.', 'error');
    }

    // Enviar datos al backend
    const data = { nombre, email, password, lat, long };

    try {
        const res = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            mostrarToast('Bienvenido, ' + result.usuario.nombre, 'success');
            window.location.href = '/configuration';
        } else {
            mostrarToast(result.error || 'Error al registrar usuario', 'error');
        }
    } catch (error) {
        console.error('[register] Error de red:', error);
        mostrarToast('Error al conectar con el servidor', 'error');
    }
});

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
