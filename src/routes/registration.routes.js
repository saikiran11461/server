const express = require("express");
const { register, listRegistrations, markAttendance } = require("../controllers/registration.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../utils/multer");

const registrationRouter = express.Router();

registrationRouter.post("/:eventId/register", upload.any(), register);

registrationRouter.get("/:eventId", authMiddleware, adminMiddleware, listRegistrations);

registrationRouter.post("/:eventId/:token/attendance", authMiddleware, adminMiddleware, markAttendance);

module.exports = { registrationRouter };
