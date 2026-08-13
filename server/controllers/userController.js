const pool = require("../config/db");

// Get All Users
const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM users ORDER BY id ASC"
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

// Create User
const createUser = async (req, res) => {

    try {

        const { full_name, email, password, role } = req.body;

        const result = await pool.query(

            `INSERT INTO users
            (full_name,email,password,role)

            VALUES($1,$2,$3,$4)

            RETURNING *`,

            [full_name, email, password, role]

        );

        res.status(201).json({
            message: "User Created Successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "User Creation Failed"
        });

    }

};

// Update User
const updateUser = async (req, res) => {

    try {

        const { id } = req.params;
        const { full_name, email, password, role } = req.body;

        const result = await pool.query(

            `UPDATE users
             SET full_name=$1,
                 email=$2,
                 password=$3,
                 role=$4
             WHERE id=$5
             RETURNING *`,

            [full_name, email, password, role, id]

        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        res.json({
            message: "User Updated Successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Update Failed"
        });

    }

};

// Delete User
const deleteUser = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(

            `DELETE FROM users
             WHERE id=$1
             RETURNING *`,

            [id]

        );

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

        console.error(error);

        res.status(500).json({

            message: "Delete Failed"

        });

    }

};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
};