const express = require("express");
const router = express.Router();

const {
    createRepairAssignment,
    getRepairAssignments,
    updateRepairAssignment
} = require("../controllers/repairAssignmentController");

const { verifyToken } = require("../middleware/authMiddleware");


// Create Repair Assignment
router.post(
    "/assign",
    verifyToken,
    createRepairAssignment
);


// Get Assigned Repairs
router.get(
    "/assigned",
    verifyToken,
    getRepairAssignments
);


// Update Repair Assignment
router.put(
    "/assign/:assignmentId",
    verifyToken,
    updateRepairAssignment
);


module.exports = router;