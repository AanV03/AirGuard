/**
 * Middleware que permite acceso solo a usuarios con rol 'admin'
 *
 * Requiere que el middleware verifyToken ya haya sido ejecutado,
 * y que req.user contenga el objeto decodificado del JWT.
 */

module.exports = (req, res, next) => {
    // Verificar que haya un usuario autenticado y que su rol sea 'admin'
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Acceso restringido: se requiere rol de administrador'
        });
    }

    // Si es admin, continuar al siguiente middleware o controlador
    next();
};
