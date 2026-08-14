const pool = require("../config/db");


// ======================================
// Create Packaging Assignment
// ======================================
const createPackagingAssignment = async (req, res) => {
    try {

        const participantId = req.user.id;

        const {
            order_id,
            packaging_id,
            packaging_type,
            status
        } = req.body;


        // ======================================
        // Check Packaging Provider
        // ======================================

        const packagingResult = await pool.query(
            `
            SELECT id
            FROM packaging_providers
            WHERE id = $1
            AND participant_id = $2
            `,
            [
                packaging_id,
                participantId
            ]
        );


        if (packagingResult.rows.length === 0) {
            return res.status(404).json({
                message: "Packaging Provider Not Found"
            });
        }


        // ======================================
        // Check Existing Active Assignment
        // ======================================

        const existingAssignment = await pool.query(
            `
            SELECT id, status
            FROM packaging_assignments
            WHERE packaging_id = $1
            AND order_id = $2
            AND status IN ('Assigned', 'In Progress')
            LIMIT 1
            `,
            [
                packaging_id,
                order_id
            ]
        );


        if (existingAssignment.rows.length > 0) {
            return res.status(400).json({
                message: "Packaging already has an active assignment for this order",
                assignment: existingAssignment.rows[0]
            });
        }


        // ======================================
        // Create Assignment
        // ======================================

        const result = await pool.query(
            `
            INSERT INTO packaging_assignments
            (
                packaging_id,
                order_id,
                packaging_type,
                status
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                packaging_id,
                order_id,
                packaging_type,
                status || "Assigned"
            ]
        );


        res.status(201).json({
            message: "Packaging Assignment Created Successfully",
            assignment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create Packaging Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Packaging Assignment"
        });
    }
};



// ======================================
// Update Packaging Assignment
// ======================================
const updatePackagingAssignment = async (req, res) => {
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
                message: "Invalid Packaging Assignment Status"
            });
        }


        // ======================================
        // Check Assignment Belongs To Participant
        // ======================================

        const assignmentResult = await pool.query(
            `
            SELECT
                pa.*
            FROM packaging_assignments pa

            JOIN packaging_providers pp
                ON pa.packaging_id = pp.id

            WHERE pa.id = $1
            AND pp.participant_id = $2
            `,
            [
                assignmentId,
                participantId
            ]
        );


        if (assignmentResult.rows.length === 0) {
            return res.status(404).json({
                message: "Packaging Assignment Not Found"
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
            UPDATE packaging_assignments
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
            message: "Packaging Assignment Updated Successfully",
            assignment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update Packaging Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Packaging Assignment"
        });
    }
};



module.exports = {
    createPackagingAssignment,
    updatePackagingAssignment
};