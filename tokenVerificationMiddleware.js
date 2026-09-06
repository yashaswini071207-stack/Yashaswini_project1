import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "You must login to continue"
      });
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );

    req.user = decodedToken;

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}