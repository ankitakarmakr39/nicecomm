const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
    createPackagingProfile,
    getPackagingProfile,
    updatePackagingProfile,
    getPackagingOrders,
    getAllPackagingProviders,
    getAllPackagingAssignments
} = require("../controllers/packagingController");


// ======================================
// ADMIN
// Get All Packaging Providers
// ======================================

router.get(
    "/providers",
    verifyToken,
    getAllPackagingProviders
);


// ======================================
// ADMIN
// Get All Packaging Assignments
// ======================================

router.get(
    "/assignments",
    verifyToken,
    getAllPackagingAssignments
);


// ======================================
// PACKAGING PROFILE
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
// ASSIGNED ORDERS
// Participant
// ======================================

router.get(
    "/orders",
    verifyToken,
    getPackagingOrders
);


module.exports = router;