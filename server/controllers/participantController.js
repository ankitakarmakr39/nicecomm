const pool = require("../config/db");

// Get All Participants
const getParticipants = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                p.id,
                p.participant_type_id,
                u.full_name,
                u.email,
                pt.name AS participant_type,
                p.company_name,
                p.phone,
                p.city,
                p.state,
                p.country,
                p.status
            FROM participants p
            JOIN users u
                ON p.user_id = u.id
            JOIN participant_types pt
                ON p.participant_type_id = pt.id
            ORDER BY p.id;
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Fetch Participants"
        });

    }

};


// Create Participant
const createParticipant = async (req, res) => {

    try {

        const {
            user_id,
            participant_type_id,
            company_name,
            contact_person,
            phone,
            address,
            city,
            state,
            country
        } = req.body;

        const result = await pool.query(
            `INSERT INTO participants
            (
                user_id,
                participant_type_id,
                company_name,
                contact_person,
                phone,
                address,
                city,
                state,
                country,
                status
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *`,
            [
                user_id,
                participant_type_id,
                company_name,
                contact_person,
                phone,
                address,
                city,
                state,
                country,
                "Active"
            ]
        );

        res.status(201).json({
            message: "Participant Created Successfully",
            participant: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Create Participant"
        });

    }

};


// Update Participant
const updateParticipant = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            company_name,
            contact_person,
            phone,
            address,
            city,
            state,
            country,
            status
        } = req.body;

        const result = await pool.query(
            `UPDATE participants
             SET
                company_name = $1,
                contact_person = $2,
                phone = $3,
                address = $4,
                city = $5,
                state = $6,
                country = $7,
                status = $8
             WHERE id = $9
             RETURNING *`,
            [
                company_name,
                contact_person,
                phone,
                address,
                city,
                state,
                country,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Participant Not Found"
            });
        }

        res.json({
            message: "Participant Updated Successfully",
            participant: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Update Participant"
        });

    }

};

// Delete Participant
const deleteParticipant = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM participants
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Participant Not Found"
            });
        }

        res.json({
            message: "Participant Deleted Successfully",
            participant: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Delete Participant"
        });

    }

};

// Get My Participant Profile
const getMyParticipantProfile = async (req, res) => {

    try {

        // JWT থেকে user id
        const userId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                p.id,
                p.user_id,
                u.full_name,
                u.email,
                u.role,
                pt.name AS participant_type,
                p.company_name,
                p.contact_person,
                p.phone,
                p.address,
                p.city,
                p.state,
                p.country,
                p.status,
                p.created_at
            FROM participants p
            JOIN users u
                ON p.user_id = u.id
            JOIN participant_types pt
                ON p.participant_type_id = pt.id
            WHERE p.user_id = $1
            `,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Participant Profile Not Found"
            });
        }

        res.json({
            message: "Participant Profile Found",
            participant: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Fetch Participant Profile"
        });

    }

};

// Update My Participant Profile
const updateMyParticipantProfile = async (req, res) => {

    try {

        // JWT থেকে logged-in user-এর ID
        const userId = req.user.id;

        const {
            company_name,
            contact_person,
            phone,
            address,
            city,
            state,
            country
        } = req.body;

        const result = await pool.query(
            `
            UPDATE participants
            SET
                company_name = $1,
                contact_person = $2,
                phone = $3,
                address = $4,
                city = $5,
                state = $6,
                country = $7
            WHERE user_id = $8
            RETURNING *
            `,
            [
                company_name,
                contact_person,
                phone,
                address,
                city,
                state,
                country,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Participant Profile Not Found"
            });
        }

        res.json({
            message: "Participant Profile Updated Successfully",
            participant: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Update Participant Profile"
        });

    }

};


module.exports = {
    getParticipants,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    getMyParticipantProfile,
    updateMyParticipantProfile
};