const pool = require("../config/db");


// Create Order Assignment
const createAssignment = async (req, res) => {

    try {

        const { orderId } = req.params;

        const {
            participant_id,
            participant_role
        } = req.body;


        // Check Order
        const orderResult = await pool.query(
            `SELECT id FROM orders WHERE id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                message: "Order Not Found"
            });
        }


        // Check Participant
        const participantResult = await pool.query(
            `
    SELECT
        id,
        participant_type_id
    FROM participants
    WHERE id = $1
    `,
            [participant_id]
        );

        if (participantResult.rows.length === 0) {
            return res.status(404).json({
                message: "Participant Not Found"
            });
        }

        const participant = participantResult.rows[0];


        // Check Participant Role
        if (participant.participant_type_id !== Number(participant_role)) {
            return res.status(400).json({
                message: "Participant role does not match participant type"
            });
        }

        // Check Existing Active Assignment
        const existingAssignment = await pool.query(
            `
    SELECT id, status
    FROM order_assignments
    WHERE order_id = $1
    AND participant_id = $2
    AND participant_role = $3
    AND status IN ('Assigned', 'In Progress')
    LIMIT 1
    `,
            [
                orderId,
                participant_id,
                participant_role
            ]
        );

        if (existingAssignment.rows.length > 0) {
            return res.status(409).json({
                message: "Participant already has an active assignment for this order",
                assignment: existingAssignment.rows[0]
            });
        }
        
        // Create Assignment
        const result = await pool.query(
            `
            INSERT INTO order_assignments
            (
                order_id,
                participant_id,
                participant_role,
                status
            )
            VALUES
            ($1, $2, $3, 'Assigned')
            RETURNING *
            `,
            [
                orderId,
                participant_id,
                participant_role
            ]
        );


        res.status(201).json({
            message: "Order Assignment Created Successfully",
            assignment: result.rows[0]
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Create Order Assignment"
        });

    }

};


// Get Order Assignments
const getAssignments = async (req, res) => {

    try {

        const { orderId } = req.params;


        const result = await pool.query(
            `
            SELECT
                oa.id,
                oa.order_id,
                oa.participant_id,
                p.company_name,
                p.contact_person,
                oa.participant_role,
                pt.name AS participant_type,
                oa.status,
                oa.assigned_at,
                oa.completed_at

            FROM order_assignments oa

            JOIN participants p
                ON oa.participant_id = p.id

            JOIN participant_types pt
                ON oa.participant_role = pt.id

            WHERE oa.order_id = $1

            ORDER BY oa.id ASC
            `,
            [orderId]
        );


        res.json(result.rows);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Fetch Order Assignments"
        });

    }

};

// Update Order Assignment
const updateAssignment = async (req, res) => {
    try {
        const { orderId, assignmentId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Assigned",
            "In Progress",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid Assignment Status"
            });
        }

        const assignmentResult = await pool.query(
            `
            SELECT *
            FROM order_assignments
            WHERE id = $1
            AND order_id = $2
            `,
            [assignmentId, orderId]
        );

        if (assignmentResult.rows.length === 0) {
            return res.status(404).json({
                message: "Order Assignment Not Found"
            });
        }

        let completedAt = null;

        if (status === "Completed") {
            completedAt = new Date();
        }

        const result = await pool.query(
            `
            UPDATE order_assignments
            SET
                status = $1,
                completed_at = $2
            WHERE id = $3
            AND order_id = $4
            RETURNING *
            `,
            [
                status,
                completedAt,
                assignmentId,
                orderId
            ]
        );

        res.json({
            message: "Order Assignment Updated Successfully",
            assignment: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Update Order Assignment"
        });
    }
};


module.exports = {
    createAssignment,
    getAssignments,
    updateAssignment
};