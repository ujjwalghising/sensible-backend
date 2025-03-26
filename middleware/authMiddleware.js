import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });  // ✅ Use `401` for missing token
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded user data to the request
    next();
  } catch (error) {
    console.error("Token verification failed:", error);

    // ✅ Differentiate between expired and invalid tokens
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    res.status(403).json({ message: "Forbidden: Invalid token" });  // `403` for invalid token
  }
};

export default verifyToken;  // ✅ Use default export for cleaner imports
