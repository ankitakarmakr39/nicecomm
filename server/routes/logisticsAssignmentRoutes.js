const express = require("express");

const router = express.Router();

const {
    createLogisticsAssignment,
    getLogisticsAssignments,
    updateLogisticsAssignment
} = require("../controllers/logisticsAssignmentController");

const {
    getAllLogisticsAssignments
} = require("../controllers/logisticsController");

const {
    verifyToken
} = require("../middleware/authMiddleware");


// =====================================================
// GET ALL LOGISTICS ASSIGNMENTS
// Admin
// =====================================================

router.get(
    "/assignments",
    verifyToken,
    getAllLogisticsAssignments
);


// =====================================================
// CREATE LOGISTICS ASSIGNMENT
// =====================================================

router.post(
    "/assignments",
    verifyToken,
    createLogisticsAssignment
);


// =====================================================
// UPDATE LOGISTICS ASSIGNMENT
// =====================================================

router.put(
    "/assignments/:assignmentId",
    verifyToken,
    updateLogisticsAssignment
);

// =====================================================
// GET MY LOGISTICS ASSIGNMENTS
// Logistics Participant
// =====================================================

router.get(
    "/my-assignments",
    verifyToken,
    getLogisticsAssignments
);


module.exports = router;