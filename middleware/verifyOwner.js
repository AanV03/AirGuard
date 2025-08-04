module.exports = (req, res, next) => {
    if (req.user.ownerId) {
        return res.redirect('/?error=subusuario');
    }
    next();
};
