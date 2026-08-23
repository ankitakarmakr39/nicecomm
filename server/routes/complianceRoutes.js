const express = require("express");

const router = express.Router();

const {
    createComplianceProfile,
    getComplianceProfile,
    updateComplianceProfile,
    getAllCompliancePartners
} = require("../controllers/complianceController");

const {
    verifyToken
} = require("../middleware/authMiddleware");


// ======================================
// ADMIN
// Get All Compliance Partners
// ======================================

router.get(
    "/all",
    verifyToken,
    getAllCompliancePartners
);


// ======================================
// PARTICIPANT
// Create Compliance Profile
// ======================================

router.post(
    "/profile",
    verifyToken,
    createComplianceProfile
);


// ======================================
// PARTICIPANT
// Get Own Compliance Profile
// ======================================

router.get(
    "/profile",
    verifyToken,
    getComplianceProfile
);


// ======================================
// PARTICIPANT
// Update Own Compliance Profile
// ======================================

router.put(
    "/profile",
    verifyToken,
    updateComplianceProfile
);


module.exports = router;