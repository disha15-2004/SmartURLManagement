const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return next();
  }

  try {
    const jwtSecret = "supersecretkey123";
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    // If token is invalid, we can just proceed as anonymous or throw an error. Let's proceed as anonymous.
    next();
  }
};
