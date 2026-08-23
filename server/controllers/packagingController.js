const pool = require("../config/db");

// ======================================
// Create Packaging Profile
// ======================================
const createPackagingProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            packaging_types,
            capacity
        } = req.body;

        if (!company_name) {
            return res.status(400).json({
                message: "Company Name is required"
            });
        }

        const existingProfile = await pool.query(
            `
            SELECT id
            FROM packaging_providers
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (existingProfile.rows.length > 0) {
            return res.status(400).json({
                message: "Packaging Profile Already Exists"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO packaging_providers
            (
                participant_id,
                company_name,
                contact_person,
                phone,
                packaging_types,
                capacity,
                status
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, 'Active')
            RETURNING *
            `,
            [
                participantId,
                company_name,
                contact_person || null,
                phone || null,
                packaging_types || null,
                capacity || 0
            ]
        );

        res.status(201).json({
            message: "Packaging Profile Created Successfully",
            packaging: result.rows[0]
        });

    } catch (error) {
        console.error("Create Packaging Profile Error:", error);

        res.status(500).json({
            message: "Failed to Create Packaging Profile"
        });
    }
};


// ======================================
// Get My Packaging Profile
// Participant
// ======================================
const getPackagingProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM packaging_providers
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Packaging Profile Not Found"
            });
        }

        res.json({
            packaging: result.rows[0]
        });

    } catch (error) {
        console.error("Get Packaging Profile Error:", error);

        res.status(500).json({
            message: "Failed to Get Packaging Profile"
        });
    }
};


// ======================================
// Update My Packaging Profile
// ======================================
const updatePackagingProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            packaging_types,
            capacity,
            status
        } = req.body;

        const result = await pool.query(
            `
            UPDATE packaging_providers
            SET
                company_name = COALESCE($1, company_name),
                contact_person = COALESCE($2, contact_person),
                phone = COALESCE($3, phone),
                packaging_types = COALESCE($4, packaging_types),
                capacity = COALESCE($5, capacity),
                status = COALESCE($6, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE participant_id = $7
            RETURNING *
            `,
            [
                company_name,
                contact_person,
                phone,
                packaging_types,
                capacity,
                status,
                participantId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Packaging Profile Not Found"
            });
        }

        res.json({
            message: "Packaging Profile Updated Successfully",
            packaging: result.rows[0]
        });

    } catch (error) {
        console.error("Update Packaging Profile Error:", error);

        res.status(500).json({
            message: "Failed to Update Packaging Profile"
        });
    }
};


// ======================================
// Get My Assigned Packaging Orders
// Participant
// ======================================
const getPackagingOrders = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                pa.id,
                pa.order_id,
                o.customer_id,
                customer_user.full_name AS customer_name,
                pa.packaging_type,
                pa.status,
                pa.assigned_at,
                pa.completed_at
            FROM packaging_assignments AS pa

            JOIN packaging_providers AS packaging
                ON pa.packaging_id = packaging.id

            JOIN orders AS o
                ON pa.order_id = o.id

            JOIN users AS customer_user
                ON o.customer_id = customer_user.id

            WHERE packaging.participant_id = $1

            ORDER BY pa.assigned_at DESC
            `,
            [participantId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Get Packaging Orders Error:", error);

        res.status(500).json({
            message: "Failed to Get Packaging Orders"
        });
    }
};


// ======================================
// ADMIN
// Get All Packaging Providers
// ======================================
const getAllPackagingProviders = async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT
                id,
                participant_id,
                company_name,
                contact_person,
                phone,
                packaging_types,
                capacity,
                status,
                created_at,
                updated_at
            FROM packaging_providers
            ORDER BY created_at DESC
            `
        );

        res.json({
            message: "Packaging Providers Fetched Successfully",
            packaging: result.rows
        });

    } catch (error) {
        console.error(
            "Get All Packaging Providers Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Packaging Providers"
        });
    }
};


// ======================================
// ADMIN
// Get All Packaging Assignments
// ======================================
const getAllPackagingAssignments = async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT
                pa.id AS assignment_id,
                pa.order_id,
                pa.packaging_id,
                pp.company_name,
                pp.contact_person,
                pp.phone,
                pa.packaging_type,
                pa.status,
                pa.assigned_at,
                pa.completed_at
            FROM packaging_assignments AS pa

            JOIN packaging_providers AS pp
                ON pa.packaging_id = pp.id

            ORDER BY pa.assigned_at DESC
            `
        );

        res.json({
            message: "Packaging Assignments Fetched Successfully",
            assignments: result.rows
        });

    } catch (error) {
        console.error(
            "Get All Packaging Assignments Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Packaging Assignments"
        });
    }
};


// ======================================
// EXPORTS
// ======================================
module.exports = {
    createPackagingProfile,
    getPackagingProfile,
    updatePackagingProfile,
    getPackagingOrders,
    getAllPackagingProviders,
    getAllPackagingAssignments
};