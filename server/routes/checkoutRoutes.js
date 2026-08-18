const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
    checkout
} = require("../controllers/checkoutController");

// Checkout
router.post(
    "/",
    verifyToken,
    checkout
);

module.exports = router;