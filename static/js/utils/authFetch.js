export function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}) // solo si hay token
    };

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include' // asegura que la cookie JWT viaje siempre
    })
        .then(async (res) => {
            if (res.status === 401) {
                const rutasPrivadas = ['/configuration', '/cuenta', '/dispositivos', '/smart-home'];

                const mostrarToast = rutasPrivadas.some(ruta => currentPath.startsWith(ruta));

                if (mostrarToast) {
                    localStorage.setItem('toastMensaje', 'Sesión expirada. Vuelve a iniciar sesión.');
                    window.location.href = '/'; // redirige solo si era una sección privada
                }

                // Limpieza de sesión
                localStorage.removeItem('token');
                localStorage.removeItem('usuarioLogueado');

                throw new Error('Token expirado');
            }

            return res;
        });
}
