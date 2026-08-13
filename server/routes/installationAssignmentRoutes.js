const express = require("express");
const router = express.Router();

const {
    createInstallationAssignment,
    getInstallationAssignments,
    updateInstallationAssignment
} = require("../controllers/installationAssignmentController");

const { verifyToken } = require("../middleware/authMiddleware");


// ======================================
// Create Installation Assignment
// ======================================

router.post(
    "/assign",
    verifyToken,
    createInstallationAssignment
);


// ======================================
// Get Assigned Installations
// ======================================

router.get(
    "/assigned",
    verifyToken,
    getInstallationAssignments
);


// ======================================
// Update Installation Assignment
// ======================================

router.put(
    "/assign/:assignmentId",
    verifyToken,
    updateInstallationAssignment
);


module.exports = router;