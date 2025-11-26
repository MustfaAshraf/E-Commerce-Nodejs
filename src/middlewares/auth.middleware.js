const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {

    let token = req.headers.authorization?.split(" ")[1];

    if (!token && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token)
      return res.status(401).json({ message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user info to req
    next();

  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};
