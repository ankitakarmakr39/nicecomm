
const pool = require("../config/db");


// ======================================
// Participant - Get Assigned Support Tickets
// ======================================
const getParticipantSupportTickets = async (req, res) => {
    try {

        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                st.id,
                st.customer_id,

                u.full_name AS customer_name,
                u.email AS customer_email,

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
                st.resolved_at,

                sta.participant_role,
                sta.assigned_at,
                sta.completed_at

            FROM support_ticket_assignments sta

            JOIN support_tickets st
                ON sta.ticket_id = st.id

            LEFT JOIN users u
                ON st.customer_id = u.id

            WHERE sta.participant_id = $1

            ORDER BY sta.id DESC
            `,
            [participantId]
        );

        res.json({
            message:
                "Participant Support Tickets Fetched Successfully",

            tickets: result.rows
        });

    } catch (error) {

        console.error(
            "Get Participant Support Tickets Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to Fetch Participant Support Tickets"
        });
    }
};


// ======================================
// Participant - Update Assigned Ticket
// ======================================
const updateParticipantSupportTicket = async (req, res) => {
    try {

        const participantId = req.user.id;
        const ticketId = req.params.id;

        const {
            status,
            resolution
        } = req.body;


        const allowedStatuses = [
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


        // Check assignment belongs to this participant
        const assignmentResult = await pool.query(
            `
            SELECT
                sta.id,
                sta.ticket_id,
                sta.participant_id

            FROM support_ticket_assignments sta

            WHERE sta.ticket_id = $1
            AND sta.participant_id = $2

            LIMIT 1
            `,
            [
                ticketId,
                participantId
            ]
        );


        if (assignmentResult.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Support Ticket Assignment Not Found"
            });
        }


        let resolvedAt = null;

        if (
            status === "Resolved" ||
            status === "Closed"
        ) {
            resolvedAt = new Date();
        }


        // Update ticket
        const ticketResult = await pool.query(
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


        // Update assignment
        await pool.query(
            `
            UPDATE support_ticket_assignments

            SET
                status = $1,
                completed_at = $2

            WHERE ticket_id = $3
            AND participant_id = $4
            `,
            [
                status,
                resolvedAt,
                ticketId,
                participantId
            ]
        );


        res.json({
            message:
                "Support Ticket Updated Successfully",

            ticket:
                ticketResult.rows[0]
        });


    } catch (error) {

        console.error(
            "Update Participant Support Ticket Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to Update Support Ticket"
        });
    }
};


module.exports = {
    getParticipantSupportTickets,
    updateParticipantSupportTicket
};

