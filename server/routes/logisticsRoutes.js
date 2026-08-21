const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
    createLogisticsProfile,
    getLogisticsProfile,
    updateLogisticsProfile,
    getLogisticsShipments,
    getAllLogisticsProviders,
} = require("../controllers/logisticsController");


// ======================================
// Admin - All Logistics Providers
// ======================================

router.get(
    "/providers",
    verifyToken,
    getAllLogisticsProviders
);

// ======================================
// Logistics Profile
// ======================================

// Create Logistics Profile
router.post(
    "/profile",
    verifyToken,
    createLogisticsProfile
);

// Get My Logistics Profile
router.get(
    "/profile",
    verifyToken,
    getLogisticsProfile
);

// Update My Logistics Profile
router.put(
    "/profile",
    verifyToken,
    updateLogisticsProfile
);


// ======================================
// Assigned Shipments
// ======================================

// Get My Assigned Shipments
router.get(
    "/shipments",
    verifyToken,
    getLogisticsShipments
);


module.exports = router;