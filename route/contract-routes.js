const express = require("express");
const router = express.Router();
const Contract = require("../model/Contract");
const contractController = require("../controller/contract-controller");

router.get("/", contractController.getAllContracts);
router.post("/add", contractController.addContract);
router.get("/:id", contractController.getById);
router.put("/:id", contractController.updateContract);
router.delete("/:id", contractController.deleteContract);
// router.put("/:ContractId/ChangeStatus/:Status", contractController.ChangeStatus);
module.exports = router;
