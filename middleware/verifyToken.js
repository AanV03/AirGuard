const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT enviado por el cliente.
 * 
 * Este middleware:
 * - Lee el token desde la cookie 'token'
 * - Verifica que sea válido y no haya expirado
 * - Inserta los datos del usuario (`id`, `email`, `role`) en `req.user`
 * - Si no hay token o es inválido, responde con error
 */
module.exports = (req, res, next) => {
    const token = req.cookies.token; // Leer token desde cookies

    // Si no hay token, rechazar la petición
    if (!token) {
        return res.status(401).json({ error: 'Acceso no autorizado: token no enviado' });
    }

    try {
        // Verificar y decodificar el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Guardar la info del usuario en el request
        req.user = decoded; // Ejemplo: { id, email, role }

        // Continuar al siguiente middleware o controlador
        next();

    } catch (error) {
        console.error('[verifyToken] Token inválido o expirado:', error);
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};
