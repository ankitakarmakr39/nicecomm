const pool = require("../config/db");

// Get or Create Active Cart
const getOrCreateCart = async (customerId) => {
    let cartResult = await pool.query(
        `
        SELECT *
        FROM carts
        WHERE customer_id = $1
        AND status = 'Active'
        LIMIT 1
        `,
        [customerId]
    );

    if (cartResult.rows.length > 0) {
        return cartResult.rows[0];
    }

    cartResult = await pool.query(
        `
        INSERT INTO carts (customer_id, status)
        VALUES ($1, 'Active')
        RETURNING *
        `,
        [customerId]
    );

    return cartResult.rows[0];
};


// Get Cart
const getCart = async (req, res) => {
    try {
        const customerId = req.user.id;

        const cart = await getOrCreateCart(customerId);

        const result = await pool.query(
            `
            SELECT
                ci.id,
                ci.product_id,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.category,
                ci.quantity,
                (p.price * ci.quantity) AS subtotal
            FROM cart_items ci
            JOIN products p
                ON ci.product_id = p.id
            WHERE ci.cart_id = $1
            ORDER BY ci.id
            `,
            [cart.id]
        );

        let total = 0;

        result.rows.forEach(item => {
            total += Number(item.subtotal);
        });

        res.json({
            cart: {
                id: cart.id,
                customer_id: cart.customer_id,
                status: cart.status
            },
            items: result.rows,
            total
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to Get Cart"
        });
    }
};


// Add Product to Cart
const addToCart = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Product ID and valid quantity are required"
            });
        }

        const productResult = await pool.query(
            `
            SELECT *
            FROM products
            WHERE id = $1
            AND status = 'Active'
            `,
            [product_id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                message: "Product Not Found or Inactive"
            });
        }

        const product = productResult.rows[0];

        if (product.stock < quantity) {
            return res.status(400).json({
                message: "Insufficient Stock"
            });
        }

        const cart = await getOrCreateCart(customerId);

        const existingItem = await pool.query(
            `
            SELECT *
            FROM cart_items
            WHERE cart_id = $1
            AND product_id = $2
            `,
            [cart.id, product_id]
        );

        if (existingItem.rows.length > 0) {

            const newQuantity =
                existingItem.rows[0].quantity + Number(quantity);

            if (newQuantity > product.stock) {
                return res.status(400).json({
                    message: "Requested quantity exceeds available stock"
                });
            }

            const updated = await pool.query(
                `
                UPDATE cart_items
                SET quantity = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
                `,
                [
                    newQuantity,
                    existingItem.rows[0].id
                ]
            );

            return res.json({
                message: "Cart Updated Successfully",
                item: updated.rows[0]
            });
        }

        const result = await pool.query(
            `
            INSERT INTO cart_items
                (cart_id, product_id, quantity)
            VALUES
                ($1, $2, $3)
            RETURNING *
            `,
            [cart.id, product_id, quantity]
        );

        res.status(201).json({
            message: "Product Added to Cart Successfully",
            item: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to Add Product to Cart"
        });
    }
};


// Update Cart Item
const updateCartItem = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Valid quantity is required"
            });
        }

        const result = await pool.query(
            `
            SELECT
                ci.id,
                ci.cart_id,
                ci.product_id,
                p.stock
            FROM cart_items ci
            JOIN carts c
                ON ci.cart_id = c.id
            JOIN products p
                ON ci.product_id = p.id
            WHERE ci.id = $1
            AND c.customer_id = $2
            AND c.status = 'Active'
            `,
            [id, customerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Cart Item Not Found"
            });
        }

        const item = result.rows[0];

        if (quantity > item.stock) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock"
            });
        }

        const updated = await pool.query(
            `
            UPDATE cart_items
            SET quantity = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
            `,
            [quantity, id]
        );

        res.json({
            message: "Cart Item Updated Successfully",
            item: updated.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to Update Cart Item"
        });
    }
};


// Remove Cart Item
const removeCartItem = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM cart_items ci
            USING carts c
            WHERE ci.cart_id = c.id
            AND ci.id = $1
            AND c.customer_id = $2
            AND c.status = 'Active'
            RETURNING ci.*
            `,
            [id, customerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Cart Item Not Found"
            });
        }

        res.json({
            message: "Cart Item Removed Successfully",
            item: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to Remove Cart Item"
        });
    }
};


// Clear Cart
const clearCart = async (req, res) => {
    try {
        const customerId = req.user.id;

        const cartResult = await pool.query(
            `
            SELECT id
            FROM carts
            WHERE customer_id = $1
            AND status = 'Active'
            `,
            [customerId]
        );

        if (cartResult.rows.length === 0) {
            return res.json({
                message: "Cart Already Empty"
            });
        }

        await pool.query(
            `
            DELETE FROM cart_items
            WHERE cart_id = $1
            `,
            [cartResult.rows[0].id]
        );

        res.json({
            message: "Cart Cleared Successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to Clear Cart"
        });
    }
};


module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};