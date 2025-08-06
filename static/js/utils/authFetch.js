export function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}) // solo si hay token
    };

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include' // siempre incluye la cookie (para Google login)
    })
        .then(async (res) => {
            if (res.status === 401) {
                const currentPath = window.location.pathname;
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
