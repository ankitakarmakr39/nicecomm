const pool = require("../config/db");


// Create Compliance Profile
const createComplianceProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            compliance_types,
            service_areas,
            status
        } = req.body;

        const result = await pool.query(
            `INSERT INTO compliances
            (
                participant_id,
                company_name,
                contact_person,
                phone,
                compliance_types,
                service_areas,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                participantId,
                company_name,
                contact_person,
                phone,
                compliance_types,
                service_areas,
                status || "Active"
            ]
        );

        res.status(201).json({
            message: "Compliance Profile Created Successfully",
            compliance: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create Compliance Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Compliance Profile"
        });
    }
};


// Get Compliance Profile
const getComplianceProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `SELECT *
             FROM compliances
             WHERE participant_id = $1`,
            [participantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Compliance Profile Not Found"
            });
        }

        res.json({
            compliance: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get Compliance Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Compliance Profile"
        });
    }
};


// Update Compliance Profile
const updateComplianceProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            compliance_types,
            service_areas,
            status
        } = req.body;

        const result = await pool.query(
            `UPDATE compliances
             SET
                company_name = COALESCE($1, company_name),
                contact_person = COALESCE($2, contact_person),
                phone = COALESCE($3, phone),
                compliance_types = COALESCE($4, compliance_types),
                service_areas = COALESCE($5, service_areas),
                status = COALESCE($6, status),
                updated_at = CURRENT_TIMESTAMP
             WHERE participant_id = $7
             RETURNING *`,
            [
                company_name,
                contact_person,
                phone,
                compliance_types,
                service_areas,
                status,
                participantId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Compliance Profile Not Found"
            });
        }

        res.json({
            message: "Compliance Profile Updated Successfully",
            compliance: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update Compliance Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Compliance Profile"
        });
    }
};


module.exports = {
    createComplianceProfile,
    getComplianceProfile,
    updateComplianceProfile
};