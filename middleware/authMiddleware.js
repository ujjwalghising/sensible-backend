import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Forbidden: No token provided" });  // Send `403` if missing token
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded token to the request
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({ message: "Forbidden: Invalid token" }); // Send `403` if invalid token
  }
};

export { verifyToken };
