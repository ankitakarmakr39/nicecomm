const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =========================
// Register User
// =========================
const registerUser = async (req, res) => {

    try {

        const {
            full_name,
            email,
            password,
            phone
        } = req.body;

        // 1. Password Hash
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Registration Email:", JSON.stringify(email));

        // 2. Email Check
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // 3. Insert User
        const result = await pool.query(
            `INSERT INTO users
            (full_name, email, password, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, full_name, email, phone, role`,
            [
                full_name,
                email,
                hashedPassword,
                phone,
                "customer"
            ]
        );

        // 4. Response
        res.status(201).json({
            message: "Registration Successful",
            user: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Registration Failed"
        });

    }

};


// =========================
// Login User
// =========================
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Debug logs
        console.log("LOGIN EMAIL RECEIVED:", JSON.stringify(email));
        console.log("LOGIN PASSWORD RECEIVED:", !!password);

        // Find User
        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        // Debug database result
        console.log("LOGIN USER FOUND:", user.rows.length);

        if (user.rows.length === 0) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        // Check Password
        const isMatch = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        console.log("PASSWORD MATCH:", isMatch);

        if (!isMatch) {

            return res.status(401).json({
                message: "Invalid Password"
            });

        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user.rows[0].id,
                email: user.rows[0].email,
                role: user.rows[0].role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Login Success
        res.json({
            message: "Login Successful",
            token,
            user: {
                id: user.rows[0].id,
                full_name: user.rows[0].full_name,
                email: user.rows[0].email,
                role: user.rows[0].role
            }
        });

    } catch (err) {

        console.error("LOGIN ERROR:", err);

        res.status(500).json({
            message: "Server Error"
        });

    }

};


module.exports = {
    registerUser,
    loginUser
};

