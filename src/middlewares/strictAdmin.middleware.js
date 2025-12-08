module.exports = (req, res, next) => {
    // We assume the user is already logged in (checked by previous auth middleware)
    if (req.user.role === 'admin') {
        return next();
    }
    
    // If it's an 'owner' (Vendor) or 'user', deny access
    return res.status(403).render('error', { 
        message: 'Access Denied: Platform Administrators Only.' 
    });
};