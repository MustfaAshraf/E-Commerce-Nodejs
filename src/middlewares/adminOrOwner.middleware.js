const adminOnly = (viewName) => {
  return (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "owner") {
      return res.status(403).render(viewName, {
        message: "Access denied. Admins and Vendors only"
      });
    }
    next();
  };
}

module.exports = adminOnly;