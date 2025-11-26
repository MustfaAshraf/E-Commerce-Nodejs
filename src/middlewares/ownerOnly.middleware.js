const ownerOnly = (req, res, next) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({
      status: "fail",
      message: "Access denied. Owners only"
    });
  }
  next();
};

module.exports = ownerOnly;