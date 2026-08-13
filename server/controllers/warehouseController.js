const pool = require("../config/db");



// Get My Warehouse Profile
const getWarehouse = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM warehouses
            WHERE participant_id = $1
            LIMIT 1
            `,
            [participantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Warehouse Profile Not Found"
            });
        }

        res.json({
            warehouse: result.rows[0]
        });

    } catch (error) {
        console.error("Get Warehouse Error:", error);

        res.status(500).json({
            message: "Failed to Get Warehouse"
        });
    }
};


// Create Warehouse Profile
const createWarehouse = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            warehouse_name,
            address,
            phone,
            capacity,
            available_capacity
        } = req.body;

        if (!warehouse_name) {
            return res.status(400).json({
                message: "Warehouse name is required"
            });
        }

        const existing = await pool.query(
            `
            SELECT id
            FROM warehouses
            WHERE participant_id = $1
            `,
            [participantId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: "Warehouse Profile Already Exists"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO warehouses
            (
                participant_id,
                warehouse_name,
                address,
                phone,
                capacity,
                available_capacity
            )
            VALUES
            ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                participantId,
                warehouse_name,
                address || null,
                phone || null,
                capacity || 0,
                available_capacity || 0
            ]
        );

        res.status(201).json({
            message: "Warehouse Profile Created Successfully",
            warehouse: result.rows[0]
        });

    } catch (error) {
        console.error("Create Warehouse Error:", error);

        res.status(500).json({
            message: "Failed to Create Warehouse"
        });
    }
};


// Update Warehouse Profile
const updateWarehouse = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            warehouse_name,
            address,
            phone,
            capacity,
            available_capacity,
            status
        } = req.body;

        const result = await pool.query(
            `
            UPDATE warehouses
            SET
                warehouse_name = COALESCE($1, warehouse_name),
                address = COALESCE($2, address),
                phone = COALESCE($3, phone),
                capacity = COALESCE($4, capacity),
                available_capacity = COALESCE($5, available_capacity),
                status = COALESCE($6, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE participant_id = $7
            RETURNING *
            `,
            [
                warehouse_name,
                address,
                phone,
                capacity,
                available_capacity,
                status,
                participantId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Warehouse Profile Not Found"
            });
        }

        res.json({
            message: "Warehouse Profile Updated Successfully",
            warehouse: result.rows[0]
        });

    } catch (error) {
        console.error("Update Warehouse Error:", error);

        res.status(500).json({
            message: "Failed to Update Warehouse"
        });
    }
};


const createWarehouseAssignment = async (req, res) => {
    try {
        const participantId = req.user.id;

        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({
                message: "Order ID is required"
            });
        }

        // Find active warehouse of logged-in participant
        const warehouseResult = await pool.query(
            `
            SELECT id
            FROM warehouses
            WHERE participant_id = $1
            AND status = 'Active'
            LIMIT 1
            `,
            [participantId]
        );

        if (warehouseResult.rows.length === 0) {
            return res.status(404).json({
                message: "Warehouse Profile Not Found"
            });
        }

        const warehouseId = warehouseResult.rows[0].id;

        // Check order
        const orderResult = await pool.query(
            `
            SELECT id
            FROM orders
            WHERE id = $1
            `,
            [order_id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                message: "Order Not Found"
            });
        }

        // Check existing assignment
        const existingAssignment = await pool.query(
            `
            SELECT id
            FROM warehouse_assignments
            WHERE warehouse_id = $1
            AND order_id = $2
            `,
            [warehouseId, order_id]
        );

        if (existingAssignment.rows.length > 0) {
            return res.status(400).json({
                message: "Order Already Assigned to this Warehouse"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO warehouse_assignments
            (
                warehouse_id,
                order_id,
                status
            )
            VALUES
            ($1, $2, 'Assigned')
            RETURNING *
            `,
            [warehouseId, order_id]
        );

        res.status(201).json({
            message: "Warehouse Order Assignment Created Successfully",
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error("Create Warehouse Assignment Error:", error);

        res.status(500).json({
            message: "Failed to Create Warehouse Order Assignment"
        });
    }
};


// Get Assigned Orders
const getWarehouseOrders = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                wa.id,
                wa.order_id,
                o.customer_id,
                customer_user.full_name AS customer_name,
                wa.status,
                wa.assigned_at,
                wa.completed_at
            FROM warehouse_assignments AS wa

            JOIN warehouses AS warehouse
                ON wa.warehouse_id = warehouse.id

            JOIN orders AS o
                ON wa.order_id = o.id

            JOIN users AS customer_user
                ON o.customer_id = customer_user.id

            WHERE warehouse.participant_id = $1

            ORDER BY wa.assigned_at DESC
            `,
            [participantId]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Get Warehouse Orders Error:", error);

        res.status(500).json({
            message: "Failed to Get Warehouse Orders",
            error: error.message
        });
    }
};

const addWarehouseInventory = async (req, res) => {
    try {
        const participantId = req.user.id;

        const {
            product_id,
            quantity,
            reserved = 0
        } = req.body;

        if (!product_id || quantity === undefined) {
            return res.status(400).json({
                message: "Product ID and quantity are required"
            });
        }

        // Find warehouse
        const warehouseResult = await pool.query(
            `
            SELECT id
            FROM warehouses
            WHERE participant_id = $1
            AND status = 'Active'
            LIMIT 1
            `,
            [participantId]
        );

        if (warehouseResult.rows.length === 0) {
            return res.status(404).json({
                message: "Warehouse Profile Not Found"
            });
        }

        const warehouseId = warehouseResult.rows[0].id;

        // Check product
        const productResult = await pool.query(
            `
            SELECT id, name
            FROM products
            WHERE id = $1
            `,
            [product_id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                message: "Product Not Found"
            });
        }

        const available = Number(quantity) - Number(reserved);

        if (available < 0) {
            return res.status(400).json({
                message: "Reserved quantity cannot exceed total quantity"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO warehouse_inventory
            (
                warehouse_id,
                product_id,
                quantity,
                reserved,
                available
            )
            VALUES
            ($1, $2, $3, $4, $5)
            ON CONFLICT (warehouse_id, product_id)
            DO UPDATE SET
                quantity = EXCLUDED.quantity,
                reserved = EXCLUDED.reserved,
                available = EXCLUDED.available,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
            `,
            [
                warehouseId,
                product_id,
                quantity,
                reserved,
                available
            ]
        );

        res.status(201).json({
            message: "Warehouse Inventory Saved Successfully",
            inventory: result.rows[0]
        });

    } catch (error) {
        console.error("Add Warehouse Inventory Error:", error);

        res.status(500).json({
            message: "Failed to Save Warehouse Inventory"
        });
    }
};

// Get Warehouse Inventory
const getWarehouseInventory = async (req, res) => {
    try {
        const participantId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                wi.id,
                wi.product_id,
                p.name AS product_name,
                wi.quantity,
                wi.reserved,
                wi.available,
                wi.created_at,
                wi.updated_at
            FROM warehouse_inventory wi
            JOIN warehouses w
                ON wi.warehouse_id = w.id
            JOIN products p
                ON wi.product_id = p.id
            WHERE w.participant_id = $1
            ORDER BY wi.id DESC
            `,
            [participantId]
        );

        res.json(result.rows);

    } catch (error) {
    console.error("Get Warehouse Orders Error:", error);

    res.status(500).json({
        message: "Failed to Get Warehouse Orders"
    });
}
};


module.exports = {
    getWarehouse,
    createWarehouse,
    updateWarehouse,
    getWarehouseOrders,
    getWarehouseInventory,
    addWarehouseInventory,
    createWarehouseAssignment
};