const pool = require("../config/db");

// =========================================
// GET ALL USERS
// =========================================

const getUsers = async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM users ORDER BY id ASC"
        );

        res.json(result.rows);

    } catch (error) {

        console.error("Get Users Error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });

    }
};


// =========================================
// CREATE USER
// =========================================

const createUser = async (req, res) => {

    try {

        const {
            full_name,
            email,
            password,
            role
        } = req.body;


        const result = await pool.query(

            `INSERT INTO users
            (full_name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,

            [
                full_name,
                email,
                password,
                role
            ]

        );


        res.status(201).json({

            message: "User Created Successfully",

            user: result.rows[0]

        });


    } catch (error) {

        console.error("Create User Error:", error);

        res.status(500).json({

            message: "User Creation Failed"

        });

    }

};


// =========================================
// UPDATE USER
// =========================================

const updateUser = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            full_name,
            email,
            password,
            role
        } = req.body;


        let result;


        // =====================================
        // PASSWORD PROVIDED
        // =====================================

        if (password && password.trim() !== "") {

            result = await pool.query(

                `UPDATE users
                 SET full_name = $1,
                     email = $2,
                     password = $3,
                     role = $4
                 WHERE id = $5
                 RETURNING *`,

                [
                    full_name,
                    email,
                    password,
                    role,
                    id
                ]

            );

        }


        // =====================================
        // PASSWORD NOT PROVIDED
        // KEEP OLD PASSWORD
        // =====================================

        else {

            result = await pool.query(

                `UPDATE users
                 SET full_name = $1,
                     email = $2,
                     role = $3
                 WHERE id = $4
                 RETURNING *`,

                [
                    full_name,
                    email,
                    role,
                    id
                ]

            );

        }


        // =====================================
        // USER NOT FOUND
        // =====================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                message: "User Not Found"

            });

        }


        // =====================================
        // SUCCESS
        // =====================================

        res.json({

            message: "User Updated Successfully",

            user: result.rows[0]

        });


    } catch (error) {

        console.error("Update User Error:", error);

        res.status(500).json({

            message: "Update Failed"

        });

    }

};


// Delete User - Soft Delete
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("DELETE REQUEST RECEIVED FOR USER ID:", id);

        const result = await pool.query(
            `UPDATE users
             SET status = 'Inactive',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id, full_name, email, role, status`,
            [id]
        );

        console.log("DELETE QUERY RESULT:", result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        res.json({
            message: "User Deleted Successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("========== DELETE USER ERROR ==========");
        console.error(error);
        console.error("MESSAGE:", error.message);
        console.error("CODE:", error.code);
        console.error("DETAIL:", error.detail);
        console.error("======================================");

        res.status(500).json({
            message: "Delete Failed",
            error: error.message
        });
    }
};

// =========================================
// EXPORT
// =========================================

module.exports = {

    getUsers,
    createUser,
    updateUser,
    deleteUser

};