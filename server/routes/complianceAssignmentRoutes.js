const express = require("express");
const router = express.Router();

const {
    createComplianceAssignment,
    getComplianceAssignments
} = require("../controllers/complianceAssignmentController");

const { verifyToken } = require("../middleware/authMiddleware");


// Create Compliance Assignment
router.post(
    "/assign",
    verifyToken,
    createComplianceAssignment
);


// Get Assigned Compliance Tasks
router.get(
    "/assigned",
    verifyToken,
    getComplianceAssignments
);


module.exports = router;