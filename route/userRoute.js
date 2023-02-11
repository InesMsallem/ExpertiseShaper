const express = require("express");
const router = express.Router();
const userController= require('../controller/userController')
router.get("/:id", userController.getById);
router.post("/", userController.addUser);

module.exports = router;
