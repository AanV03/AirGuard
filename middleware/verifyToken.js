const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let token = null;

    // Verificar primero cookie
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // Luego Authorization header
    else if (req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Acceso no autorizado: token no enviado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('[verifyToken] Token inválido o expirado:', error);
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

