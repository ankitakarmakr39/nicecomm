const pool = require("../config/db");

// ======================================
// Create Affiliate Profile
// ======================================
const createAffiliateProfile = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            affiliate_name,
            phone,
            email,
            referral_code
        } = req.body;

        if (!affiliate_name || !referral_code) {
            return res.status(400).json({
                message: "Affiliate Name and Referral Code are required"
            });
        }

        // Check existing profile
        const existingProfile = await pool.query(
            `
            SELECT id
            FROM affiliates
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (existingProfile.rows.length > 0) {
            return res.status(400).json({
                message: "Affiliate Profile Already Exists"
            });
        }

        // Check referral code
        const existingCode = await pool.query(
            `
            SELECT id
            FROM affiliates
            WHERE referral_code = $1
            `,
            [referral_code]
        );

        if (existingCode.rows.length > 0) {
            return res.status(400).json({
                message: "Referral Code Already Exists"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO affiliates
            (
                participant_id,
                affiliate_name,
                phone,
                email,
                referral_code,
                status
            )
            VALUES
            ($1, $2, $3, $4, $5, 'Active')
            RETURNING *
            `,
            [
                participantId,
                affiliate_name,
                phone || null,
                email || null,
                referral_code
            ]
        );

        res.status(201).json({
            message: "Affiliate Profile Created Successfully",
            affiliate: result.rows[0]
        });

    } catch (error) {
        console.error("Create Affiliate Profile Error:", error);

        res.status(500).json({
            message: "Failed to Create Affiliate Profile"
        });
    }
};


// ======================================
// Get Affiliate Profile
// ======================================
const getAffiliateProfile = async (req, res) => {
    try {

        const userId = req.user.id;
        const userRole = req.user.role;

        // ======================================
        // ADMIN
        // ======================================
        if (userRole === "admin") {

            const result = await pool.query(
                `
                SELECT *
                FROM affiliates
                ORDER BY created_at DESC
                `
            );

            return res.json({
                affiliates: result.rows
            });
        }


        // ======================================
        // PARTICIPANT
        // ======================================
        const result = await pool.query(
            `
            SELECT *
            FROM affiliates
            WHERE participant_id = $1
            `,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Affiliate Profile Not Found"
            });
        }

        res.json({
            affiliate: result.rows[0]
        });

    } catch (error) {
        console.error("Get Affiliate Profile Error:", error);

        res.status(500).json({
            message: "Failed to Get Affiliate Profile"
        });
    }
};


// ======================================
// Update Affiliate Profile
// ======================================
const updateAffiliateProfile = async (req, res) => {
    try {

        const participantId = req.user.id;

        const {
            affiliate_name,
            phone,
            email,
            referral_code,
            status
        } = req.body;


        // ======================================
        // Check Referral Code
        // ======================================
        if (referral_code) {

            const existingCode = await pool.query(
                `
                SELECT id
                FROM affiliates
                WHERE referral_code = $1
                AND participant_id != $2
                `,
                [
                    referral_code,
                    participantId
                ]
            );

            if (existingCode.rows.length > 0) {
                return res.status(400).json({
                    message: "Referral Code Already Exists"
                });
            }
        }


        // ======================================
        // Update
        // ======================================
        const result = await pool.query(
            `
            UPDATE affiliates
            SET
                affiliate_name = COALESCE($1, affiliate_name),
                phone = COALESCE($2, phone),
                email = COALESCE($3, email),
                referral_code = COALESCE($4, referral_code),
                status = COALESCE($5, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE participant_id = $6
            RETURNING *
            `,
            [
                affiliate_name,
                phone,
                email,
                referral_code,
                status,
                participantId
            ]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Affiliate Profile Not Found"
            });
        }


        res.json({
            message: "Affiliate Profile Updated Successfully",
            affiliate: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update Affiliate Profile Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Update Affiliate Profile"
        });
    }
};


