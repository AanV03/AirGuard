// configuration/cuenta.js
export async function initCuenta() {
    const form = document.getElementById('form-cuenta');
    if (!form) return;

    const userId = localStorage.getItem('user_id');
    if (!userId) {
        alert('No hay sesión activa');
        return;
    }

    // Cargar datos del usuario
    try {
        const res = await fetch(`/api/users/${userId}`);
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
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (res.ok) {
                alert('Datos actualizados correctamente');
                form.password.value = '';
            } else {
                alert(result.error || 'Error al actualizar usuario');
            }
        } catch (err) {
            console.error('Error en actualización:', err);
            alert('Error al actualizar usuario');
        }
    });
}