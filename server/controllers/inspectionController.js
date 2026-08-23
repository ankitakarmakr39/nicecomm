
const pool = require("../config/db");

// ======================================
// Create Inspection Profile
// ======================================
const createInspectionProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            service_areas,
            status
        } = req.body;

        // ======================================
        // Required Field Validation
        // ======================================

        if (!company_name) {
            return res.status(400).json({
                message: "Company Name is required"
            });
        }

        // ======================================
        // Check Existing Inspection Profile
        // ======================================

        const existingProfile = await pool.query(
            `
            SELECT id
            FROM inspections
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (existingProfile.rows.length > 0) {
            return res.status(400).json({
                message: "Inspection Profile Already Exists"
            });
        }

        // ======================================
        // Create Inspection Profile
        // ======================================

        const result = await pool.query(
            `
            INSERT INTO inspections
            (
                participant_id,
                company_name,
                contact_person,
                phone,
                service_areas,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                participantId,
                company_name,
                contact_person || null,
                phone || null,
                service_areas || null,
                status || "Active"
            ]
        );

        res.status(201).json({
            message: "Inspection Profile Created Successfully",
            inspection: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create Inspection Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Inspection Profile"
        });
    }
};


// ======================================
// Get Inspection Profile
// ======================================
const getInspectionProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM inspections
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Inspection Profile Not Found"
            });
        }

        res.json({
            inspection: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get Inspection Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Inspection Profile"
        });
    }
};


// ======================================
// Update Inspection Profile
// ======================================
const updateInspectionProfile = async (req, res) => {
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
            `
            UPDATE inspections
            SET
                company_name = COALESCE($1, company_name),
                contact_person = COALESCE($2, contact_person),
                phone = COALESCE($3, phone),
                service_areas = COALESCE($4, service_areas),
                status = COALESCE($5, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE participant_id = $6
            RETURNING *
            `,
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
                message: "Inspection Profile Not Found"
            });
        }

        res.json({
            message: "Inspection Profile Updated Successfully",
            inspection: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update Inspection Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Inspection Profile"
        });
    }
};


// ======================================
// ADMIN - GET ALL INSPECTION PARTNERS
// ======================================
const getAllInspectionPartners = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                i.*,
                p.company_name AS participant_company_name,
                p.contact_person AS participant_contact_person,
                p.status AS participant_status,
                pt.name AS participant_type
            FROM inspections i

            LEFT JOIN participants p
                ON i.participant_id = p.id

            LEFT JOIN participant_types pt
                ON p.participant_type_id = pt.id

            ORDER BY i.id ASC
        `);

        res.json({
            message: "Inspection Partners Fetched Successfully",
            inspections: result.rows
        });

    } catch (error) {

        console.error(
            "Get All Inspection Partners Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Fetch Inspection Partners"
        });
    }
};

// ======================================
// Export Controllers
// ======================================
module.exports = {
    createInspectionProfile,
    getInspectionProfile,
    updateInspectionProfile,
    getAllInspectionPartners
};

