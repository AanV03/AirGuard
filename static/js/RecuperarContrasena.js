document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('solicitar-reset');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.email.value.trim();
        const confirmEmail = form.confirmEmail.value.trim();

        // Validación 1: campos vacíos
        if (!email || !confirmEmail) {
            mostrarToast('Por favor, llena ambos campos.', 'error');
            return;
        }

        // Validación 2: igualdad
        if (email !== confirmEmail) {
            mostrarToast('Los correos no coinciden.', 'error');
            return;
        }

        try {
            const res = await fetch('/api/auth/recuperar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: confirmEmail }) // solo enviamos uno
            });

            const data = await res.json();

            if (res.ok) {
                mostrarToast('Se ha enviado un enlace de recuperación a tu correo.', 'info');
                form.reset();
            } else {
                mostrarToast(data.msg || 'Ocurrió un error. Intenta de nuevo.', 'error');
            }
        } catch (err) {
            console.error('Error en la solicitud:', err);
            mostrarToast('Error de red. Intenta más tarde.', 'error');
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
