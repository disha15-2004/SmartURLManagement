const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if not token
  if (!token) {
    // If we want to allow anonymous shortening, we just don't set req.user and move on
    // But this middleware is for PROTECTED routes. So we block.
    return res.status(401).json({ details: "No token, authorization denied" });
  }

  // Verify token
  try {
    const jwtSecret = "supersecretkey123";
    const decoded = jwt.verify(token, jwtSecret);

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ details: "Token is not valid" });
  }
};
