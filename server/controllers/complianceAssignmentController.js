const pool = require("../config/db");


// Create Compliance Assignment
const createComplianceAssignment = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            order_id,
            customer_id,
            compliance_type,
            status
        } = req.body;

        const result = await pool.query(
            `INSERT INTO compliance_assignments
            (
                participant_id,
                order_id,
                customer_id,
                compliance_type,
                status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                participantId,
                order_id,
                customer_id,
                compliance_type,
                status || "Assigned"
            ]
        );

        res.status(201).json({
            message: "Compliance Assignment Created Successfully",
            assignment: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create Compliance Assignment Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Compliance Assignment"
        });
    }
};


// Get Assigned Compliance Tasks
const getComplianceAssignments = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `SELECT
                ca.id,
                ca.order_id,
                ca.customer_id,
                u.full_name AS customer_name,
                ca.compliance_type,
                ca.status,
                ca.assigned_at,
                ca.completed_at
             FROM compliance_assignments ca
             JOIN users u
             ON ca.customer_id = u.id
             WHERE ca.participant_id = $1
             ORDER BY ca.id DESC`,
            [participantId]
        );

        res.json(result.rows);

    } catch (error) {

        console.error(
            "Get Compliance Assignments Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Compliance Assignments"
        });
    }
};


module.exports = {
    createComplianceAssignment,
    getComplianceAssignments
};