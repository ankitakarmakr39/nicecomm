const express = require("express");
const router = express.Router();

const {
    createComplianceProfile,
    getComplianceProfile,
    updateComplianceProfile
} = require("../controllers/complianceController");

const { verifyToken } = require("../middleware/authMiddleware");


// Create Compliance Profile
router.post(
    "/profile",
    verifyToken,
    createComplianceProfile
);


// Get Compliance Profile
router.get(
    "/profile",
    verifyToken,
    getComplianceProfile
);


// Update Compliance Profile
router.put(
    "/profile",
    verifyToken,
    updateComplianceProfile
);


module.exports = router;