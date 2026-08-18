const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function activateRahul() {
    try {
        const hashedPassword = await bcrypt.hash("123456", 10);

        const result = await pool.query(
            `UPDATE users
             SET status = 'Active',
                 password = $1,
                 role = 'participant',
                 updated_at = CURRENT_TIMESTAMP
             WHERE email = $2
             RETURNING id, full_name, email, role, status`,
            [hashedPassword, "rahul@gmail.com"]
        );

        console.table(result.rows);

    } catch (error) {
        console.error("ACTIVATE RAHUL ERROR:", error);

    } finally {
        await pool.end();
    }
}

activateRahul();