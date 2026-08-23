const pool = require("../config/db");

// ======================================
// Create Marketing Agency Profile
// ======================================
const createAgencyProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            agency_name,
            contact_person,
            phone,
            email,
            service_areas
        } = req.body;

        if (!agency_name) {
            return res.status(400).json({
                message: "Agency Name is required"
            });
        }

        const existingProfile = await pool.query(
            `
            SELECT id
            FROM marketing_agencies
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (existingProfile.rows.length > 0) {
            return res.status(400).json({
                message: "Marketing Agency Profile Already Exists"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO marketing_agencies
            (
                participant_id,
                agency_name,
                contact_person,
                phone,
                email,
                service_areas,
                status
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, 'Active')
            RETURNING *
            `,
            [
                participantId,
                agency_name,
                contact_person || null,
                phone || null,
                email || null,
                service_areas || null
            ]
        );

        res.status(201).json({
            message: "Marketing Agency Profile Created Successfully",
            agency: result.rows[0]
        });

    } catch (error) {
        console.error("Create Marketing Agency Profile Error:", error);

        res.status(500).json({
            message: "Failed to Create Marketing Agency Profile"
        });
    }
};


// ======================================
// Get Marketing Agency Profile
// ======================================
const getAgencyProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM marketing_agencies
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Marketing Agency Profile Not Found"
            });
        }

        res.json({
            agency: result.rows[0]
        });

    } catch (error) {
        console.error("Get Marketing Agency Profile Error:", error);

        res.status(500).json({
            message: "Failed to Get Marketing Agency Profile"
        });
    }
};


// ======================================
// Update Marketing Agency Profile
// ======================================
const updateAgencyProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            agency_name,
            contact_person,
            phone,
            email,
            service_areas,
            status
        } = req.body;

        const result = await pool.query(
            `
            UPDATE marketing_agencies
            SET
                agency_name = COALESCE($1, agency_name),
                contact_person = COALESCE($2, contact_person),
                phone = COALESCE($3, phone),
                email = COALESCE($4, email),
                service_areas = COALESCE($5, service_areas),
                status = COALESCE($6, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE participant_id = $7
            RETURNING *
            `,
            [
                agency_name,
                contact_person,
                phone,
                email,
                service_areas,
                status,
                participantId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Marketing Agency Profile Not Found"
            });
        }

        res.json({
            message: "Marketing Agency Profile Updated Successfully",
            agency: result.rows[0]
        });

    } catch (error) {
        console.error("Update Marketing Agency Profile Error:", error);

        res.status(500).json({
            message: "Failed to Update Marketing Agency Profile"
        });
    }
};


// ======================================
// Get Clients
// ======================================
const getMarketingClients = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                mc.id,
                mc.client_name,
                mc.client_type,
                mc.status,
                mc.created_at,
                mc.updated_at
            FROM marketing_clients AS mc

            JOIN marketing_agencies AS agency
                ON mc.agency_id = agency.id

            WHERE agency.participant_id = $1

            ORDER BY mc.created_at DESC
            `,
            [participantId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Get Marketing Clients Error:", error);

        res.status(500).json({
            message: "Failed to Get Marketing Clients"
        });
    }
};


// ======================================
// Create Client
// ======================================
const createMarketingClient = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            client_name,
            client_type,
            client_participant_id
        } = req.body;

        if (!client_name) {
            return res.status(400).json({
                message: "Client Name is required"
            });
        }

        const agencyResult = await pool.query(
            `
            SELECT id
            FROM marketing_agencies
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (agencyResult.rows.length === 0) {
            return res.status(404).json({
                message: "Marketing Agency Profile Not Found"
            });
        }

        const agencyId = agencyResult.rows[0].id;

        const result = await pool.query(
            `
            INSERT INTO marketing_clients
            (
                agency_id,
                participant_id,
                client_name,
                client_type,
                status
            )
            VALUES
            ($1, $2, $3, $4, 'Active')
            RETURNING *
            `,
            [
                agencyId,
                client_participant_id || null,
                client_name,
                client_type || null
            ]
        );

        res.status(201).json({
            message: "Marketing Client Created Successfully",
            client: result.rows[0]
        });

    } catch (error) {
        console.error("Create Marketing Client Error:", error);

        res.status(500).json({
            message: "Failed to Create Marketing Client"
        });
    }
};


