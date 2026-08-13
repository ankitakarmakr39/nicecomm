const express = require("express");
const router = express.Router();

const {
    createInspectionAssignment,
    getInspectionAssignments,
    updateInspectionAssignment
} = require("../controllers/inspectionAssignmentController");

const { verifyToken } = require("../middleware/authMiddleware");


// Create Inspection Assignment
router.post(
    "/assign",
    verifyToken,
    createInspectionAssignment
);


// Get Assigned Inspections
router.get(
    "/assigned",
    verifyToken,
    getInspectionAssignments
);

// Update Inspection Assignment
router.put(
    "/assign/:assignmentId",
    verifyToken,
    updateInspectionAssignment
);


module.exports = router;