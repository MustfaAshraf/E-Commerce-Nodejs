// setUser.middleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
            res.locals.user = decoded;
            res.locals.isAuthenticated = true;
        } else {
            res.locals.user = null;
            res.locals.isAuthenticated = false;
        }
    } catch {
        res.locals.user = null;
        res.locals.isAuthenticated = false;
    }

    next();
};