// ======================================
// Get Campaigns
// ======================================
const getMarketingCampaigns = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                campaign.id,
                campaign.campaign_name,
                campaign.campaign_type,
                campaign.description,
                campaign.status,
                campaign.start_date,
                campaign.end_date,
                client.client_name,
                campaign.created_at,
                campaign.updated_at

            FROM marketing_campaigns AS campaign

            JOIN marketing_agencies AS agency
                ON campaign.agency_id = agency.id

            LEFT JOIN marketing_clients AS client
                ON campaign.client_id = client.id

            WHERE agency.participant_id = $1

            ORDER BY campaign.created_at DESC
            `,
            [participantId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Get Marketing Campaigns Error:", error);

        res.status(500).json({
            message: "Failed to Get Marketing Campaigns"
        });
    }
};


// ======================================
// Create Campaign
// ======================================
const createMarketingCampaign = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            campaign_name,
            campaign_type,
            description,
            client_id,
            start_date,
            end_date,
            status
        } = req.body;

        if (!campaign_name) {
            return res.status(400).json({
                message: "Campaign Name is required"
            });
        }

        const agencyResult = await pool.query(
            `
            SELECT id
            FROM marketing_agencies
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (agencyResult.rows.length === 0) {
            return res.status(404).json({
                message: "Marketing Agency Profile Not Found"
            });
        }

        const agencyId = agencyResult.rows[0].id;

        const result = await pool.query(
            `
            INSERT INTO marketing_campaigns
            (
                agency_id,
                client_id,
                campaign_name,
                campaign_type,
                description,
                status,
                start_date,
                end_date
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
            `,
            [
                agencyId,
                client_id || null,
                campaign_name,
                campaign_type || null,
                description || null,
                status || "Planned",
                start_date || null,
                end_date || null
            ]
        );

        res.status(201).json({
            message: "Marketing Campaign Created Successfully",
            campaign: result.rows[0]
        });

    } catch (error) {
        console.error("Create Marketing Campaign Error:", error);

        res.status(500).json({
            message: "Failed to Create Marketing Campaign"
        });
    }
};

// ======================================
// Admin - Get All Marketing Agencies
// ======================================
const getAllMarketingAgencies = async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT
                id,
                participant_id,
                agency_name,
                contact_person,
                phone,
                email,
                service_areas,
                status,
                created_at,
                updated_at
            FROM marketing_agencies
            ORDER BY created_at DESC
            `
        );

        res.json({
            message: "Marketing Agencies Fetched Successfully",
            agencies: result.rows
        });

    } catch (error) {

        console.error(
            "Get All Marketing Agencies Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Marketing Agencies"
        });
    }
};


// ======================================
// Admin - Get All Marketing Clients
// ======================================
const getAllMarketingClients = async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT
                mc.id,
                mc.agency_id,
                agency.agency_name,
                mc.participant_id,
                mc.client_name,
                mc.client_type,
                mc.status,
                mc.created_at,
                mc.updated_at

            FROM marketing_clients AS mc

            JOIN marketing_agencies AS agency
                ON mc.agency_id = agency.id

            ORDER BY mc.created_at DESC
            `
        );

        res.json({
            message: "Marketing Clients Fetched Successfully",
            clients: result.rows
        });

    } catch (error) {

        console.error(
            "Get All Marketing Clients Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Marketing Clients"
        });
    }
};


// ======================================
// Admin - Get All Marketing Campaigns
// ======================================
const getAllMarketingCampaigns = async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT
                campaign.id,
                campaign.agency_id,
                agency.agency_name,
                campaign.client_id,
                client.client_name,
                campaign.campaign_name,
                campaign.campaign_type,
                campaign.description,
                campaign.status,
                campaign.start_date,
                campaign.end_date,
                campaign.created_at,
                campaign.updated_at

            FROM marketing_campaigns AS campaign

            JOIN marketing_agencies AS agency
                ON campaign.agency_id = agency.id

            LEFT JOIN marketing_clients AS client
                ON campaign.client_id = client.id

            ORDER BY campaign.created_at DESC
            `
        );

        res.json({
            message: "Marketing Campaigns Fetched Successfully",
            campaigns: result.rows
        });

    } catch (error) {

        console.error(
            "Get All Marketing Campaigns Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Marketing Campaigns"
        });
    }
};


module.exports = {
    createAgencyProfile,
    getAgencyProfile,
    updateAgencyProfile,
    getMarketingClients,
    createMarketingClient,
    getMarketingCampaigns,
    createMarketingCampaign,

    // Admin
    getAllMarketingAgencies,
    getAllMarketingClients,
    getAllMarketingCampaigns
};