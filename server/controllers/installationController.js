const pool = require("../config/db");


// Create Installation Profile
const createInstallationProfile = async (req, res) => {
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
            `INSERT INTO installations
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
            message: "Installation Profile Created Successfully",
            installation: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create Installation Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Installation Profile"
        });
    }
};


// Get Installation Profile
const getInstallationProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `SELECT *
             FROM installations
             WHERE participant_id = $1`,
            [participantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Installation Profile Not Found"
            });
        }

        res.json({
            installation: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get Installation Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Installation Profile"
        });
    }
};


// Update Installation Profile
const updateInstallationProfile = async (req, res) => {
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
            `UPDATE installations
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
                message: "Installation Profile Not Found"
            });
        }

        res.json({
            message: "Installation Profile Updated Successfully",
            installation: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update Installation Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Installation Profile"
        });
    }
};


module.exports = {
    createInstallationProfile,
    getInstallationProfile,
    updateInstallationProfile
};