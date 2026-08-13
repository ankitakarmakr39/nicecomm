const pool = require("../config/db");

// Get All Orders
const getOrders = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                o.id,
                o.customer_id,
                u.full_name AS customer_name,
                u.email AS customer_email,
                o.total_amount,
                o.status,
                o.shipping_address,
                o.shipping_city,
                o.shipping_state,
                o.shipping_country,
                o.created_at,
                o.updated_at
            FROM orders o
            JOIN users u
                ON o.customer_id = u.id
            ORDER BY o.id DESC;
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Fetch Orders"
        });

    }

};


// Create Order
const createOrder = async (req, res) => {

    const client = await pool.connect();

    try {

        const customerId = req.user.id;

        const {
            items,
            shipping_address,
            shipping_city,
            shipping_state,
            shipping_country
        } = req.body;

        // Basic validation
        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Order must contain at least one product"
            });
        }

        await client.query("BEGIN");

        let totalAmount = 0;

        const orderItems = [];

        // Check products and calculate total
        for (const item of items) {

            const {
                product_id,
                quantity
            } = item;

            const productResult = await client.query(
                `
                SELECT
                    id,
                    price,
                    stock,
                    status
                FROM products
                WHERE id = $1
                `,
                [product_id]
            );

            if (productResult.rows.length === 0) {

                await client.query("ROLLBACK");

                return res.status(404).json({
                    message: `Product ${product_id} Not Found`
                });

            }

            const product = productResult.rows[0];

            if (product.status !== "Active") {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: `Product ${product_id} is not Active`
                });

            }

            if (quantity <= 0) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: "Quantity must be greater than 0"
                });

            }

            if (product.stock < quantity) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: `Insufficient stock for Product ${product_id}`
                });

            }

            const unitPrice = Number(product.price);
            const subtotal = unitPrice * quantity;

            totalAmount += subtotal;

            orderItems.push({
                product_id,
                quantity,
                unit_price: unitPrice,
                subtotal
            });
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
            ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `,
            [
                customerId,
                totalAmount,
                "Pending",
                shipping_address,
                shipping_city,
                shipping_state,
                shipping_country
            ]
        );

        const order = orderResult.rows[0];

        // Create Order Items + Reduce Stock
        for (const item of orderItems) {

            await client.query(
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
                ($1,$2,$3,$4,$5)
                `,
                [
                    order.id,
                    item.product_id,
                    item.quantity,
                    item.unit_price,
                    item.subtotal
                ]
            );

            await client.query(
                `
                UPDATE products
                SET
                    stock = stock - $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                `,
                [
                    item.quantity,
                    item.product_id
                ]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "Order Created Successfully",
            order: order,
            items: orderItems
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            message: "Failed to Create Order"
        });

    } finally {

        client.release();

    }

};


module.exports = {
    getOrders,
    createOrder
};