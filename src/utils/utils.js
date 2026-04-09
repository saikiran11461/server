
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const hashPassword = async (password) => {
	return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
	return await bcrypt.compare(password, hash);
};

const generateToken = (payload) => {
	return jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
};

module.exports = { hashPassword, comparePassword, generateToken };