const express = require("express");

const router = express.Router();

const {
    createRepairProfile,
    getRepairProfile,
    updateRepairProfile,
    getAllRepairPartners
} = require("../controllers/repairController");

const { verifyToken } = require("../middleware/authMiddleware");


// ======================================
// Repair Profile
// ======================================

router.post(
    "/profile",
    verifyToken,
    createRepairProfile
);

router.get(
    "/profile",
    verifyToken,
    getRepairProfile
);

router.put(
    "/profile",
    verifyToken,
    updateRepairProfile
);


// ======================================
// Admin - Repair Partners
// ======================================

router.get(
    "/all",
    verifyToken,
    getAllRepairPartners
);


module.exports = router;