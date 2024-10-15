import jwt from "jsonwebtoken";
import User from "../model/UserModel.js"; // Import your User model to fetch user data if necessary

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt; // Token expected in cookies

  // Check if token exists
  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication failed. No token provided." });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Store userId in the request object if token is valid
    req.userId = decodedToken.userId; // Ensure that 'userId' is set in your token payload
    req.userRole = decodedToken.role; // Optional: Add role if included in token

    // Optionally, fetch the user from the database to store user info in req
    try {
      const user = await User.findById(req.userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      req.user = user; // Store full user object for further use
    } catch (error) {
      return res.status(500).json({ message: "Error fetching user." });
    }

    next();
  });
};

// Middleware to verify admin role
export const isAdmin = (req, res, next) => {
  // Check if the user object exists and if the role is 'admin'
  if (req.user && req.user.role === "admin") {
    next(); // Proceed if user is admin
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};
