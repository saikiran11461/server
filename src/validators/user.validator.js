
const { body } = require("express-validator");

const registerValidator = [
	body("name").notEmpty().withMessage("Name is required"),
	body("email").isEmail().withMessage("Valid email is required"),
	body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

const loginValidator = [
	body("email").isEmail().withMessage("Valid email is required"),
	body("password").notEmpty().withMessage("Password is required")
];

module.exports = { registerValidator, loginValidator };