const express = require("express");

const router = express.Router();

const {
    createInspectionProfile,
    getInspectionProfile,
    updateInspectionProfile,
    getAllInspectionPartners
} = require("../controllers/inspectionController");

const { verifyToken } = require("../middleware/authMiddleware");


// ======================================
// PARTICIPANT - INSPECTION PROFILE
// ======================================

router.post(
    "/profile",
    verifyToken,
    createInspectionProfile
);

router.get(
    "/profile",
    verifyToken,
    getInspectionProfile
);

router.put(
    "/profile",
    verifyToken,
    updateInspectionProfile
);


// ======================================
// ADMIN - ALL INSPECTION PARTNERS
// ======================================

router.get(
    "/all",
    verifyToken,
    getAllInspectionPartners
);


module.exports = router;