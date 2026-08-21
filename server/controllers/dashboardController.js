
const pool = require("../config/db");

// =========================
// Dashboard Statistics
// =========================
const getDashboardStats = async (req, res) => {
    try {
        // Total Users
        const usersResult = await pool.query(
            "SELECT COUNT(*) AS total FROM users"
        );

        // Total Products
        const productsResult = await pool.query(
            "SELECT COUNT(*) AS total FROM products"
        );

        // Total Orders
        const ordersResult = await pool.query(
            "SELECT COUNT(*) AS total FROM orders"
        );

        // Total Assignments
        const assignmentsResult = await pool.query(
            "SELECT COUNT(*) AS total FROM order_assignments"
        );

        res.json({
            totalUsers: Number(usersResult.rows[0].total),
            totalProducts: Number(productsResult.rows[0].total),
            totalOrders: Number(ordersResult.rows[0].total),
            totalAssignments: Number(
                assignmentsResult.rows[0].total
            ),
        });

    } catch (error) {
        console.error(
            "Dashboard Stats Error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
};

// =========================
// EXPORT
// =========================
module.exports = {
    getDashboardStats
};

