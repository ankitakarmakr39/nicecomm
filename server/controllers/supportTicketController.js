const pool = require("../config/db");


// Create Support Ticket
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

        const result = await pool.query(
            `INSERT INTO support_tickets
            (
                customer_id,
                order_id,
                subject,
                description,
                priority
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                customerId,
                order_id || null,
                subject,
                description,
                priority || "Medium"
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
            message: "Failed to Create Support Ticket"
        });
    }
};


// Get Customer's Support Tickets
const getMySupportTickets = async (req, res) => {
    try {
        const customerId = req.user.id;

        const result = await pool.query(
            `SELECT
                id,
                order_id,
                subject,
                description,
                priority,
                status,
                assigned_participant_id,
                assigned_participant_role,
                resolution,
                created_at,
                updated_at,
                resolved_at
             FROM support_tickets
             WHERE customer_id = $1
             ORDER BY id DESC`,
            [customerId]
        );

        res.json(result.rows);

    } catch (error) {

        console.error(
            "Get Support Tickets Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Support Tickets"
        });
    }
};


// Get Single Support Ticket
const getSupportTicketById = async (req, res) => {
    try {
        const customerId = req.user.id;
        const ticketId = req.params.id;

        const result = await pool.query(
            `SELECT *
             FROM support_tickets
             WHERE id = $1
             AND customer_id = $2`,
            [ticketId, customerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Support Ticket Not Found"
            });
        }

        res.json({
            ticket: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get Support Ticket Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Support Ticket"
        });
    }
};



// Update Support Ticket Status
const updateSupportTicketStatus = async (req, res) => {
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
            `SELECT *
             FROM support_tickets
             WHERE id = $1`,
            [ticketId]
        );

        if (existingTicket.rows.length === 0) {
            return res.status(404).json({
                message: "Support Ticket Not Found"
            });
        }

        let resolvedAt = null;

        if (status === "Resolved" || status === "Closed") {
            resolvedAt = new Date();
        }

        const result = await pool.query(
            `UPDATE support_tickets
             SET
                status = $1,
                resolution = $2,
                updated_at = CURRENT_TIMESTAMP,
                resolved_at = $3
             WHERE id = $4
             RETURNING *`,
            [
                status,
                resolution || null,
                resolvedAt,
                ticketId
            ]
        );

        res.json({
            message: "Support Ticket Status Updated Successfully",
            ticket: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update Support Ticket Status Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Support Ticket Status"
        });
    }
};


module.exports = {
    createSupportTicket,
    getMySupportTickets,
    getSupportTicketById,
    updateSupportTicketStatus
};