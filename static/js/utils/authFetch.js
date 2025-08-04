export function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };

    return fetch(url, { ...options, headers,  credentials: 'include', })
        .then(async (res) => {
            if (res.status === 401) {
                const currentPath = window.location.pathname;

                // Solo mostrar toast si estamos en configuración o rutas internas
                const mostrarToast = currentPath.startsWith('/configuration');

                if (mostrarToast) {
                    localStorage.setItem('toastMensaje', 'Sesión expirada. Vuelve a iniciar sesión.');
                }

                localStorage.removeItem('token');
                localStorage.removeItem('usuarioLogueado');

                window.location.href = '/';
                throw new Error('Token expirado');
            }
            return res;
        });
}
