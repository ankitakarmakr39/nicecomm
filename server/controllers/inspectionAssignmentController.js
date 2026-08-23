const pool = require("../config/db");

// ======================================
// Create Inspection Assignment
// ======================================
const createInspectionAssignment = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            order_id,
            customer_id,
            inspection_type,
            status
        } = req.body;

        // ======================================
        // Required Fields
        // ======================================
        if (!order_id || !customer_id || !inspection_type) {
            return res.status(400).json({
                message: "Order ID, Customer ID and Inspection Type are required"
            });
        }

        // ======================================
        // Check Existing Active Assignment
        // ======================================
        const existingAssignment = await pool.query(
            `
            SELECT id, status
            FROM inspection_assignments
            WHERE participant_id = $1
            AND order_id = $2
            AND customer_id = $3
            AND status IN ('Assigned', 'In Progress')
            LIMIT 1
            `,
            [
                participantId,
                order_id,
                customer_id
            ]
        );

        if (existingAssignment.rows.length > 0) {
            return res.status(400).json({
                message: "Inspection already has an active assignment for this order",
                assignment: existingAssignment.rows[0]
            });
        }

        // ======================================
        // Create Assignment
        // ======================================
        const result = await pool.query(
            `
            INSERT INTO inspection_assignments
            (
                participant_id,
                order_id,
                customer_id,
                inspection_type,
                status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                participantId,
                order_id,
                customer_id,
                inspection_type,
                status || "Assigned"
            ]
        );

        res.status(201).json({
            message: "Inspection Assignment Created Successfully",
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Create Inspection Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Inspection Assignment"
        });
    }
};


// ======================================
// Get Assigned Inspections
// ======================================
const getInspectionAssignments = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                ia.id,
                ia.order_id,
                ia.customer_id,
                u.full_name AS customer_name,
                ia.inspection_type,
                ia.status,
                ia.assigned_at,
                ia.completed_at
            FROM inspection_assignments ia

            JOIN users u
                ON ia.customer_id = u.id

            WHERE ia.participant_id = $1

            ORDER BY ia.id DESC
            `,
            [participantId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(
            "Get Inspection Assignments Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Inspection Assignments"
        });
    }
};


// ======================================
// Update Inspection Assignment
// ======================================
const updateInspectionAssignment = async (req, res) => {
    try {
        const participantId = req.user.id;

        const { assignmentId } = req.params;
        const { status } = req.body;

        // ======================================
        // Allowed Statuses
        // ======================================
        const allowedStatuses = [
            "Assigned",
            "In Progress",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid Inspection Assignment Status",
                allowed_statuses: allowedStatuses
            });
        }

        // ======================================
        // Check Assignment
        // ======================================
        const assignmentResult = await pool.query(
            `
            SELECT *
            FROM inspection_assignments
            WHERE id = $1
            AND participant_id = $2
            `,
            [
                assignmentId,
                participantId
            ]
        );

        if (assignmentResult.rows.length === 0) {
            return res.status(404).json({
                message: "Inspection Assignment Not Found"
            });
        }

        // ======================================
        // Completed Date
        // ======================================
        let completedAt = assignmentResult.rows[0].completed_at;

        if (status === "Completed") {
            completedAt = new Date();
        }

        if (status !== "Completed") {
            completedAt = null;
        }

        // ======================================
        // Update Assignment
        // ======================================
        const result = await pool.query(
            `
            UPDATE inspection_assignments
            SET
                status = $1,
                completed_at = $2
            WHERE id = $3
            AND participant_id = $4
            RETURNING *
            `,
            [
                status,
                completedAt,
                assignmentId,
                participantId
            ]
        );

        res.json({
            message: "Inspection Assignment Updated Successfully",
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Update Inspection Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Inspection Assignment"
        });
    }
};


// ======================================
// Export Controllers
// ======================================
module.exports = {
    createInspectionAssignment,
    getInspectionAssignments,
    updateInspectionAssignment
};