const express = require("express");
const { galleryController } = require("../controllers/gallery.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");

const galleryRouter = express.Router();

galleryRouter.get("/", galleryController.list);
galleryRouter.get("/:id", galleryController.get);

galleryRouter.post("/", authMiddleware, adminMiddleware, galleryController.create);
galleryRouter.put("/:id", authMiddleware, adminMiddleware, galleryController.update);
galleryRouter.delete("/:id", authMiddleware, adminMiddleware, galleryController.delete);

module.exports = { galleryRouter };
