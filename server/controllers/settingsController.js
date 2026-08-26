const pool = require("../config/db");
const bcrypt = require("bcryptjs");


// =====================================================
// GET MY PROFILE
// =====================================================

const getMyProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                id,
                full_name,
                email,
                phone,
                role
            FROM users
            WHERE id = $1
            `,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        res.json({
            message: "Profile Fetched Successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("Get Profile Error:", error);

        res.status(500).json({
            message: "Failed to Get Profile"
        });
    }
};


// =====================================================
// UPDATE MY PROFILE
// =====================================================

const updateMyProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            full_name,
            phone
        } = req.body;

        if (!full_name) {
            return res.status(400).json({
                message: "Full name is required"
            });
        }

        const result = await pool.query(
            `
            UPDATE users
            SET
                full_name = $1,
                phone = $2
            WHERE id = $3
            RETURNING
                id,
                full_name,
                email,
                phone,
                role
            `,
            [
                full_name,
                phone || null,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        res.json({
            message: "Profile Updated Successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("Update Profile Error:", error);

        res.status(500).json({
            message: "Failed to Update Profile"
        });
    }
};


// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            current_password,
            new_password
        } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                message:
                    "Current password and new password are required"
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                message:
                    "New password must be at least 6 characters"
            });
        }

        /*
         * IMPORTANT:
         * নিচের "password" column-টা তোমার users table-এর
         * exact password column name অনুযায়ী রাখতে হবে।
         */

        const userResult = await pool.query(
            `
            SELECT id, password
            FROM users
            WHERE id = $1
            `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        const user = userResult.rows[0];

        const passwordMatch = await bcrypt.compare(
            current_password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(
            new_password,
            10
        );

        await pool.query(
            `
            UPDATE users
            SET password = $1
            WHERE id = $2
            `,
            [
                hashedPassword,
                userId
            ]
        );

        res.json({
            message: "Password Changed Successfully"
        });

    } catch (error) {

        console.error("Change Password Error:", error);

        res.status(500).json({
            message: "Failed to Change Password"
        });
    }
};


module.exports = {
    getMyProfile,
    updateMyProfile,
    changePassword
};