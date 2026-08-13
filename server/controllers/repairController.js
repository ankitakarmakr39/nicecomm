const pool = require("../config/db");


// Create Repair Profile
const createRepairProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            service_areas,
            status
        } = req.body;

        const result = await pool.query(
            `INSERT INTO repairs
            (
                participant_id,
                company_name,
                contact_person,
                phone,
                service_areas,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                participantId,
                company_name,
                contact_person,
                phone,
                service_areas,
                status || "Active"
            ]
        );

        res.status(201).json({
            message: "Repair Profile Created Successfully",
            repair: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create Repair Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Repair Profile"
        });
    }
};


// Get Repair Profile
const getRepairProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `SELECT *
             FROM repairs
             WHERE participant_id = $1`,
            [participantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Repair Profile Not Found"
            });
        }

        res.json({
            repair: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get Repair Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Repair Profile"
        });
    }
};


// Update Repair Profile
const updateRepairProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            service_areas,
            status
        } = req.body;

        const result = await pool.query(
            `UPDATE repairs
             SET
                company_name = COALESCE($1, company_name),
                contact_person = COALESCE($2, contact_person),
                phone = COALESCE($3, phone),
                service_areas = COALESCE($4, service_areas),
                status = COALESCE($5, status),
                updated_at = CURRENT_TIMESTAMP
             WHERE participant_id = $6
             RETURNING *`,
            [
                company_name,
                contact_person,
                phone,
                service_areas,
                status,
                participantId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Repair Profile Not Found"
            });
        }

        res.json({
            message: "Repair Profile Updated Successfully",
            repair: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update Repair Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Repair Profile"
        });
    }
};


module.exports = {
    createRepairProfile,
    getRepairProfile,
    updateRepairProfile
};