let intentosFallidos = 0;

// Crear el enlace pero oculto inicialmente
const linkRecuperar = document.createElement('a');
linkRecuperar.href = '/RecuperarContrasena';
linkRecuperar.textContent = '¿Olvidaste tu contraseña?';
linkRecuperar.classList.add('links');
linkRecuperar.style.display = 'none';

// Agregar el enlace al contenedor del formulario
document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.querySelector('.form-container');
    if (formContainer) formContainer.appendChild(linkRecuperar);
});

// Login tradicional
document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = this.email.value.trim();
    const password = this.password.value.trim();

    if (!email.includes('@')) {
        mostrarToast('Por favor ingresa un correo válido.', 'info');
        return;
    }

    if (password.length < 6) {
        mostrarToast('La contraseña debe tener al menos 6 caracteres.', 'error');
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
            if (!data.usuario || !data.usuario._id) {
                mostrarToast('La respuesta del servidor no contiene el ID de usuario.', 'error');
                return;
            }

            localStorage.setItem('usuarioLogueado', true);
            localStorage.setItem('user_id', data.usuario._id);
            localStorage.setItem('nombreUsuario', data.usuario.nombre || 'Desconocido');
            localStorage.setItem('correoUsuario', data.usuario.email || 'sincorreo@airguard.com');

            window.location.href = '/configuration';
        } else {
            mostrarToast(data.error || 'Error al iniciar sesión', 'error');

            // Aumentar contador de intentos fallidos
            intentosFallidos++;
            if (intentosFallidos >= 3) {
                linkRecuperar.style.display = 'block';
            }
        }

    } catch (error) {
        console.error('[login] Error en conexión:', error);
        mostrarToast('Error de conexión con el servidor', 'error');
    }
});

// Login con Google
window.onGoogleSignIn = async function (response) {
    try {
        const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();

        if (res.ok) {
            if (!data.user || !data.user._id) {
                mostrarToast('La respuesta del servidor no contiene el ID de usuario (Google).', 'info');
                return;
            }

            localStorage.setItem('usuarioLogueado', true);
            localStorage.setItem('user_id', data.user._id);
            localStorage.setItem('nombreUsuario', data.user.nombre || 'Desconocido');
            localStorage.setItem('correoUsuario', data.user.email || 'sincorreo@airguard.com');
            localStorage.setItem('token', data.token);

            window.location.href = '/configuration';
        } else {
            mostrarToast(data.error || 'Error al iniciar sesión con Google', 'error');
        }
    } catch (error) {
        console.error('[Google Login] Error en conexión:', error);
        mostrarToast('Error al iniciar sesión con Google', 'error');
    }
};

window.onload = () => {
    google.accounts.id.initialize({
        client_id: "354426284146-id08j7159muv8is442969qmn2p14j5h0.apps.googleusercontent.com",
        callback: onGoogleSignIn,
        ux_mode: "popup"
    });

    google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        {
            theme: "outline",
            size: "large",
            type: "standard"
        }
    );
};

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
