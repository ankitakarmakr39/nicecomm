const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");

const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");


// Get All Products
router.get(
    "/",
    verifyToken,
    requirePermission("products.view"),
    getProducts
);


// Create Product
router.post(
    "/",
    verifyToken,
    requirePermission("products.create"),
    createProduct
);


// Update My Product
router.put(
    "/:id",
    verifyToken,
    requirePermission("products.update"),
    updateProduct
);


// Delete My Product
router.delete(
    "/:id",
    verifyToken,
    requirePermission("products.delete"),
    deleteProduct
);


module.exports = router;