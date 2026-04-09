const express = require("express");
const { donationController } = require("../controllers/donation.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");

const donationRouter = express.Router();

donationRouter.post("/", donationController.create);

donationRouter.get("/", authMiddleware, adminMiddleware, donationController.list);
donationRouter.get("/:id", authMiddleware, adminMiddleware, donationController.get);
donationRouter.put("/:id", authMiddleware, adminMiddleware, donationController.update);
donationRouter.delete("/:id", authMiddleware, adminMiddleware, donationController.delete);

module.exports = { donationRouter };
