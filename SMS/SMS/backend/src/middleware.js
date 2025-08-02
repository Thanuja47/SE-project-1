const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user role is allowed to access the route
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Access denied for " + req.user.role + ". Insufficient permissions.",
      });
    }
    next();
  };
};

module.exports = { authenticate, roleMiddleware };
