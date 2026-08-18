const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function resetAdminPassword() {
    try {
        const hashedPassword = await bcrypt.hash("123456", 10);

        const result = await pool.query(
            `UPDATE users
             SET password = $1,
                 status = 'Active',
                 updated_at = CURRENT_TIMESTAMP
             WHERE email = $2
             RETURNING id, full_name, email, role, status`,
            [hashedPassword, "ankita@gmail.com"]
        );

        console.table(result.rows);

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);

    } finally {
        await pool.end();
    }
}

resetAdminPassword();