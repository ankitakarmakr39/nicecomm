
const pool = require("../config/db");

// ======================================
// Create Logistics Assignment
// ======================================
const createLogisticsAssignment = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            order_id,
            logistics_id,
            pickup_address,
            destination_address,
            status
        } = req.body;


        // ======================================
        // Check Existing Active Assignment
        // ======================================

        const existingAssignment = await pool.query(
            `
            SELECT id, status
            FROM logistics_assignments
            WHERE logistics_id = $1
            AND order_id = $2
            AND status IN ('Assigned', 'In Progress')
            LIMIT 1
            `,
            [
                logistics_id,
                order_id
            ]
        );


        if (existingAssignment.rows.length > 0) {
            return res.status(400).json({
                message: "Logistics already has an active assignment for this order",
                assignment: existingAssignment.rows[0]
            });
        }


        // ======================================
        // Create Assignment
        // ======================================

        const result = await pool.query(
            `
            INSERT INTO logistics_assignments
            (
                logistics_id,
                order_id,
                pickup_address,
                destination_address,
                status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                logistics_id,
                order_id,
                pickup_address,
                destination_address,
                status || "Assigned"
            ]
        );


        res.status(201).json({
            message: "Logistics Assignment Created Successfully",
            assignment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create Logistics Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Logistics Assignment"
        });
    }
};



// ======================================
// Update Logistics Assignment
// ======================================
const updateLogisticsAssignment = async (req, res) => {
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
                message: "Invalid Logistics Assignment Status"
            });
        }


        // ======================================
        // Check Assignment Belongs
        // ======================================

        const assignmentResult = await pool.query(
            `
            SELECT
                la.*
            FROM logistics_assignments la

            JOIN logistics_providers lp
                ON la.logistics_id = lp.id

            WHERE la.id = $1
            AND lp.participant_id = $2
            `,
            [
                assignmentId,
                participantId
            ]
        );


        if (assignmentResult.rows.length === 0) {
            return res.status(404).json({
                message: "Logistics Assignment Not Found"
            });
        }


        // ======================================
        // Completed Date
        // ======================================

        let completedAt = null;


        if (status === "Completed") {
            completedAt = new Date();
        }


        // ======================================
        // Update Assignment
        // ======================================

        const result = await pool.query(
            `
            UPDATE logistics_assignments
            SET
                status = $1,
                completed_at = $2
            WHERE id = $3
            RETURNING *
            `,
            [
                status,
                completedAt,
                assignmentId
            ]
        );


        res.json({
            message: "Logistics Assignment Updated Successfully",
            assignment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update Logistics Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Logistics Assignment"
        });
    }
};



module.exports = {
    createLogisticsAssignment,
    updateLogisticsAssignment
};
