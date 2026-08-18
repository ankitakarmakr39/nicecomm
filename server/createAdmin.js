const pool = require("./config/db");

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