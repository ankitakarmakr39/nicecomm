const pool = require("./config/db");

async function testLogin() {
    try {
        const result = await pool.query(
            "SELECT id, full_name, email, role FROM users WHERE email = $1",
            ["ankita@gmail.com"]
        );

        console.table(result.rows);

    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

testLogin();