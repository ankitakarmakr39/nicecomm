const pool = require("../config/db");


// Assign Support Ticket
const assignSupportTicket = async (req, res) => {
    try {
        const {
            ticket_id,
            participant_id,
            participant_role
        } = req.body;

        if (!ticket_id || !participant_id || !participant_role) {
            return res.status(400).json({
                message: "ticket_id, participant_id and participant_role are required"
            });
        }

        // Check ticket exists
        const ticketResult = await pool.query(
            `SELECT *
             FROM support_tickets
             WHERE id = $1`,
            [ticket_id]
        );

        if (ticketResult.rows.length === 0) {
            return res.status(404).json({
                message: "Support Ticket Not Found"
            });
        }

        // Create assignment
        const result = await pool.query(
            `INSERT INTO support_ticket_assignments
            (
                ticket_id,
                participant_id,
                participant_role
            )
            VALUES ($1, $2, $3)
            RETURNING *`,
            [
                ticket_id,
                participant_id,
                participant_role
            ]
        );

        // Update ticket
        await pool.query(
            `UPDATE support_tickets
             SET
                assigned_participant_id = $1,
                assigned_participant_role = $2,
                status = 'Assigned',
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [
                participant_id,
                participant_role,
                ticket_id
            ]
        );

        res.status(201).json({
            message: "Support Ticket Assigned Successfully",
            assignment: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Assign Support Ticket Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Assign Support Ticket"
        });
    }
};


// Get Support Ticket Assignments
const getSupportTicketAssignments = async (req, res) => {
    try {
        const ticketId = req.params.ticketId;

        const result = await pool.query(
            `SELECT
                id,
                ticket_id,
                participant_id,
                participant_role,
                status,
                assigned_at,
                completed_at
             FROM support_ticket_assignments
             WHERE ticket_id = $1
             ORDER BY id DESC`,
            [ticketId]
        );

        res.json(result.rows);

    } catch (error) {

        console.error(
            "Get Support Ticket Assignments Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Support Ticket Assignments"
        });
    }
};


module.exports = {
    assignSupportTicket,
    getSupportTicketAssignments
};