const express = require("express");
const router = express.Router();

const {
    assignSupportTicket,
    getSupportTicketAssignments
} = require("../controllers/supportAssignmentController");

const { verifyToken } = require("../middleware/authMiddleware");


// Assign Support Ticket
router.post(
    "/tickets/assign",
    verifyToken,
    assignSupportTicket
);


// Get Ticket Assignments
router.get(
    "/tickets/:ticketId/assignments",
    verifyToken,
    getSupportTicketAssignments
);


module.exports = router;