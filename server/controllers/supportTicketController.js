const pool = require("../config/db");


// =====================================================
// CUSTOMER - CREATE SUPPORT TICKET
// =====================================================

const createSupportTicket = async (req, res) => {
    try {

        const customerId = req.user.id;

        const {
            order_id,
            subject,
            description,
            priority
        } = req.body;

        if (!subject || !description) {
            return res.status(400).json({
                message: "Subject and description are required"
            });
        }

        const allowedPriorities = [
            "Low",
            "Medium",
            "High"
        ];

        const finalPriority =
            allowedPriorities.includes(priority)
                ? priority
                : "Medium";

        const result = await pool.query(
            `
            INSERT INTO support_tickets
            (
                customer_id,
                order_id,
                subject,
                description,
                priority
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                customerId,
                order_id || null,
                subject,
                description,
                finalPriority
            ]
        );

        res.status(201).json({
            message: "Support Ticket Created Successfully",
            ticket: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create Support Ticket Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Support Ticket",
            error: error.message
        });
    }
};


// =====================================================
// CUSTOMER - GET MY SUPPORT TICKETS
// =====================================================

const getMySupportTickets = async (req, res) => {
    try {

        const customerId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                st.id,
                st.customer_id,
                st.order_id,
                st.subject,
                st.description,
                st.priority,
                st.status,
                st.assigned_participant_id,
                st.assigned_participant_role,
                st.resolution,
                st.created_at,
                st.updated_at,
                st.resolved_at
            FROM support_tickets st
            WHERE st.customer_id = $1
            ORDER BY st.id DESC
            `,
            [customerId]
        );

        res.json({
            message: "Support Tickets Fetched Successfully",
            tickets: result.rows
        });

    } catch (error) {

        console.error(
            "Get My Support Tickets Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Support Tickets",
            error: error.message
        });
    }
};


// =====================================================
// ADMIN - GET ALL SUPPORT TICKETS
// =====================================================

