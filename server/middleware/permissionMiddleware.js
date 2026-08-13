const pool = require("../config/db");

const requirePermission = (permissionName) => {

    return async (req, res, next) => {

        try {

            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }

            const result = await pool.query(
                `
                SELECT 1
                FROM users u
                JOIN roles r
                    ON u.role_id = r.id
                JOIN role_permissions rp
                    ON rp.role_id = r.id
                JOIN permissions p
                    ON rp.permission_id = p.id
                WHERE u.id = $1
                AND p.name = $2
                LIMIT 1
                `,
                [
                    req.user.id,
                    permissionName
                ]
            );

            if (result.rows.length === 0) {
                return res.status(403).json({
                    message: "Access Denied"
                });
            }

            next();

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Permission Check Failed"
            });

        }

    };

};

module.exports = {
    requirePermission
};