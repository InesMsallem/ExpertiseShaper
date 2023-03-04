const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { auth } = require("../middleware/auth");
router.get("/getUser/:id", userController.getById);
router.delete("/deleteUser/:_id", auth, userController.deleteUser);
router.get("/getAllUsers", userController.Userslist);
router.put("/updateUser/:_id", auth, userController.updateUser);
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/ShowSessionCaptcha", userController.showCaptcha);
router.get("/generateCaptcha", userController.generateCaptcha);

router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);


module.exports = router;
