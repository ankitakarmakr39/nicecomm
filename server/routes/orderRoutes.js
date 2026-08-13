const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

const {
    getOrders,
    createOrder
} = require("../controllers/orderController");


const {
    createAssignment,
    getAssignments,
    updateAssignment
} = require("../controllers/orderAssignmentController");


// Get Orders
router.get(
    "/",
    verifyToken,
    requirePermission("orders.view"),
    getOrders
);


// Create Order
router.post(
    "/",
    verifyToken,
    requirePermission("orders.create"),
    createOrder
);


// Create Order Assignment
router.post(
    "/:orderId/assignments",
    verifyToken,
    requirePermission("assignments.create"),
    createAssignment
);


// Get Order Assignments
router.get(
    "/:orderId/assignments",
    verifyToken,
    requirePermission("assignments.view"),
    getAssignments
);

// Update Order Assignment
router.put(
    "/:orderId/assignments/:assignmentId",
    verifyToken,
    requirePermission("assignments.update"),
    updateAssignment
);


module.exports = router;