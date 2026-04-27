const express = require("express");

const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/", orderController.list);
router.get("/:id", orderController.show);
router.post("/", orderController.create);
router.put("/:id/status", orderController.updateStatus);

module.exports = router;
