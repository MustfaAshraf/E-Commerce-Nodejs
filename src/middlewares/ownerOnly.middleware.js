const ownerOnly = (viewName) => {
  return (req, res, next) => {
    if (req.user.role !== "owner") {
      return res.status(403).render(viewName, {
        message: "Access denied. Owners only",
      });
    }
    next();
  };
}

module.exports = ownerOnly;