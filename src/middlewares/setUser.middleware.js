const jwt = require("jsonwebtoken");
const User = require("../models/users.model"); // 1. Import the Model

module.exports = async (req, res, next) => { // 2. Make function async
    try {
        if (req.cookies.jwt) {
            const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
            
            // 3. FETCH FRESH DATA FROM DB
            // This ensures we get the latest Role, the Avatar, and check if user is banned/deleted
            const user = await User.findById(decoded.id);

            if (user) {
                res.locals.user = user; 
                res.locals.isAuthenticated = true;
                
                // 4. Attach to req so controllers don't need to fetch it again
                req.user = user; 
            } else {
                // Token is valid, but user no longer exists in DB
                res.locals.user = null;
                res.locals.isAuthenticated = false;
                res.clearCookie('jwt'); // Clean up bad cookie
            }
        } else {
            res.locals.user = null;
            res.locals.isAuthenticated = false;
        }
    } catch (err) {
        console.error("Auth Middleware Error:", err.message);
        res.locals.user = null;
        res.locals.isAuthenticated = false;
    }

    next();
};