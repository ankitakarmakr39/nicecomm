const express = require("express");
const router = express.Router();

const {
    createInspectionProfile,
    getInspectionProfile,
    updateInspectionProfile
} = require("../controllers/inspectionController");

const { verifyToken } = require("../middleware/authMiddleware");


// Create Inspection Profile
router.post(
    "/profile",
    verifyToken,
    createInspectionProfile
);


// Get Inspection Profile
router.get(
    "/profile",
    verifyToken,
    getInspectionProfile
);


// Update Inspection Profile
router.put(
    "/profile",
    verifyToken,
    updateInspectionProfile
);


module.exports = router;