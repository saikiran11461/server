const express = require("express");
const { eventController } = require("../controllers/event.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");
const { eventValidationRules } = require("../validators/event.validator");
const { validationResult } = require("express-validator");
const upload = require("../utils/multer");

const eventRouter = express.Router();

const { register, listRegistrations, markAttendance, publicCheckin } = require("../controllers/registration.controller");

eventRouter.get("/", eventController.list);
eventRouter.get("/:id", eventController.get);

eventRouter.post("/:id/register", upload.any(), register);

eventRouter.post(
	"/",
	authMiddleware,
	adminMiddleware,
	upload.array("images", 5),
	eventValidationRules,
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	},
	eventController.create
);
eventRouter.put("/:id", authMiddleware, adminMiddleware, eventController.update);
eventRouter.put(
	"/:id",
	authMiddleware,
	adminMiddleware,
	eventValidationRules,
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		next();
	},
	eventController.update
);
eventRouter.delete("/:id", authMiddleware, adminMiddleware, eventController.delete);

eventRouter.get("/:id/registrations", authMiddleware, adminMiddleware, listRegistrations);

eventRouter.post(
	"/:id/registrations/:token/attendance",
	authMiddleware,
	adminMiddleware,
	markAttendance
);

eventRouter.post("/:id/checkin/:token", publicCheckin);

module.exports = { eventRouter };
