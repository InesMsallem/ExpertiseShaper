
  const express = require("express");
  const router = express.Router();
  const userController= require('../controller/userController')
  const { auth } = require("../middleware/middleware");
  router.get("/getUser/:id", userController.getById);
  router.delete("/deleteUser/:_id",auth, userController.deleteUser);
  router.get("/getAllUsers", userController.Userslist);
  router.put("/updateUser/:_id",auth, userController.updateUser);
  router.post("/signup", userController.signup);
  router.post("/login", userController.login);


  module.exports = router;
  