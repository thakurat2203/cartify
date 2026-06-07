const jwt = require("jsonwebtoken");
const config = require("../config");

// Attach the verified JWT claims used by downstream controllers and role checks.
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Not authorized, token missing" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

// Keep route-level authorization explicit beside each protected admin endpoint.
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: insufficient permissions" });
      return;
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };
