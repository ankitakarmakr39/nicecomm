const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
    createPackagingProfile,
    getPackagingProfile,
    updatePackagingProfile,
    getPackagingOrders
} = require("../controllers/packagingController");


// ======================================
// Packaging Profile
// ======================================

// Create Packaging Profile
router.post(
    "/profile",
    verifyToken,
    createPackagingProfile
);

// Get My Packaging Profile
router.get(
    "/profile",
    verifyToken,
    getPackagingProfile
);

// Update My Packaging Profile
router.put(
    "/profile",
    verifyToken,
    updatePackagingProfile
);


// ======================================
// Assigned Orders
// ======================================

// Get My Assigned Orders
router.get(
    "/orders",
    verifyToken,
    getPackagingOrders
);


module.exports = router;