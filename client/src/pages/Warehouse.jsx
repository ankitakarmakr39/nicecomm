import { useEffect, useState } from "react";
import "./Warehouse.css";

const WAREHOUSE_API =
    "http://localhost:5000/api/warehouses";

const PROFILE_API =
    "http://localhost:5000/api/warehouses/";

const ORDERS_API =
    "http://localhost:5000/api/warehouses/orders";

const INVENTORY_API =
    "http://localhost:5000/api/warehouses/inventory";

function Warehouse() {

    // =====================================================
    // DATA
    // =====================================================

    const [warehouse, setWarehouse] = useState(null);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);

    // =====================================================
    // LOADING
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(true);

    // =====================================================
    // ERRORS
    // =====================================================

    const [error, setError] = useState("");
    const [ordersError, setOrdersError] = useState("");
    const [inventoryError, setInventoryError] = useState("");

    // =====================================================
    // ASSIGNMENT MODAL
    // =====================================================

    const [showAssignmentForm, setShowAssignmentForm] =
        useState(false);

    const [creatingAssignment, setCreatingAssignment] =
        useState(false);

    const [assignmentError, setAssignmentError] =
        useState("");

    const [assignmentSuccess, setAssignmentSuccess] =
        useState("");

    const [orderId, setOrderId] = useState("");

    // =====================================================
    // INVENTORY MODAL
    // =====================================================

    const [showInventoryForm, setShowInventoryForm] =
        useState(false);

    const [savingInventory, setSavingInventory] =
        useState(false);

    const [inventoryFormError, setInventoryFormError] =
        useState("");

    const [inventoryFormSuccess, setInventoryFormSuccess] =
        useState("");

    const [inventoryForm, setInventoryForm] = useState({
        product_id: "",
        quantity: "",
        reserved: "0",
    });

    // =====================================================
    // TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =====================================================
    // FETCH WAREHOUSE PROFILE
    // =====================================================

    const fetchWarehouse = async () => {

        try {

            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response = await fetch(
                PROFILE_API,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch warehouse profile."
                );
            }

            setWarehouse(
                data.warehouse || null
            );

        } catch (error) {

            console.error(
                "Fetch Warehouse Error:",
                error
            );

            setError(
                error.message ||
                "Unable to load warehouse profile."
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // FETCH ORDERS
    // =====================================================

    const fetchOrders = async () => {

        try {

            setOrdersLoading(true);
            setOrdersError("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response = await fetch(
                ORDERS_API,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch warehouse orders."
                );
            }

            setOrders(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Fetch Warehouse Orders Error:",
                error
            );

            setOrdersError(
                error.message ||
                "Unable to load warehouse orders."
            );

        } finally {

            setOrdersLoading(false);
        }
    };

    // =====================================================
    // FETCH INVENTORY
    // =====================================================

    const fetchInventory = async () => {

        try {

            setInventoryLoading(true);
            setInventoryError("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response = await fetch(
                INVENTORY_API,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch warehouse inventory."
                );
            }

            setInventory(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Fetch Warehouse Inventory Error:",
                error
            );

            setInventoryError(
                error.message ||
                "Unable to load warehouse inventory."
            );

        } finally {

            setInventoryLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchWarehouse();
        fetchOrders();
        fetchInventory();

    }, []);

    // =====================================================
    // REFRESH
    // =====================================================

    const refreshAll = async () => {

        await Promise.all([
            fetchWarehouse(),
            fetchOrders(),
            fetchInventory(),
        ]);
    };

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalOrders =
        orders.length;

    const assignedOrders =
        orders.filter(
            (order) =>
                order.status === "Assigned"
        ).length;

    const completedOrders =
        orders.filter(
            (order) =>
                order.status === "Completed"
        ).length;

    const totalInventoryItems =
        inventory.length;

    const totalQuantity =
        inventory.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );

    const totalReserved =
        inventory.reduce(
            (total, item) =>
                total +
                Number(item.reserved || 0),
            0
        );

    const totalAvailable =
        inventory.reduce(
            (total, item) =>
                total +
                Number(item.available || 0),
            0
        );

    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "Assigned":
                return "assigned";

            case "Completed":
                return "completed";

            case "In Progress":
                return "progress";

            default:
                return "unknown";
        }
    };

    // =====================================================
    // OPEN ASSIGNMENT FORM
    // =====================================================

    const openAssignmentForm = () => {

        setOrderId("");

        setAssignmentError("");
        setAssignmentSuccess("");

        setShowAssignmentForm(true);
    };

    // =====================================================
    // CLOSE ASSIGNMENT FORM
    // =====================================================

    const closeAssignmentForm = () => {

        if (creatingAssignment) {
            return;
        }

        setShowAssignmentForm(false);

        setOrderId("");

        setAssignmentError("");
        setAssignmentSuccess("");
    };

    // =====================================================
    // CREATE WAREHOUSE ASSIGNMENT
    // =====================================================

    const createAssignment = async (event) => {

        event.preventDefault();

        try {

            setCreatingAssignment(true);

            setAssignmentError("");
            setAssignmentSuccess("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            if (!orderId) {
                throw new Error(
                    "Please enter Order ID."
                );
            }

            const response = await fetch(
                `${WAREHOUSE_API}/orders`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        order_id:
                            Number(orderId),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to create warehouse assignment."
                );
            }

            setAssignmentSuccess(
                "Warehouse order assignment created successfully."
            );

            setOrderId("");

            await fetchOrders();

        } catch (error) {

            console.error(
                "Create Warehouse Assignment Error:",
                error
            );

            setAssignmentError(
                error.message ||
                "Failed to create warehouse assignment."
            );

        } finally {

            setCreatingAssignment(false);
        }
    };

    // =====================================================
    // OPEN INVENTORY FORM
    // =====================================================

    const openInventoryForm = () => {

        setInventoryForm({
            product_id: "",
            quantity: "",
            reserved: "0",
        });

        setInventoryFormError("");
        setInventoryFormSuccess("");

        setShowInventoryForm(true);
    };

    // =====================================================
    // CLOSE INVENTORY FORM
    // =====================================================

    const closeInventoryForm = () => {

        if (savingInventory) {
            return;
        }

        setShowInventoryForm(false);

        setInventoryForm({
            product_id: "",
            quantity: "",
            reserved: "0",
        });

        setInventoryFormError("");
        setInventoryFormSuccess("");
    };

    // =====================================================
    // INVENTORY INPUT
    // =====================================================

    const handleInventoryInput = (event) => {

        const {
            name,
            value
        } = event.target;

        setInventoryForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    };

    // =====================================================
    // SAVE INVENTORY
    // =====================================================

    const saveInventory = async (event) => {

        event.preventDefault();

        try {

            setSavingInventory(true);

            setInventoryFormError("");
            setInventoryFormSuccess("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            if (!inventoryForm.product_id) {
                throw new Error(
                    "Please enter Product ID."
                );
            }

            if (
                inventoryForm.quantity === ""
            ) {
                throw new Error(
                    "Please enter quantity."
                );
            }

            const quantity =
                Number(
                    inventoryForm.quantity
                );

            const reserved =
                Number(
                    inventoryForm.reserved || 0
                );

            if (quantity < 0) {
                throw new Error(
                    "Quantity cannot be negative."
                );
            }

            if (reserved < 0) {
                throw new Error(
                    "Reserved quantity cannot be negative."
                );
            }

            if (reserved > quantity) {
                throw new Error(
                    "Reserved quantity cannot exceed total quantity."
                );
            }

            const response = await fetch(
                INVENTORY_API,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        product_id:
                            Number(
                                inventoryForm.product_id
                            ),

                        quantity,

                        reserved,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to save warehouse inventory."
                );
            }

            setInventoryFormSuccess(
                "Warehouse inventory saved successfully."
            );

            setInventoryForm({
                product_id: "",
                quantity: "",
                reserved: "0",
            });

            await fetchInventory();

        } catch (error) {

            console.error(
                "Save Warehouse Inventory Error:",
                error
            );

            setInventoryFormError(
                error.message ||
                "Failed to save warehouse inventory."
            );

        } finally {

            setSavingInventory(false);
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading &&
        ordersLoading &&
        inventoryLoading
    ) {

        return (
            <section className="warehouse-page">

                <div className="warehouse-page-header">

                    <div className="warehouse-title-area">

                        <span className="warehouse-eyebrow">
                            OPERATIONS
                        </span>

                        <h1>
                            Warehouse
                        </h1>

                        <p>
                            Manage warehouse capacity,
                            assigned orders and inventory
                            operations.
                        </p>

                    </div>

                </div>

                <div className="warehouse-loading">

                    <div className="warehouse-loading-spinner"></div>

                    <span>
                        Loading warehouse operations...
                    </span>

                </div>

            </section>
        );
    }

    // =====================================================
    // MAIN UI
    // =====================================================

    return (
        <section className="warehouse-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="warehouse-page-header">

                <div className="warehouse-title-area">

                    <span className="warehouse-eyebrow">
                        OPERATIONS
                    </span>

                    <h1>
                        Warehouse
                    </h1>

                    <p>
                        Manage warehouse capacity,
                        assigned orders and inventory
                        operations.
                    </p>

                </div>

                <div className="warehouse-header-actions">

                    <button
                        className="warehouse-refresh-button"
                        onClick={refreshAll}
                        disabled={
                            loading ||
                            ordersLoading ||
                            inventoryLoading
                        }
                    >
                        <span className="warehouse-refresh-icon">
                            ↻
                        </span>

                        Refresh
                    </button>

                    <button
                        className="warehouse-create-button"
                        onClick={openAssignmentForm}
                    >
                        + Assign Order
                    </button>

                    <button
                        className="warehouse-inventory-button"
                        onClick={openInventoryForm}
                    >
                        + Inventory
                    </button>

                </div>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="warehouse-stat-grid">

                <div className="warehouse-stat-card">

                    <div className="warehouse-stat-icon blue">
                        🏢
                    </div>

                    <div className="warehouse-stat-content">

                        <span>
                            Warehouse
                        </span>

                        <strong>
                            {warehouse
                                ? warehouse.status || "Active"
                                : "—"}
                        </strong>

                        <small>
                            Current status
                        </small>

                    </div>

                </div>


                <div className="warehouse-stat-card">

                    <div className="warehouse-stat-icon green">
                        📦
                    </div>

                    <div className="warehouse-stat-content">

                        <span>
                            Available Capacity
                        </span>

                        <strong>
                            {warehouse
                                ? Number(
                                    warehouse.available_capacity || 0
                                ).toLocaleString()
                                : 0}
                        </strong>

                        <small>
                            Warehouse capacity available
                        </small>

                    </div>

                </div>


                <div className="warehouse-stat-card">

                    <div className="warehouse-stat-icon orange">
                        🚚
                    </div>

                    <div className="warehouse-stat-content">

                        <span>
                            Assigned Orders
                        </span>

                        <strong>
                            {assignedOrders}
                        </strong>

                        <small>
                            Active warehouse orders
                        </small>

                    </div>

                </div>


                <div className="warehouse-stat-card">

                    <div className="warehouse-stat-icon purple">
                        📊
                    </div>

                    <div className="warehouse-stat-content">

                        <span>
                            Available Stock
                        </span>

                        <strong>
                            {totalAvailable}
                        </strong>

                        <small>
                            Across {totalInventoryItems} products
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================================
                WAREHOUSE PROFILE
            ================================================= */}

            <div className="warehouse-panel">

                <div className="warehouse-panel-header">

                    <div>

                        <span className="warehouse-section-label">
                            WAREHOUSE
                        </span>

                        <h2>
                            Warehouse Profile
                        </h2>

                        <p>
                            Current warehouse information
                            and operational capacity.
                        </p>

                    </div>

                    <div className="warehouse-count-badge">
                        {warehouse?.status || "Unknown"}
                    </div>

                </div>


                {error ? (

                    <div className="warehouse-error">

                        <div className="warehouse-error-icon">
                            !
                        </div>

                        <div>

                            <strong>
                                Unable to load warehouse
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                        <button
                            onClick={fetchWarehouse}
                        >
                            Try Again
                        </button>

                    </div>

                ) : (

                    <div className="warehouse-profile-grid">

                        <div className="warehouse-profile-card">

                            <span>
                                Warehouse Name
                            </span>

                            <strong>
                                {warehouse?.warehouse_name || "—"}
                            </strong>

                        </div>


                        <div className="warehouse-profile-card">

                            <span>
                                Address
                            </span>

                            <strong>
                                {warehouse?.address || "—"}
                            </strong>

                        </div>


                        <div className="warehouse-profile-card">

                            <span>
                                Phone
                            </span>

                            <strong>
                                {warehouse?.phone || "—"}
                            </strong>

                        </div>


                        <div className="warehouse-profile-card">

                            <span>
                                Total Capacity
                            </span>

                            <strong>
                                {Number(
                                    warehouse?.capacity || 0
                                ).toLocaleString()}
                            </strong>

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
                ORDERS SUMMARY
            ================================================= */}

            <div className="warehouse-summary">

                <div className="warehouse-summary-heading">

                    <div>

                        <span className="warehouse-section-label">
                            ORDER OPERATIONS
                        </span>

                        <h2>
                            Warehouse Orders
                        </h2>

                        <p>
                            Orders currently assigned
                            to this warehouse.
                        </p>

                    </div>

                    <div className="warehouse-total">

                        <strong>
                            {totalOrders}
                        </strong>

                        <span>
                            Total Orders
                        </span>

                    </div>

                </div>


                <div className="warehouse-mini-stats">

                    <div className="warehouse-mini-card assigned-card">

                        <span className="mini-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                {assignedOrders}
                            </strong>

                            <span>
                                Assigned
                            </span>

                        </div>

                    </div>


                    <div className="warehouse-mini-card progress-card">

                        <span className="mini-icon">
                            ◷
                        </span>

                        <div>

                            <strong>
                                {
                                    orders.filter(
                                        (order) =>
                                            order.status ===
                                            "In Progress"
                                    ).length
                                }
                            </strong>

                            <span>
                                In Progress
                            </span>

                        </div>

                    </div>


                    <div className="warehouse-mini-card completed-card">

                        <span className="mini-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                {completedOrders}
                            </strong>

                            <span>
                                Completed
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                ORDERS TABLE
            ================================================= */}

            <div className="warehouse-panel warehouse-order-panel">

                <div className="warehouse-panel-header">

                    <div>

                        <span className="warehouse-section-label">
                            ASSIGNED ORDERS
                        </span>

                        <h2>
                            Warehouse Orders
                        </h2>

                        <p>
                            Track orders assigned to
                            the warehouse.
                        </p>

                    </div>

                    <div className="warehouse-header-actions-small">

                        <div className="warehouse-count-badge">
                            {totalOrders} Orders
                        </div>

                        <button
                            className="warehouse-small-button"
                            onClick={openAssignmentForm}
                        >
                            + New
                        </button>

                    </div>

                </div>


                {ordersLoading ? (

                    <div className="warehouse-assignment-loading">

                        <div className="warehouse-loading-spinner"></div>

                        <span>
                            Loading warehouse orders...
                        </span>

                    </div>

                ) : ordersError ? (

                    <div className="warehouse-error">

                        <div className="warehouse-error-icon">
                            !
                        </div>

                        <div>

                            <strong>
                                Unable to load orders
                            </strong>

                            <p>
                                {ordersError}
                            </p>

                        </div>

                        <button
                            onClick={fetchOrders}
                        >
                            Try Again
                        </button>

                    </div>

                ) : orders.length === 0 ? (

                    <div className="warehouse-empty">

                        <div className="warehouse-empty-icon">
                            📦
                        </div>

                        <h3>
                            No warehouse orders
                        </h3>

                        <p>
                            No orders have been assigned
                            to this warehouse yet.
                        </p>

                        <button
                            className="warehouse-empty-button"
                            onClick={openAssignmentForm}
                        >
                            + Assign First Order
                        </button>

                    </div>

                ) : (

                    <div className="warehouse-table-wrapper">

                        <table className="warehouse-table">

                            <thead>

                                <tr>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Assigned
                                    </th>

                                    <th>
                                        Completed
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {orders.map(
                                    (order) => (

                                        <tr
                                            key={
                                                order.id
                                            }
                                        >

                                            <td>

                                                <span className="warehouse-order-number">
                                                    #
                                                    {
                                                        order.order_id
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                <div className="warehouse-customer">

                                                    <div className="warehouse-customer-avatar">

                                                        {
                                                            order.customer_name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ||
                                                            "C"
                                                        }

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                order.customer_name ||
                                                                "Unknown Customer"
                                                            }
                                                        </strong>

                                                        <span>
                                                            Customer ID: {
                                                                order.customer_id ||
                                                                "—"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span
                                                    className={`warehouse-status ${getStatusClass(
                                                        order.status
                                                    )}`}
                                                >

                                                    <span className="warehouse-status-dot"></span>

                                                    {
                                                        order.status ||
                                                        "Unknown"
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <span className="warehouse-date-text">
                                                    {
                                                        formatDate(
                                                            order.assigned_at
                                                        )
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                <span className="warehouse-date-text">
                                                    {
                                                        formatDate(
                                                            order.completed_at
                                                        )
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                INVENTORY SUMMARY
            ================================================= */}

            <div className="warehouse-summary inventory-summary">

                <div className="warehouse-summary-heading">

                    <div>

                        <span className="warehouse-section-label">
                            INVENTORY OPERATIONS
                        </span>

                        <h2>
                            Warehouse Inventory
                        </h2>

                        <p>
                            Monitor stock levels and
                            reserved quantities.
                        </p>

                    </div>

                    <div className="warehouse-total">

                        <strong>
                            {totalInventoryItems}
                        </strong>

                        <span>
                            Products
                        </span>

                    </div>

                </div>


                <div className="warehouse-mini-stats">

                    <div className="warehouse-mini-card inventory-blue-card">

                        <span className="mini-icon">
                            📦
                        </span>

                        <div>

                            <strong>
                                {totalQuantity}
                            </strong>

                            <span>
                                Total Quantity
                            </span>

                        </div>

                    </div>


                    <div className="warehouse-mini-card inventory-orange-card">

                        <span className="mini-icon">
                            ◷
                        </span>

                        <div>

                            <strong>
                                {totalReserved}
                            </strong>

                            <span>
                                Reserved
                            </span>

                        </div>

                    </div>


                    <div className="warehouse-mini-card inventory-green-card">

                        <span className="mini-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                {totalAvailable}
                            </strong>

                            <span>
                                Available
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                INVENTORY TABLE
            ================================================= */}

            <div className="warehouse-panel inventory-panel">

                <div className="warehouse-panel-header">

                    <div>

                        <span className="warehouse-section-label">
                            STOCK
                        </span>

                        <h2>
                            Inventory
                        </h2>

                        <p>
                            Products currently stored
                            in the warehouse.
                        </p>

                    </div>

                    <div className="warehouse-header-actions-small">

                        <div className="warehouse-count-badge">
                            {totalInventoryItems} Products
                        </div>

                        <button
                            className="warehouse-small-button"
                            onClick={openInventoryForm}
                        >
                            + Update
                        </button>

                    </div>

                </div>


                {inventoryLoading ? (

                    <div className="warehouse-assignment-loading">

                        <div className="warehouse-loading-spinner"></div>

                        <span>
                            Loading inventory...
                        </span>

                    </div>

                ) : inventoryError ? (

                    <div className="warehouse-error">

                        <div className="warehouse-error-icon">
                            !
                        </div>

                        <div>

                            <strong>
                                Unable to load inventory
                            </strong>

                            <p>
                                {inventoryError}
                            </p>

                        </div>

                        <button
                            onClick={fetchInventory}
                        >
                            Try Again
                        </button>

                    </div>

                ) : inventory.length === 0 ? (

                    <div className="warehouse-empty">

                        <div className="warehouse-empty-icon">
                            📦
                        </div>

                        <h3>
                            No inventory found
                        </h3>

                        <p>
                            No products have been added
                            to this warehouse yet.
                        </p>

                        <button
                            className="warehouse-empty-button"
                            onClick={openInventoryForm}
                        >
                            + Add Inventory
                        </button>

                    </div>

                ) : (

                    <div className="warehouse-table-wrapper">

                        <table className="warehouse-table inventory-table">

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Product ID
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Reserved
                                    </th>

                                    <th>
                                        Available
                                    </th>

                                    <th>
                                        Updated
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {inventory.map(
                                    (item) => (

                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            <td>

                                                <div className="warehouse-product">

                                                    <div className="warehouse-product-avatar">
                                                        📦
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                item.product_name ||
                                                                "Unknown Product"
                                                            }
                                                        </strong>

                                                        <span>
                                                            Warehouse Stock
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="warehouse-id-badge">
                                                    #{item.product_id}
                                                </span>

                                            </td>


                                            <td>

                                                <strong className="quantity-value">
                                                    {
                                                        item.quantity ??
                                                        0
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                <strong className="reserved-value">
                                                    {
                                                        item.reserved ??
                                                        0
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                <strong className="available-value">
                                                    {
                                                        item.available ??
                                                        0
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                <span className="warehouse-date-text">
                                                    {
                                                        formatDate(
                                                            item.updated_at
                                                        )
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                ASSIGNMENT MODAL
            ================================================= */}

            {showAssignmentForm && (

                <div
                    className="warehouse-modal-overlay"
                    onClick={closeAssignmentForm}
                >

                    <div
                        className="warehouse-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="warehouse-modal-header">

                            <div>

                                <span className="warehouse-section-label">
                                    ORDER OPERATIONS
                                </span>

                                <h2>
                                    Assign Order
                                </h2>

                                <p>
                                    Assign an order to your
                                    active warehouse.
                                </p>

                            </div>

                            <button
                                className="warehouse-modal-close"
                                onClick={closeAssignmentForm}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="warehouse-form"
                            onSubmit={
                                createAssignment
                            }
                        >

                            <div className="warehouse-form-group">

                                <label>
                                    Order ID
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={orderId}
                                    onChange={(event) =>
                                        setOrderId(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Example: 4"
                                />

                            </div>


                            {assignmentError && (

                                <div className="warehouse-form-message error">
                                    {assignmentError}
                                </div>

                            )}


                            {assignmentSuccess && (

                                <div className="warehouse-form-message success">
                                    {assignmentSuccess}
                                </div>

                            )}


                            <div className="warehouse-form-actions">

                                <button
                                    type="button"
                                    className="warehouse-cancel-button"
                                    onClick={
                                        closeAssignmentForm
                                    }
                                    disabled={
                                        creatingAssignment
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="warehouse-submit-button"
                                    disabled={
                                        creatingAssignment
                                    }
                                >
                                    {
                                        creatingAssignment
                                            ? "Assigning..."
                                            : "Assign Order"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                INVENTORY MODAL
            ================================================= */}

            {showInventoryForm && (

                <div
                    className="warehouse-modal-overlay"
                    onClick={closeInventoryForm}
                >

                    <div
                        className="warehouse-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="warehouse-modal-header">

                            <div>

                                <span className="warehouse-section-label">
                                    INVENTORY OPERATIONS
                                </span>

                                <h2>
                                    Update Inventory
                                </h2>

                                <p>
                                    Add or update product
                                    stock in the warehouse.
                                </p>

                            </div>

                            <button
                                className="warehouse-modal-close"
                                onClick={closeInventoryForm}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="warehouse-form"
                            onSubmit={
                                saveInventory
                            }
                        >

                            <div className="warehouse-form-group">

                                <label>
                                    Product ID
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    name="product_id"
                                    value={
                                        inventoryForm.product_id
                                    }
                                    onChange={
                                        handleInventoryInput
                                    }
                                    placeholder="Example: 3"
                                />

                            </div>


                            <div className="warehouse-form-group">

                                <label>
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    value={
                                        inventoryForm.quantity
                                    }
                                    onChange={
                                        handleInventoryInput
                                    }
                                    placeholder="Example: 10"
                                />

                            </div>


                            <div className="warehouse-form-group">

                                <label>
                                    Reserved Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="reserved"
                                    value={
                                        inventoryForm.reserved
                                    }
                                    onChange={
                                        handleInventoryInput
                                    }
                                    placeholder="Example: 2"
                                />

                            </div>


                            <div className="warehouse-form-hint">
                                Available stock will be calculated
                                automatically as Quantity − Reserved.
                            </div>


                            {inventoryFormError && (

                                <div className="warehouse-form-message error">
                                    {inventoryFormError}
                                </div>

                            )}


                            {inventoryFormSuccess && (

                                <div className="warehouse-form-message success">
                                    {inventoryFormSuccess}
                                </div>

                            )}


                            <div className="warehouse-form-actions">

                                <button
                                    type="button"
                                    className="warehouse-cancel-button"
                                    onClick={
                                        closeInventoryForm
                                    }
                                    disabled={
                                        savingInventory
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="warehouse-submit-button"
                                    disabled={
                                        savingInventory
                                    }
                                >
                                    {
                                        savingInventory
                                            ? "Saving..."
                                            : "Save Inventory"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </section>
    );
}

export default Warehouse;