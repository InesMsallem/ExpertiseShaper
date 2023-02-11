const express = require("express");
const router = express.Router();
const sessionController= require('../controller/sessionController')
router.get("/", sessionController.getAllSessions);
router.get("/:id", sessionController.getById);
router.post("/", sessionController.addSession);
router.delete("/:id", sessionController.deleteSession);
router.put("/:id", sessionController.updateSession);
module.exports = router;
