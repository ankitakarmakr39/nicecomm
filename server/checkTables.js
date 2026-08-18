const pool = require("./config/db");

async function checkData() {
    try {
        const participantTypes = await pool.query(`
            SELECT id, name, description
            FROM participant_types
            ORDER BY id;
        `);

        const participants = await pool.query(`
            SELECT
                p.id,
                p.user_id,
                p.participant_type_id,
                pt.name AS participant_type,
                p.company_name,
                p.status
            FROM participants p
            LEFT JOIN participant_types pt
                ON p.participant_type_id = pt.id
            ORDER BY p.id;
        `);

        const orderAssignments = await pool.query(`
            SELECT
                oa.id,
                oa.order_id,
                oa.participant_id,
                oa.participant_role,
                oa.status,
                oa.assigned_at,
                oa.completed_at
            FROM order_assignments oa
            ORDER BY oa.id;
        `);

        console.log("\n===== PARTICIPANT TYPES =====");
        console.table(participantTypes.rows);

        console.log("\n===== PARTICIPANTS =====");
        console.table(participants.rows);

        console.log("\n===== ORDER ASSIGNMENTS =====");
        console.table(orderAssignments.rows);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await pool.end();
    }
}



checkData();



async function checkUsersColumns() {
    try {
        const result = await pool.query(`
            SELECT
                column_name,
                data_type
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);

        console.log("===== USERS TABLE COLUMNS =====");
        console.table(result.rows);

    } catch (error) {
        console.error("ERROR:", error);
    }
}

checkUsersColumns();

