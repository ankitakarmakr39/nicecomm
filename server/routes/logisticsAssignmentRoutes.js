const express = require("express");

const router = express.Router();

const {
    createLogisticsAssignment,
    updateLogisticsAssignment
} = require("../controllers/logisticsAssignmentController");

const { verifyToken } = require("../middleware/authMiddleware");


// ======================================
// Create Logistics Assignment
// ======================================

router.post(
    "/assign",
    verifyToken,
    createLogisticsAssignment
);


// ======================================
// Update Logistics Assignment
// ======================================

router.put(
    "/assign/:assignmentId",
    verifyToken,
    updateLogisticsAssignment
);


module.exports = router;