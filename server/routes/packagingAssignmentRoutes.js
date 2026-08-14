const express = require("express");

const router = express.Router();

const {
    createPackagingAssignment,
    updatePackagingAssignment
} = require("../controllers/packagingAssignmentController");

const { verifyToken } = require("../middleware/authMiddleware");


// ======================================
// Create Packaging Assignment
// ======================================

router.post(
    "/assign",
    verifyToken,
    createPackagingAssignment
);


// ======================================
// Update Packaging Assignment
// ======================================

router.put(
    "/assign/:assignmentId",
    verifyToken,
    updatePackagingAssignment
);


module.exports = router;