const getAllSupportTickets = async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT
                st.id,
                st.customer_id,

                COALESCE(u.full_name, 'Unknown Customer')
                    AS customer_name,

                COALESCE(u.email, '-')
                    AS customer_email,

                st.order_id,
                st.subject,
                st.description,
                st.priority,
                st.status,

                st.assigned_participant_id,
                st.assigned_participant_role,

                st.resolution,
                st.created_at,
                st.updated_at,
                st.resolved_at

            FROM support_tickets st

            LEFT JOIN users u
                ON st.customer_id = u.id

            ORDER BY st.id DESC
            `
        );

        console.log(
            "ADMIN SUPPORT TICKETS:",
            result.rows.length
        );

        res.json({
            message: "Admin Support Tickets Fetched Successfully",
            tickets: result.rows
        });

    } catch (error) {

        console.error(
            "Admin Get Support Tickets Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Fetch Support Tickets",
            error: error.message
        });
    }
};


// =====================================================
// CUSTOMER - GET SINGLE SUPPORT TICKET
// =====================================================

const getSupportTicketById = async (req, res) => {
    try {

        const customerId = req.user.id;

        const ticketId = req.params.id;

        const result = await pool.query(
            `
            SELECT *
            FROM support_tickets
            WHERE id = $1
            AND customer_id = $2
            `,
            [
                ticketId,
                customerId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Support Ticket Not Found"
            });
        }

        res.json({
            message: "Support Ticket Fetched Successfully",
            ticket: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get Support Ticket Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Support Ticket",
            error: error.message
        });
    }
};


// =====================================================
// ADMIN - GET SINGLE SUPPORT TICKET
// =====================================================

const getAdminSupportTicketById = async (req, res) => {
    try {

        const ticketId = req.params.id;

        const result = await pool.query(
            `
            SELECT
                st.id,
                st.customer_id,

                COALESCE(u.full_name, 'Unknown Customer')
                    AS customer_name,

                COALESCE(u.email, '-')
                    AS customer_email,

                st.order_id,
                st.subject,
                st.description,
                st.priority,
                st.status,

                st.assigned_participant_id,
                st.assigned_participant_role,

                st.resolution,
                st.created_at,
                st.updated_at,
                st.resolved_at

            FROM support_tickets st

            LEFT JOIN users u
                ON st.customer_id = u.id

            WHERE st.id = $1
            `,
            [ticketId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Support Ticket Not Found"
            });
        }

        res.json({
            message: "Support Ticket Fetched Successfully",
            ticket: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Admin Get Support Ticket Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Support Ticket",
            error: error.message
        });
    }
};


// =====================================================
// CUSTOMER - UPDATE SUPPORT TICKET
// =====================================================

const updateSupportTicketStatus = async (req, res) => {
    try {

        const customerId = req.user.id;

        const ticketId = req.params.id;

        const {
            status,
            resolution
        } = req.body;

        const allowedStatuses = [
            "Open",
            "Assigned",
            "In Progress",
            "Resolved",
            "Closed"
        ];

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid ticket status"
            });
        }

        const existingTicket = await pool.query(
            `
            SELECT id
            FROM support_tickets
            WHERE id = $1
            AND customer_id = $2
            `,
            [
                ticketId,
                customerId
            ]
        );

        if (existingTicket.rows.length === 0) {
            return res.status(404).json({
                message: "Support Ticket Not Found"
            });
        }

        const resolvedAt =
            status === "Resolved" ||
            status === "Closed"
                ? new Date()
                : null;

        const result = await pool.query(
            `
            UPDATE support_tickets
            SET
                status = $1,
                resolution = $2,
                updated_at = CURRENT_TIMESTAMP,
                resolved_at = $3
            WHERE id = $4
            AND customer_id = $5
            RETURNING *
            `,
            [
                status,
                resolution || null,
                resolvedAt,
                ticketId,
                customerId
            ]
        );

        res.json({
            message: "Support Ticket Updated Successfully",
            ticket: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update Support Ticket Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Support Ticket",
            error: error.message
        });
    }
};


// =====================================================
// ADMIN - UPDATE SUPPORT TICKET
// =====================================================

const adminUpdateSupportTicket = async (req, res) => {
    try {

        const ticketId = req.params.id;

        const {
            status,
            resolution
        } = req.body;

        const allowedStatuses = [
            "Open",
            "Assigned",
            "In Progress",
            "Resolved",
            "Closed"
        ];

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid ticket status"
            });
        }

        const existingTicket = await pool.query(
            `
            SELECT id
            FROM support_tickets
            WHERE id = $1
            `,
            [ticketId]
        );

        if (existingTicket.rows.length === 0) {
            return res.status(404).json({
                message: "Support Ticket Not Found"
            });
        }

        const resolvedAt =
            status === "Resolved" ||
            status === "Closed"
                ? new Date()
                : null;

        const result = await pool.query(
            `
            UPDATE support_tickets
            SET
                status = $1,
                resolution = $2,
                updated_at = CURRENT_TIMESTAMP,
                resolved_at = $3
            WHERE id = $4
            RETURNING *
            `,
            [
                status,
                resolution || null,
                resolvedAt,
                ticketId
            ]
        );

        res.json({
            message: "Support Ticket Updated Successfully",
            ticket: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Admin Update Support Ticket Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Support Ticket",
            error: error.message
        });
    }
};


// =====================================================
// ADMIN - ASSIGN SUPPORT TICKET
// =====================================================

const assignSupportTicket = async (req, res) => {
    try {

        const {
            ticket_id,
            participant_id,
            participant_role
        } = req.body;

        if (
            !ticket_id ||
            !participant_id ||
            !participant_role
        ) {
            return res.status(400).json({
                message:
                    "ticket_id, participant_id and participant_role are required"
            });
        }

        const ticketResult = await pool.query(
            `
            SELECT id
            FROM support_tickets
            WHERE id = $1
            `,
            [ticket_id]
        );

        if (ticketResult.rows.length === 0) {
            return res.status(404).json({
                message: "Support Ticket Not Found"
            });
        }

        const assignmentResult = await pool.query(
            `
            INSERT INTO support_ticket_assignments
            (
                ticket_id,
                participant_id,
                participant_role
            )
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [
                ticket_id,
                participant_id,
                participant_role
            ]
        );

        await pool.query(
            `
            UPDATE support_tickets
            SET
                assigned_participant_id = $1,
                assigned_participant_role = $2,
                status = 'Assigned',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            `,
            [
                participant_id,
                participant_role,
                ticket_id
            ]
        );

        res.status(201).json({
            message: "Support Ticket Assigned Successfully",
            assignment: assignmentResult.rows[0]
        });

    } catch (error) {

        console.error(
            "Assign Support Ticket Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Assign Support Ticket",
            error: error.message
        });
    }
};


// =====================================================
// GET SUPPORT TICKET ASSIGNMENTS
// =====================================================

const getSupportTicketAssignments = async (req, res) => {
    try {

        const ticketId = req.params.ticketId;

        const result = await pool.query(
            `
            SELECT
                id,
                ticket_id,
                participant_id,
                participant_role,
                status,
                assigned_at,
                completed_at
            FROM support_ticket_assignments
            WHERE ticket_id = $1
            ORDER BY id DESC
            `,
            [ticketId]
        );

        res.json({
            message:
                "Support Ticket Assignments Fetched Successfully",
            assignments: result.rows
        });

    } catch (error) {

        console.error(
            "Get Support Ticket Assignments Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to Get Support Ticket Assignments",
            error: error.message
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createSupportTicket,

    getMySupportTickets,

    getAllSupportTickets,

    getSupportTicketById,

    getAdminSupportTicketById,

    updateSupportTicketStatus,

    adminUpdateSupportTicket,

    assignSupportTicket,

    getSupportTicketAssignments

};