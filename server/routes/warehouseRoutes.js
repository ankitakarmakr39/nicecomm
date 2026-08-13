const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
    getWarehouse,
    createWarehouse,
    updateWarehouse,
    getWarehouseOrders,
    getWarehouseInventory,
    addWarehouseInventory,
    createWarehouseAssignment
} = require("../controllers/warehouseController");


// Get My Warehouse Profile
router.get(
    "/",
    verifyToken,
    getWarehouse
);


// Create Warehouse Profile
router.post(
    "/",
    verifyToken,
    createWarehouse
);


// Update Warehouse Profile
router.put(
    "/",
    verifyToken,
    updateWarehouse
);


// Get Assigned Orders
router.get(
    "/orders",
    verifyToken,
    getWarehouseOrders
);


// Get Inventory
router.get(
    "/inventory",
    verifyToken,
    getWarehouseInventory
);

// Add / Update Inventory
router.post(
    "/inventory",
    verifyToken,
    addWarehouseInventory
);

// Create Warehouse Order Assignment
router.post(
    "/orders",
    verifyToken,
    createWarehouseAssignment
);


module.exports = router;