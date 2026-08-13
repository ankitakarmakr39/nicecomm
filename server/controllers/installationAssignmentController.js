const pool = require("../config/db");


// ======================================
// Create Installation Assignment
// ======================================
const createInstallationAssignment = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            order_id,
            customer_id,
            installation_type,
            status
        } = req.body;


        // ======================================
        // Check Existing Active Assignment
        // ======================================

        const existingAssignment = await pool.query(
            `
            SELECT id, status
            FROM installation_assignments
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
                message: "Installation already has an active assignment for this order",
                assignment: existingAssignment.rows[0]
            });
        }


        // ======================================
        // Create Assignment
        // ======================================

        const result = await pool.query(
            `
            INSERT INTO installation_assignments
            (
                participant_id,
                order_id,
                customer_id,
                installation_type,
                status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                participantId,
                order_id,
                customer_id,
                installation_type,
                status || "Assigned"
            ]
        );


        res.status(201).json({
            message: "Installation Assignment Created Successfully",
            assignment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create Installation Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Installation Assignment"
        });
    }
};



// ======================================
// Get Assigned Installations
// ======================================
const getInstallationAssignments = async (req, res) => {
    try {
        const participantId = req.user.id;


        const result = await pool.query(
            `
            SELECT
                ia.id,
                ia.order_id,
                ia.customer_id,
                u.full_name AS customer_name,
                ia.installation_type,
                ia.status,
                ia.assigned_at,
                ia.completed_at

            FROM installation_assignments ia

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
            "Get Installation Assignments Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Installation Assignments"
        });
    }
};



// ======================================
// Update Installation Assignment
// ======================================
const updateInstallationAssignment = async (req, res) => {
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
                message: "Invalid Installation Assignment Status"
            });
        }


        // ======================================
        // Check Assignment
        // ======================================

        const assignmentResult = await pool.query(
            `
            SELECT *
            FROM installation_assignments
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
                message: "Installation Assignment Not Found"
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
            UPDATE installation_assignments
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
            message: "Installation Assignment Updated Successfully",
            assignment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update Installation Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Installation Assignment"
        });
    }
};



module.exports = {
    createInstallationAssignment,
    getInstallationAssignments,
    updateInstallationAssignment
};