
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
	let token;
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		token = authHeader.split(" ")[1];
	} else if (req.cookies && req.cookies.token) {
		token = req.cookies.token;
	}
	if (!token) {
		return res.status(401).json({ message: "No token provided" });
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" });
	}
};

const adminMiddleware = (req, res, next) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "Admin access required" });
	}
	next();
};

module.exports = { authMiddleware, adminMiddleware };