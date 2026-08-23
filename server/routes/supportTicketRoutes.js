const express = require("express");

const router = express.Router();

const {
    createSupportTicket,
    getMySupportTickets,
    getAllSupportTickets,
    getSupportTicketById,
    getAdminSupportTicketById,
    updateSupportTicketStatus,
    adminUpdateSupportTicket,
    assignSupportTicket,
    getSupportTicketAssignments
} = require("../controllers/supportTicketController");

const {
    verifyToken
} = require("../middleware/authMiddleware");


// =====================================================
// CREATE SUPPORT TICKET
// Customer
// =====================================================

router.post(
    "/tickets",
    verifyToken,
    createSupportTicket
);


// =====================================================
// GET SUPPORT TICKETS
//
// Customer -> Own tickets
// Admin    -> All tickets
// =====================================================

router.get(
    "/tickets",
    verifyToken,
    async (req, res, next) => {
        try {

            const role = String(
                req.user?.role || ""
            ).toLowerCase();

            if (role === "admin") {
                return getAllSupportTickets(req, res);
            }

            return getMySupportTickets(req, res);

        } catch (error) {
            next(error);
        }
    }
);


// =====================================================
// GET SINGLE SUPPORT TICKET
//
// Customer -> Own ticket
// Admin    -> Any ticket
// =====================================================

router.get(
    "/tickets/:id",
    verifyToken,
    async (req, res, next) => {
        try {

            const role = String(
                req.user?.role || ""
            ).toLowerCase();

            if (role === "admin") {
                return getAdminSupportTicketById(req, res);
            }

            return getSupportTicketById(req, res);

        } catch (error) {
            next(error);
        }
    }
);


// =====================================================
// CUSTOMER UPDATE STATUS
// =====================================================

router.put(
    "/tickets/:id/status",
    verifyToken,
    updateSupportTicketStatus
);


// =====================================================
// ADMIN UPDATE TICKET
// =====================================================

router.put(
    "/tickets/:id/admin",
    verifyToken,
    adminUpdateSupportTicket
);


// =====================================================
// ASSIGN SUPPORT TICKET
// =====================================================

router.post(
    "/tickets/assign",
    verifyToken,
    assignSupportTicket
);


// =====================================================
// GET TICKET ASSIGNMENTS
// =====================================================

router.get(
    "/tickets/:ticketId/assignments",
    verifyToken,
    getSupportTicketAssignments
);


module.exports = router;