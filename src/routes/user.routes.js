


const express = require("express");
const { userController } = require("../controllers/user.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");

const userRouter = express.Router();

userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.post("/logout", userController.logout);

userRouter.get("/profile", authMiddleware, userController.profile);
userRouter.put("/update", authMiddleware, userController.update);

userRouter.get("/", authMiddleware, adminMiddleware, userController.getUser);
userRouter.delete("/:id", authMiddleware, adminMiddleware, userController.delete);

module.exports = { userRouter };