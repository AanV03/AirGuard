import { authFetch } from '../utils/authFetch.js';

export async function initCuenta() {
    const form = document.getElementById('form-cuenta');
    if (!form) return;

    const userId = localStorage.getItem('user_id');
    if (!userId) {
        mostrarToast('No hay sesión activa', 'error');
        return;
    }

    // Cargar datos del usuario
    try {
        const res = await authFetch(`/api/users/${userId}`);
        if (res.ok) {
            const user = await res.json();
            form.nombre.value = user.nombre || '';
            form.email.value = user.email || '';
        } else {
            console.error('Error al obtener usuario:', await res.text());
        }
    } catch (err) {
        console.error('Error al cargar datos del usuario:', err);
    }

    // Enviar formulario de actualización
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            nombre: form.nombre.value.trim(),
            email: form.email.value.trim()
        };

        const password = form.password.value.trim();
        if (password) data.password = password;

        try {
            const res = await authFetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (res.ok) {
                mostrarToast('Datos actualizados correctamente', 'success');
                form.password.value = '';
            } else {
                mostrarToast(result.error || 'Error al actualizar usuario', 'error');
            }
        } catch (err) {
            console.error('Error en actualización:', err);
            mostrarToast('Error al actualizar usuario', 'error');
        }
    });
}
