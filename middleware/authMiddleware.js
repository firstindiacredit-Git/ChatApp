import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.status(401).json({ message: "Authentication failed. No token provided." });

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = user;
    next();
  });
};
