const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "Access denied. Admins only"
    });
  }
  next();
};

module.exports = adminOnly;