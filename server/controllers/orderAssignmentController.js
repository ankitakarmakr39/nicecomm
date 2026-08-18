const pool = require("../config/db");


// ======================================================
// Create Order Assignment
// ======================================================

const createAssignment = async (req, res) => {

    try {

        const { orderId } = req.params;

        const {
            participant_id,
            participant_role
        } = req.body;


        // Check Order
        const orderResult = await pool.query(
            `
            SELECT id
            FROM orders
            WHERE id = $1
            `,
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
        if (
            participant.participant_type_id !== Number(participant_role)
        ) {

            return res.status(400).json({
                message: "Participant role does not match participant type"
            });

        }


        // Check Existing Active Assignment
        const existingAssignment = await pool.query(
            `
            SELECT
                id,
                status
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

        console.error("Create Assignment Error:", error);

        res.status(500).json({
            message: "Failed to Create Order Assignment"
        });

    }

};


// ======================================================
// Get Order Assignments
// ======================================================

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

        console.error("Get Assignments Error:", error);

        res.status(500).json({
            message: "Failed to Fetch Order Assignments"
        });

    }

};


// ======================================================
// Update Order Assignment
// ======================================================

// ======================================================
// Update Order Assignment
// ======================================================

const updateAssignment = async (req, res) => {

    const client = await pool.connect();

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

        const userId = req.user.id;
        const userRole = req.user.role;

        await client.query("BEGIN");


        // ==================================================
        // Check Assignment Ownership
        // ==================================================

        const assignmentResult = await client.query(
            `
            SELECT
                oa.*,
                p.user_id AS participant_user_id,
                p.company_name,
                pt.name AS participant_type

            FROM order_assignments oa

            JOIN participants p
                ON oa.participant_id = p.id

            JOIN participant_types pt
                ON oa.participant_role = pt.id

            WHERE oa.id = $1
            AND oa.order_id = $2
            AND (
                p.user_id = $3
                OR $4 = 'admin'
            )
            `,
            [
                assignmentId,
                orderId,
                userId,
                userRole
            ]
        );


        if (assignmentResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Order Assignment Not Found or Access Denied"
            });

        }


        // ==================================================
        // Completed Timestamp
        // ==================================================

        let completedAt = null;

        if (status === "Completed") {
            completedAt = new Date();
        }


        // ==================================================
        // Update Assignment
        // ==================================================

        const result = await client.query(
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


        // ==================================================
        // Check All Assignments For This Order
        // ==================================================

        const assignmentStatusResult = await client.query(
            `
            SELECT
                COUNT(*) AS total_assignments,
                COUNT(*) FILTER (
                    WHERE status = 'Completed'
                ) AS completed_assignments
            FROM order_assignments
            WHERE order_id = $1
            `,
            [orderId]
        );


        const totalAssignments =
            Number(assignmentStatusResult.rows[0].total_assignments);

        const completedAssignments =
            Number(assignmentStatusResult.rows[0].completed_assignments);


        // ==================================================
        // Update Order Status
        // ==================================================

        if (
            totalAssignments > 0 &&
            totalAssignments === completedAssignments
        ) {

            await client.query(
                `
                UPDATE orders
                SET
                    status = 'Completed',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [orderId]
            );

        }


        // ==================================================
        // Commit
        // ==================================================

        await client.query("COMMIT");


        res.json({
            message: "Order Assignment Updated Successfully",
            assignment: result.rows[0]
        });


    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Update Assignment Error:", error);

        res.status(500).json({
            message: "Failed to Update Order Assignment"
        });

    } finally {

        client.release();

    }

};


// ======================================================
// Get My Assignments
// ======================================================

const getMyAssignments = async (req, res) => {

    try {

        const userId = req.user.id;


        const result = await pool.query(
            `
            SELECT
                oa.id AS assignment_id,
                oa.order_id,
                oa.participant_id,

                p.company_name,
                p.contact_person,

                pt.name AS participant_type,

                oa.status AS assignment_status,
                oa.assigned_at,
                oa.completed_at,

                o.customer_id,
                u.email AS customer_email,

                o.total_amount,
                o.status AS order_status,

                o.shipping_address,
                o.shipping_city,
                o.shipping_state,
                o.shipping_country,

                oi.product_id,
                pr.name AS product_name,
                oi.quantity,
                oi.unit_price,
                oi.subtotal

            FROM order_assignments oa

            JOIN participants p
                ON oa.participant_id = p.id

            JOIN participant_types pt
                ON oa.participant_role = pt.id

            JOIN orders o
                ON oa.order_id = o.id

            JOIN users u
                ON o.customer_id = u.id

            LEFT JOIN order_items oi
                ON oi.order_id = o.id

            LEFT JOIN products pr
                ON pr.id = oi.product_id

            WHERE p.user_id = $1

            ORDER BY oa.assigned_at DESC
            `,
            [userId]
        );


        res.json({
            message: "My Assignments Fetched Successfully",
            assignments: result.rows
        });


    } catch (error) {

        console.error("Get My Assignments Error:", error);

        res.status(500).json({
            message: "Failed to Fetch My Assignments"
        });

    }

};


// ======================================================
// Export
// ======================================================

module.exports = {

    createAssignment,

    getAssignments,

    updateAssignment,

    getMyAssignments

};