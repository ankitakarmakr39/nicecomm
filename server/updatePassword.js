const pool = require("./config/db");

async function updatePassword() {
    try {
        const result = await pool.query(
            "UPDATE users SET password = $1 WHERE email = $2 RETURNING id, full_name, email, role",
            [
                "$2b$10$zX6aXMbU5uQhzgpf8Yo1duYUThfMP2DCQDXNt8GtB2YfrfPurS.Aa",
                "ankita@gmail.com"
            ]
        );

        console.table(result.rows);

    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

updatePassword();const pool = require("./config/db");

async function createAdmin() {
    try {
        const result = await pool.query(
            `INSERT INTO users
            (full_name, email, password, role, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, full_name, email, role, status`,
            [
                "Ankita Karmakar",
                "ankita@gmail.com",
                "123456",
                "admin",
                "Active"
            ]
        );

        console.table(result.rows);

    } catch (error) {
        console.error("CREATE ADMIN ERROR:", error);
    } finally {
        await pool.end();
    }
}

createAdmin();