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

        const existingProfile = await pool.query(
            `
    SELECT id
    FROM repairs
    WHERE participant_id = $1
    `,
            [participantId]
        );

        if (existingProfile.rows.length > 0) {
            return res.status(400).json({
                message: "Repair Profile Already Exists"
            });
        }

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

// ======================================
// Admin - Get All Repair Partners
// ======================================
const getAllRepairPartners = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                r.id,
                r.participant_id,
                r.company_name,
                r.contact_person,
                r.phone,
                r.service_areas,
                r.status,
                r.created_at,
                r.updated_at,

                p.company_name AS participant_company_name,
                p.contact_person AS participant_contact_person,
                p.status AS participant_status,

                pt.name AS participant_type

            FROM repairs r

            LEFT JOIN participants p
                ON r.participant_id = p.id

            LEFT JOIN participant_types pt
                ON p.participant_type_id = pt.id

            ORDER BY r.created_at DESC
        `);

        res.json({
            message: "Repair Partners Fetched Successfully",
            repairs: result.rows
        });

    } catch (error) {
        console.error(
            "Get All Repair Partners Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Repair Partners"
        });
    }
};


module.exports = {
    createRepairProfile,
    getRepairProfile,
    updateRepairProfile,

    // Admin
    getAllRepairPartners
};