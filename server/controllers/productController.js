const pool = require("../config/db");

// Get All Products
// Get Products
const getProducts = async (req, res) => {

    try {

        const userId = req.user.id;
        const userRole = req.user.role;


        // Admin can see all products
        if (userRole === "admin") {

            const result = await pool.query(`
                SELECT
                    p.id,
                    p.seller_id,
                    u.full_name AS seller_name,
                    p.name,
                    p.description,
                    p.price,
                    p.stock,
                    p.category,
                    p.status,
                    p.created_at,
                    p.updated_at
                FROM products p
                JOIN users u
                    ON p.seller_id = u.id
                ORDER BY p.id;
            `);

            return res.json(result.rows);
        }


        // Participant/Seller can see own products
        const result = await pool.query(
            `
            SELECT
                p.id,
                p.seller_id,
                u.full_name AS seller_name,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.category,
                p.status,
                p.created_at,
                p.updated_at

            FROM products p

            JOIN users u
                ON p.seller_id = u.id

            JOIN participants part
                ON part.user_id = p.seller_id

            JOIN participant_types pt
                ON pt.id = part.participant_type_id

            WHERE p.seller_id = $1
            AND pt.name = 'Seller'

            ORDER BY p.id;
            `,
            [userId]
        );


        res.json(result.rows);


    } catch (error) {

        console.error("Get Products Error:", error);

        res.status(500).json({
            message: "Failed to Fetch Products"
        });

    }

};


// Create Product
const createProduct = async (req, res) => {

    try {

        const sellerId = req.user.id;

        const {
            name,
            description,
            price,
            stock,
            category
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO products
            (
                seller_id,
                name,
                description,
                price,
                stock,
                category,
                status
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `,
            [
                sellerId,
                name,
                description,
                price,
                stock,
                category,
                "Active"
            ]
        );

        res.status(201).json({
            message: "Product Created Successfully",
            product: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Create Product"
        });

    }

};

// Update My Product
const updateProduct = async (req, res) => {

    try {

        const productId = req.params.id;
        const sellerId = req.user.id;

        const {
            name,
            description,
            price,
            stock,
            category,
            status
        } = req.body;

        const result = await pool.query(
            `
            UPDATE products
            SET
                name = $1,
                description = $2,
                price = $3,
                stock = $4,
                category = $5,
                status = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            AND seller_id = $8
            RETURNING *
            `,
            [
                name,
                description,
                price,
                stock,
                category,
                status,
                productId,
                sellerId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product Not Found or Access Denied"
            });
        }

        res.json({
            message: "Product Updated Successfully",
            product: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Update Product"
        });

    }

};


// Delete My Product
const deleteProduct = async (req, res) => {

    try {

        const productId = req.params.id;
        const sellerId = req.user.id;

        const result = await pool.query(
            `
            DELETE FROM products
            WHERE id = $1
            AND seller_id = $2
            RETURNING *
            `,
            [
                productId,
                sellerId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product Not Found or Access Denied"
            });
        }

        res.json({
            message: "Product Deleted Successfully",
            product: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to Delete Product"
        });

    }

};


module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};