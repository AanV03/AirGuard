document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('confirmar-reset');

    // 1. Extraer token desde URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        mostrarToast('Token de recuperación no válido o ausente.', 'error');
        window.location.href = '/login.html';
        return;
    }

    // Rellenar el campo input[name="token"] con el valor del token del url
    const tokenInput = form.elements['token'];
    if (tokenInput) {
        tokenInput.value = token;
        tokenInput.readOnly = true; // evita edición manual
    }

    // 2. Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = form.elements['newPassword'].value.trim();
        const confirmPassword = form.elements['confirmPassword'].value.trim();

        if (newPassword !== confirmPassword) {
            mostrarToast('Las contraseñas no coinciden.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword, confirmPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cambiar contraseña');
            }

            mostrarToast('¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.', 'success');
            window.location.href = '/login';
        } catch (err) {
            console.error(err);
            mostrarToast('Hubo un problema al cambiar la contraseña. Intenta nuevamente.', 'error');
        }
    });
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
