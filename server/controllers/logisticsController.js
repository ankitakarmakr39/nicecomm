const pool = require("../config/db");

// ===============================
// Create Logistics Profile
// ===============================
const createLogisticsProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            fleet_size,
            service_areas
        } = req.body;

        if (!company_name) {
            return res.status(400).json({
                message: "Company Name is required"
            });
        }

        // Check existing profile
        const existingProfile = await pool.query(
            `
            SELECT id
            FROM logistics_providers
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (existingProfile.rows.length > 0) {
            return res.status(400).json({
                message: "Logistics Profile Already Exists"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO logistics_providers
            (
                participant_id,
                company_name,
                contact_person,
                phone,
                fleet_size,
                service_areas,
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
                fleet_size || 0,
                service_areas || null
            ]
        );

        res.status(201).json({
            message: "Logistics Profile Created Successfully",
            logistics: result.rows[0]
        });

    } catch (error) {
        console.error("Create Logistics Profile Error:", error);

        res.status(500).json({
            message: "Failed to Create Logistics Profile"
        });
    }
};


// ===============================
// Get Logistics Profile
// ===============================
const getLogisticsProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM logistics_providers
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Logistics Profile Not Found"
            });
        }

        res.json({
            logistics: result.rows[0]
        });

    } catch (error) {
        console.error("Get Logistics Profile Error:", error);

        res.status(500).json({
            message: "Failed to Get Logistics Profile"
        });
    }
};


// ===============================
// Update Logistics Profile
// ===============================
const updateLogisticsProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            fleet_size,
            service_areas,
            status
        } = req.body;

        const result = await pool.query(
            `
            UPDATE logistics_providers
            SET
                company_name = COALESCE($1, company_name),
                contact_person = COALESCE($2, contact_person),
                phone = COALESCE($3, phone),
                fleet_size = COALESCE($4, fleet_size),
                service_areas = COALESCE($5, service_areas),
                status = COALESCE($6, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE participant_id = $7
            RETURNING *
            `,
            [
                company_name,
                contact_person,
                phone,
                fleet_size,
                service_areas,
                status,
                participantId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Logistics Profile Not Found"
            });
        }

        res.json({
            message: "Logistics Profile Updated Successfully",
            logistics: result.rows[0]
        });

    } catch (error) {
        console.error("Update Logistics Profile Error:", error);

        res.status(500).json({
            message: "Failed to Update Logistics Profile"
        });
    }
};


// ===============================
// Get Assigned Shipments
// ===============================
const getLogisticsShipments = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                la.id,
                la.order_id,
                o.customer_id,
                customer_user.full_name AS customer_name,
                la.pickup_address,
                la.destination_address,
                la.status,
                la.assigned_at,
                la.completed_at
            FROM logistics_assignments AS la

            JOIN logistics_providers AS logistics
                ON la.logistics_id = logistics.id

            JOIN orders AS o
                ON la.order_id = o.id

            JOIN users AS customer_user
                ON o.customer_id = customer_user.id

            WHERE logistics.participant_id = $1

            ORDER BY la.assigned_at DESC
            `,
            [participantId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Get Logistics Shipments Error:", error);

        res.status(500).json({
            message: "Failed to Get Logistics Shipments"
        });
    }
};



// ===============================
// Get All Logistics Providers
// Admin Dashboard
// ===============================
const getAllLogisticsProviders = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                lp.id,
                lp.participant_id,
                lp.company_name,
                lp.contact_person,
                lp.phone,
                lp.fleet_size,
                lp.service_areas,
                lp.status,
                lp.created_at,
                lp.updated_at
            FROM logistics_providers lp
            ORDER BY lp.created_at DESC
            `
        );

        res.json({
            message: "Logistics Providers Fetched Successfully",
            logistics: result.rows
        });

    } catch (error) {
        console.error(
            "Get All Logistics Providers Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Fetch Logistics Providers"
        });
    }
};

// ======================================
// Get All Logistics Assignments
// Admin View
// ======================================

const getAllLogisticsAssignments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                la.id AS assignment_id,
                la.order_id,
                la.logistics_id,

                lp.company_name,
                lp.contact_person,
                lp.phone,

                la.pickup_address,
                la.destination_address,
                la.status,
                la.assigned_at,
                la.completed_at

            FROM logistics_assignments la

            JOIN logistics_providers lp
                ON la.logistics_id = lp.id

            ORDER BY la.assigned_at DESC
        `);

        res.json({
            message: "Logistics Assignments Fetched Successfully",
            assignments: result.rows
        });

    } catch (error) {

        console.error(
            "Get All Logistics Assignments Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Fetch Logistics Assignments"
        });
    }
};

module.exports = {
    createLogisticsProfile,
    getLogisticsProfile,
    updateLogisticsProfile,
    getLogisticsShipments,
    getAllLogisticsProviders,
    getAllLogisticsAssignments
};