// ======================================
// Get Affiliate Commissions
// ======================================
const getAffiliateCommissions = async (req, res) => {
    try {

        const userId = req.user.id;
        const userRole = req.user.role;


        // ======================================
        // ADMIN
        // ======================================
        if (userRole === "admin") {

            const result = await pool.query(
                `
                SELECT
                    commission.id,
                    commission.affiliate_id,
                    commission.order_id,
                    commission.referral_code,
                    commission.order_amount,
                    commission.commission_rate,
                    commission.commission_amount,
                    commission.status,
                    commission.created_at,
                    commission.updated_at,

                    affiliate.affiliate_name,
                    affiliate.participant_id

                FROM affiliate_commissions AS commission

                JOIN affiliates AS affiliate
                    ON commission.affiliate_id = affiliate.id

                ORDER BY commission.created_at DESC
                `
            );

            return res.json({
                commissions: result.rows
            });
        }


        // ======================================
        // PARTICIPANT
        // ======================================
        const result = await pool.query(
            `
            SELECT
                commission.id,
                commission.order_id,
                commission.referral_code,
                commission.order_amount,
                commission.commission_rate,
                commission.commission_amount,
                commission.status,
                commission.created_at,
                commission.updated_at

            FROM affiliate_commissions AS commission

            JOIN affiliates AS affiliate
                ON commission.affiliate_id = affiliate.id

            WHERE affiliate.participant_id = $1

            ORDER BY commission.created_at DESC
            `,
            [userId]
        );

        res.json(result.rows);

    } catch (error) {

        console.error(
            "Get Affiliate Commissions Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Affiliate Commissions"
        });
    }
};


// ======================================
// Create Commission Record
// ======================================
const createAffiliateCommission = async (req, res) => {
    try {

        const participantId = req.user.id;

        const {
            order_id,
            referral_code,
            order_amount,
            commission_rate,
            commission_amount,
            status
        } = req.body;


        // ======================================
        // Referral Code Required
        // ======================================
        if (!referral_code) {
            return res.status(400).json({
                message: "Referral Code is required"
            });
        }


        // ======================================
        // Find Affiliate
        // ======================================
        const affiliateResult = await pool.query(
            `
            SELECT
                id,
                referral_code
            FROM affiliates
            WHERE participant_id = $1
            `,
            [participantId]
        );


        if (affiliateResult.rows.length === 0) {
            return res.status(404).json({
                message: "Affiliate Profile Not Found"
            });
        }


        const affiliate = affiliateResult.rows[0];


        // ======================================
        // Validate Referral Code
        // ======================================
        if (affiliate.referral_code !== referral_code) {
            return res.status(400).json({
                message: "Invalid Referral Code"
            });
        }


        // ======================================
        // Create Commission
        // ======================================
        const result = await pool.query(
            `
            INSERT INTO affiliate_commissions
            (
                affiliate_id,
                order_id,
                referral_code,
                order_amount,
                commission_rate,
                commission_amount,
                status
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `,
            [
                affiliate.id,
                order_id || null,
                referral_code,
                order_amount || 0,
                commission_rate || 0,
                commission_amount || 0,
                status || "Pending"
            ]
        );


        res.status(201).json({
            message: "Affiliate Commission Created Successfully",
            commission: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Create Affiliate Commission Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Create Affiliate Commission"
        });
    }
};


// ======================================
// Admin - Get All Affiliates
// ======================================
const getAllAffiliates = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT *
            FROM affiliates
            ORDER BY created_at DESC
            `
        );

        res.json({
            message: "Affiliates Fetched Successfully",
            affiliates: result.rows
        });

    } catch (error) {
        console.error("Get All Affiliates Error:", error);

        res.status(500).json({
            message: "Failed to Get Affiliates"
        });
    }
};


// ======================================
// Admin - Get All Affiliate Commissions
// ======================================
const getAllAffiliateCommissions = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                commission.id,
                commission.affiliate_id,
                affiliate.affiliate_name,
                commission.order_id,
                commission.referral_code,
                commission.order_amount,
                commission.commission_rate,
                commission.commission_amount,
                commission.status,
                commission.created_at,
                commission.updated_at

            FROM affiliate_commissions AS commission

            JOIN affiliates AS affiliate
                ON commission.affiliate_id = affiliate.id

            ORDER BY commission.created_at DESC
            `
        );

        res.json({
            message: "Affiliate Commissions Fetched Successfully",
            commissions: result.rows
        });

    } catch (error) {
        console.error(
            "Get All Affiliate Commissions Error:",
            error
        );

        res.status(500).json({
            message: "Failed to Get Affiliate Commissions"
        });
    }
};

// ======================================
// EXPORTS
// ======================================
module.exports = {
    createAffiliateProfile,
    getAffiliateProfile,
    updateAffiliateProfile,
    getAffiliateCommissions,
    createAffiliateCommission,
    getAllAffiliates,
    getAllAffiliateCommissions
};