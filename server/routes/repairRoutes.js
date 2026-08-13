const express = require("express");
const router = express.Router();

const {
    createRepairProfile,
    getRepairProfile,
    updateRepairProfile
} = require("../controllers/repairController");

const { verifyToken } = require("../middleware/authMiddleware");


// Create Repair Profile
router.post(
    "/profile",
    verifyToken,
    createRepairProfile
);


// Get Repair Profile
router.get(
    "/profile",
    verifyToken,
    getRepairProfile
);


// Update Repair Profile
router.put(
    "/profile",
    verifyToken,
    updateRepairProfile
);


module.exports = router;