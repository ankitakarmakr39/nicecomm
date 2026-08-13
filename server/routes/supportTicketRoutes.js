const express = require("express");
const router = express.Router();

const {
    createSupportTicket,
    getMySupportTickets,
    getSupportTicketById,
    updateSupportTicketStatus
} = require("../controllers/supportTicketController");

const { verifyToken } = require("../middleware/authMiddleware");


// Create Support Ticket
router.post(
    "/tickets",
    verifyToken,
    createSupportTicket
);


// Get My Support Tickets
router.get(
    "/tickets",
    verifyToken,
    getMySupportTickets
);


// Get Single Support Ticket
router.get(
    "/tickets/:id",
    verifyToken,
    getSupportTicketById
);


// Update Support Ticket Status
router.put(
    "/tickets/:id/status",
    verifyToken,
    updateSupportTicketStatus
);


module.exports = router;