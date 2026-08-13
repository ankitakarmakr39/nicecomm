const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require("../controllers/cartController");


// Get My Cart
router.get(
    "/",
    verifyToken,
    getCart
);


// Add Product to Cart
router.post(
    "/items",
    verifyToken,
    addToCart
);


// Update Cart Item
router.put(
    "/items/:id",
    verifyToken,
    updateCartItem
);


// Remove Cart Item
router.delete(
    "/items/:id",
    verifyToken,
    removeCartItem
);


// Clear Cart
router.delete(
    "/",
    verifyToken,
    clearCart
);


module.exports = router;