/**
 *
 * @author Anass Ferrak aka " TheLordA " <ferrak.anass@gmail.com>
 * GitHub repo: https://github.com/TheLordA/Instagram-Clone
 *
 */

const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  
  // Check if authorization header exists
  if (!authorization) {
    return res.status(401).json({ error: "You must be logged in." });
  }

  // Extract the token from the authorization header
  const token = authorization.replace("Bearer ", "");

  // Verify the token using the JWT secret
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "Your session has expired. Please log in again." });
    }

    const { _id } = payload;

    // Find the user by the ID in the token payload
    User.findById(_id)
      .then((userdata) => {
        if (!userdata) {
          return res.status(404).json({ error: "User not found." });
        }

        // Make the user data accessible via req.user
        req.user = userdata;

        // Proceed to the next middleware or route handler
        next();
      })
      .catch((err) => {
        // Handle any errors that occur while finding the user
        return res.status(500).json({ error: "Server error while retrieving user data." });
      });
  });
};
