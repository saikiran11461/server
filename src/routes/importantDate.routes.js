const express = require("express");
const { importantDateController } = require("../controllers/importantDate.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", importantDateController.list);
router.get("/:id", importantDateController.get);

router.post("/", authMiddleware, adminMiddleware, importantDateController.create);
router.put("/:id", authMiddleware, adminMiddleware, importantDateController.update);
router.delete("/:id", authMiddleware, adminMiddleware, importantDateController.delete);

module.exports = { importantDateRouter: router };
