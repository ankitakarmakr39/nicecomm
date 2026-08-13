const pool = require("../config/db");

const checkout = async (req, res) => {
    const client = await pool.connect();

    try {
        const customerId = req.user.id;

        const {
            shipping_address,
            shipping_city,
            shipping_state,
            shipping_country
        } = req.body;

        if (
            !shipping_address ||
            !shipping_city ||
            !shipping_state ||
            !shipping_country
        ) {
            return res.status(400).json({
                message: "Complete shipping information is required"
            });
        }

        await client.query("BEGIN");

        // Get Active Cart
        const cartResult = await client.query(
            `
            SELECT *
            FROM carts
            WHERE customer_id = $1
            AND status = 'Active'
            LIMIT 1
            `,
            [customerId]
        );

        if (cartResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Active Cart Not Found"
            });
        }

        const cart = cartResult.rows[0];

        // Get Cart Items + Lock Products
        const itemsResult = await client.query(
            `
            SELECT
                ci.id AS cart_item_id,
                ci.product_id,
                ci.quantity,
                p.name,
                p.price,
                p.stock,
                p.seller_id,
                p.status
            FROM cart_items ci
            JOIN products p
                ON ci.product_id = p.id
            WHERE ci.cart_id = $1
            FOR UPDATE OF p
            `,
            [cart.id]
        );

        if (itemsResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Cart is Empty"
            });
        }

        // Validate stock and calculate total
        let totalAmount = 0;

        for (const item of itemsResult.rows) {

            if (item.status !== "Active") {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: `Product ${item.name} is not active`
                });
            }

            if (item.stock < item.quantity) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: `Insufficient stock for ${item.name}`
                });
            }

            totalAmount +=
                Number(item.price) * Number(item.quantity);
        }

        // Create Order
        const orderResult = await client.query(
            `
            INSERT INTO orders
            (
                customer_id,
                total_amount,
                status,
                shipping_address,
                shipping_city,
                shipping_state,
                shipping_country
            )
            VALUES
            ($1, $2, 'Pending', $3, $4, $5, $6)
            RETURNING *
            `,
            [
                customerId,
                totalAmount,
                shipping_address,
                shipping_city,
                shipping_state,
                shipping_country
            ]
        );

        const order = orderResult.rows[0];

        const orderItems = [];

        // Create Order Items + Reduce Stock
        for (const item of itemsResult.rows) {

            const subtotal =
                Number(item.price) * Number(item.quantity);

            const orderItemResult = await client.query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    unit_price,
                    subtotal
                )
                VALUES
                ($1, $2, $3, $4, $5)
                RETURNING *
                `,
                [
                    order.id,
                    item.product_id,
                    item.quantity,
                    item.price,
                    subtotal
                ]
            );

            orderItems.push(orderItemResult.rows[0]);

            await client.query(
                `
                UPDATE products
                SET stock = stock - $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                `,
                [
                    item.quantity,
                    item.product_id
                ]
            );
        }

        // Clear Cart
        await client.query(
            `
            DELETE FROM cart_items
            WHERE cart_id = $1
            `,
            [cart.id]
        );

        // Keep cart active for future purchases
        await client.query(
            `
            UPDATE carts
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            `,
            [cart.id]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Checkout Successful",
            order,
            items: orderItems
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Checkout Error:", error);

        res.status(500).json({
            message: "Checkout Failed"
        });

    } finally {
        client.release();
    }
};

module.exports = {
    checkout
};