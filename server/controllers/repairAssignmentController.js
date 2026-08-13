const pool = require("../config/db");


// ======================================
// Create Repair Assignment
// ======================================
const createRepairAssignment = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            order_id,
            customer_id,
            repair_type,
            status
        } = req.body;

        // Check existing active assignment
        const existingAssignment = await pool.query(
            `
            SELECT id, status
            FROM repair_assignments
            WHERE participant_id = $1
            AND order_id = $2
            AND status IN ('Assigned', 'In Progress')
            LIMIT 1
            `,
            [
                participantId,
                order_id
            ]
        );

        if (existingAssignment.rows.length > 0) {
            return res.status(400).json({
                message: "Repair already has an active assignment for this order",
                assignment: existingAssignment.rows[0]
            });
        }

        // Create assignment
        const result = await pool.query(
            `
            INSERT INTO repair_assignments
            (
                participant_id,
                order_id,
                customer_id,
                repair_type,
                status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                participantId,
                order_id,
                customer_id,
                repair_type,
                status || "Assigned"
            ]
        );

        res.status(201).json({
            message: "Repair Assignment Created Successfully",
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Create Repair Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Repair Assignment"
        });
    }
};


// ======================================
// Get Assigned Repairs
// ======================================
const getRepairAssignments = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                ra.id,
                ra.order_id,
                ra.customer_id,
                u.full_name AS customer_name,
                ra.repair_type,
                ra.status,
                ra.assigned_at,
                ra.completed_at
            FROM repair_assignments ra
            JOIN users u
                ON ra.customer_id = u.id
            WHERE ra.participant_id = $1
            ORDER BY ra.id DESC
            `,
            [participantId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(
            "Get Repair Assignments Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Repair Assignments"
        });
    }
};


// ======================================
// Update Repair Assignment
// ======================================
const updateRepairAssignment = async (req, res) => {
    try {
        const participantId = req.user.id;

        const { assignmentId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Assigned",
            "In Progress",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid Repair Assignment Status"
            });
        }

        // Check assignment belongs to logged-in participant
        const assignmentResult = await pool.query(
            `
            SELECT *
            FROM repair_assignments
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
                message: "Repair Assignment Not Found"
            });
        }

        let completedAt = null;

        if (status === "Completed") {
            completedAt = new Date();
        }

        const result = await pool.query(
            `
            UPDATE repair_assignments
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
            message: "Repair Assignment Updated Successfully",
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Update Repair Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Repair Assignment"
        });
    }
};


module.exports = {
    createRepairAssignment,
    getRepairAssignments,
    updateRepairAssignment
};