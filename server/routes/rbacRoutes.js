const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

// Test Permission
router.get(
    "/test-products",
    verifyToken,
    requirePermission("products.view"),
    (req, res) => {

        res.json({
            message: "Permission Granted",
            user_id: req.user.id
        });

    }
);

module.exports = router;