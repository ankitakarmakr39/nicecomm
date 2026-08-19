import { useEffect, useMemo, useState } from "react";
import "./Orders.css";

const API_URL = "http://localhost:5000/api/orders";
const PARTICIPANTS_API_URL = "http://localhost:5000/api/participants";

function Orders() {
    // =====================================================
    // STATE
    // =====================================================

    const [orders, setOrders] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [assignmentLoading, setAssignmentLoading] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [selectedParticipant, setSelectedParticipant] = useState("");
    const [selectedParticipantType, setSelectedParticipantType] =
        useState("");

    // =====================================================
    // TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =====================================================
    // FETCH ORDERS
    // =====================================================

    const fetchOrders = async () => {
        const token = getToken();

        if (!token) {
            setError("Authentication token not found.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch orders."
                );
            }

            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch Orders Error:", err);

            setError(
                err.message || "Unable to load orders."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FETCH PARTICIPANTS
    // =====================================================

    const fetchParticipants = async () => {
        const token = getToken();

        if (!token) {
            return;
        }

        try {
            const response = await fetch(
                PARTICIPANTS_API_URL,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch participants."
                );
            }

            setParticipants(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Fetch Participants Error:",
                err
            );
        }
    };

    // =====================================================
    // FETCH ASSIGNMENTS
    // =====================================================

    const fetchAssignments = async (orderId) => {
        const token = getToken();

        if (!token || !orderId) {
            return;
        }

        try {
            setAssignmentLoading(true);

            const response = await fetch(
                `${API_URL}/${orderId}/assignments`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch assignments."
                );
            }

            setAssignments(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Fetch Assignments Error:",
                err
            );

            setAssignments([]);
        } finally {
            setAssignmentLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchOrders();
        fetchParticipants();
    }, []);

    // =====================================================
    // FILTER ORDERS
    // =====================================================

    const filteredOrders = useMemo(() => {
        const searchText =
            search.toLowerCase().trim();

        return orders.filter((order) => {
            const matchesSearch =
                String(order.id || "")
                    .toLowerCase()
                    .includes(searchText) ||

                (order.customer_name || "")
                    .toLowerCase()
                    .includes(searchText) ||

                (order.customer_email || "")
                    .toLowerCase()
                    .includes(searchText) ||

                (order.shipping_city || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "all" ||
                order.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        orders,
        search,
        statusFilter,
    ]);

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order) =>
            order.status === "Pending"
    ).length;

    const completedOrders = orders.filter(
        (order) =>
            order.status === "Completed"
    ).length;

    const activeOrders = orders.filter(
        (order) =>
            order.status !== "Completed" &&
            order.status !== "Cancelled"
    ).length;

    // =====================================================
    // OPEN ORDER DETAILS
    // =====================================================

    const handleViewOrder = async (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);

        setAssignments([]);
        setSelectedParticipant("");
        setSelectedParticipantType("");

        await Promise.all([
            fetchAssignments(order.id),
            fetchParticipants(),
        ]);
    };

    // =====================================================
    // PARTICIPANT CHANGE
    // =====================================================

    const handleParticipantChange = (event) => {
        const participantId =
            event.target.value;

        setSelectedParticipant(
            participantId
        );

        // Reset participant type whenever
        // participant changes.
        setSelectedParticipantType("");
    };

    // =====================================================
    // CREATE ASSIGNMENT
    // =====================================================

    const handleCreateAssignment = async () => {
        const token = getToken();

        if (!token) {
            alert(
                "Authentication token not found."
            );
            return;
        }

        if (!selectedOrder) {
            alert("Order not selected.");
            return;
        }

        if (!selectedParticipant) {
            alert(
                "Please select a participant."
            );
            return;
        }

        if (!selectedParticipantType) {
            alert(
                "Please select participant type."
            );
            return;
        }

        try {
            setAssignmentLoading(true);

            const response = await fetch(
                `${API_URL}/${selectedOrder.id}/assignments`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        participant_id:
                            Number(
                                selectedParticipant
                            ),

                        participant_role:
                            Number(
                                selectedParticipantType
                            ),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to create assignment."
                );
                return;
            }

            alert(
                "Order assignment created successfully."
            );

            setSelectedParticipant("");
            setSelectedParticipantType("");

            await fetchAssignments(
                selectedOrder.id
            );
        } catch (err) {
            console.error(
                "Create Assignment Error:",
                err
            );

            alert(
                "Unable to connect to server."
            );
        } finally {
            setAssignmentLoading(false);
        }
    };

    // =====================================================
    // UPDATE ASSIGNMENT STATUS
    // =====================================================

    const handleUpdateAssignmentStatus = async (
        assignmentId,
        status
    ) => {
        const token = getToken();

        if (!token) {
            alert(
                "Authentication token not found."
            );
            return;
        }

        if (!selectedOrder) {
            return;
        }

        try {
            setAssignmentLoading(true);

            const response = await fetch(
                `${API_URL}/${selectedOrder.id}/assignments/${assignmentId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to update assignment."
                );
                return;
            }

            alert(
                "Assignment status updated successfully."
            );

            await fetchAssignments(
                selectedOrder.id
            );

            // Refresh orders
            await fetchOrders();

            // Update selected order directly
            setSelectedOrder((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    status:
                        status === "Completed"
                            ? "Completed"
                            : current.status,
                };
            });
        } catch (err) {
            console.error(
                "Update Assignment Error:",
                err
            );

            alert(
                "Unable to connect to server."
            );
        } finally {
            setAssignmentLoading(false);
        }
    };

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeDetails = () => {
        setSelectedOrder(null);
        setShowDetailsModal(false);
        setAssignments([]);
        setSelectedParticipant("");
        setSelectedParticipantType("");
    };

    // =====================================================
    // FORMAT MONEY
    // =====================================================

    const formatAmount = (amount) => {
        const value =
            Number(amount || 0);

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }
        ).format(value);
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =====================================================
    // FORMAT DATETIME
    // =====================================================

    const formatDateTime = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(
            date
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // =====================================================
    // ORDER STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {
        switch (status) {
            case "Completed":
                return "completed";

            case "Pending":
                return "pending";

            case "In Progress":
                return "progress";

            case "Cancelled":
                return "cancelled";

            default:
                return "default";
        }
    };

    // =====================================================
    // ASSIGNMENT STATUS CLASS
    // =====================================================

    const getAssignmentStatusClass = (
        status
    ) => {
        switch (status) {
            case "Completed":
                return "completed";

            case "In Progress":
                return "progress";

            case "Assigned":
                return "pending";

            default:
                return "default";
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="orders-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="orders-header">

                <div>

                    <span className="orders-eyebrow">
                        NICECOMM COMMERCE OS
                    </span>

                    <h1>
                        Orders
                    </h1>

                    <p>
                        Manage customer orders
                        and coordinate commerce
                        operations.
                    </p>

                </div>

                <button
                    className="orders-refresh-button"
                    onClick={fetchOrders}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="orders-stats">

                <div className="order-stat-card">

                    <div className="order-stat-icon purple">
                        🛒
                    </div>

                    <div>
                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {totalOrders}
                        </strong>
                    </div>

                </div>

                <div className="order-stat-card">

                    <div className="order-stat-icon orange">
                        ◷
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingOrders}
                        </strong>
                    </div>

                </div>

                <div className="order-stat-card">

                    <div className="order-stat-icon blue">
                        ↗
                    </div>

                    <div>
                        <span>
                            Active Orders
                        </span>

                        <strong>
                            {activeOrders}
                        </strong>
                    </div>

                </div>

                <div className="order-stat-card">

                    <div className="order-stat-icon green">
                        ✓
                    </div>

                    <div>
                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedOrders}
                        </strong>
                    </div>

                </div>

            </section>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <section className="orders-toolbar">

                <div className="orders-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search order, customer or city..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Status
                    </option>

                    <option value="Pending">
                        Pending
                    </option>

                    <option value="In Progress">
                        In Progress
                    </option>

                    <option value="Completed">
                        Completed
                    </option>

                    <option value="Cancelled">
                        Cancelled
                    </option>

                </select>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="orders-error">

                    <div>

                        <strong>
                            Unable to load orders
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                    <button
                        onClick={fetchOrders}
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
                <div className="orders-loading">

                    <div className="orders-spinner" />

                    <p>
                        Loading orders...
                    </p>

                </div>
            )}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
                !error &&
                filteredOrders.length === 0 && (
                    <div className="orders-empty">

                        <div className="orders-empty-icon">
                            🛒
                        </div>

                        <h3>
                            No orders found
                        </h3>

                        <p>
                            There are no orders
                            matching your current
                            search or filter.
                        </p>

                    </div>
                )}

            {/* =================================================
                TABLE
            ================================================= */}

            {!loading &&
                !error &&
                filteredOrders.length > 0 && (
                    <section className="orders-table-card">

                        <div className="orders-table-heading">

                            <div>

                                <span>
                                    ORDER DIRECTORY
                                </span>

                                <h2>
                                    All Orders
                                </h2>

                            </div>

                            <strong>
                                {
                                    filteredOrders.length
                                }{" "}
                                records
                            </strong>

                        </div>

                        <div className="orders-table-wrapper">

                            <table className="orders-table">

                                <thead>

                                    <tr>
                                        <th>
                                            Order
                                        </th>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Shipping Location
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Created
                                        </th>

                                        <th>
                                            Action
                                        </th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredOrders.map(
                                        (order) => (
                                            <tr
                                                key={
                                                    order.id
                                                }
                                            >

                                                <td>

                                                    <div className="order-id-cell">

                                                        <strong>
                                                            #{order.id}
                                                        </strong>

                                                        <span>
                                                            Order
                                                        </span>

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="customer-cell">

                                                        <div className="customer-avatar">

                                                            {(
                                                                order.customer_name ||
                                                                "C"
                                                            )
                                                                .split(
                                                                    " "
                                                                )
                                                                .map(
                                                                    (
                                                                        word
                                                                    ) =>
                                                                        word.charAt(
                                                                            0
                                                                        )
                                                                )
                                                                .join(
                                                                    ""
                                                                )
                                                                .slice(
                                                                    0,
                                                                    2
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    order.customer_name ||
                                                                    "Unknown Customer"
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    order.customer_email ||
                                                                    "—"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <strong className="order-amount">
                                                        {formatAmount(
                                                            order.total_amount
                                                        )}
                                                    </strong>

                                                </td>

                                                <td>

                                                    <div className="shipping-cell">

                                                        <strong>
                                                            {
                                                                order.shipping_city ||
                                                                "—"
                                                            }
                                                        </strong>

                                                        <span>

                                                            {
                                                                order.shipping_state ||
                                                                ""
                                                            }

                                                            {order.shipping_country
                                                                ? `, ${order.shipping_country}`
                                                                : ""}

                                                        </span>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`order-status ${getStatusClass(
                                                            order.status
                                                        )}`}
                                                    >

                                                        <span className="order-status-dot" />

                                                        {
                                                            order.status ||
                                                            "Unknown"
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="order-date">
                                                        {formatDate(
                                                            order.created_at
                                                        )}
                                                    </span>

                                                </td>

                                                <td>

                                                    <button
                                                        className="view-order-button"
                                                        onClick={() =>
                                                            handleViewOrder(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        View Details
                                                    </button>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>
                )}

            {/* =================================================
                ORDER DETAILS MODAL
            ================================================= */}

            {showDetailsModal &&
                selectedOrder && (
                    <div
                        className="order-modal-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeDetails();
                            }
                        }}
                    >

                        <div className="order-details-modal">

                            {/* MODAL HEADER */}

                            <div className="order-modal-header">

                                <div>

                                    <span>
                                        ORDER DETAILS
                                    </span>

                                    <h2>
                                        Order #
                                        {
                                            selectedOrder.id
                                        }
                                    </h2>

                                </div>

                                <button
                                    className="order-modal-close"
                                    onClick={
                                        closeDetails
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <div className="order-details-content">

                                {/* CUSTOMER */}

                                <div className="order-detail-section">

                                    <span className="detail-section-title">
                                        CUSTOMER
                                    </span>

                                    <div className="order-customer-detail">

                                        <div className="customer-avatar large">

                                            {(
                                                selectedOrder.customer_name ||
                                                "C"
                                            )
                                                .split(" ")
                                                .map(
                                                    (
                                                        word
                                                    ) =>
                                                        word.charAt(
                                                            0
                                                        )
                                                )
                                                .join("")
                                                .slice(
                                                    0,
                                                    2
                                                )
                                                .toUpperCase()}

                                        </div>

                                        <div>

                                            <strong>
                                                {
                                                    selectedOrder.customer_name ||
                                                    "Unknown Customer"
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    selectedOrder.customer_email ||
                                                    "—"
                                                }
                                            </span>

                                        </div>

                                    </div>

                                </div>

                                {/* ORDER INFO */}

                                <div className="order-detail-grid">

                                    <div className="order-detail-item">

                                        <span>
                                            Order ID
                                        </span>

                                        <strong>
                                            #
                                            {
                                                selectedOrder.id
                                            }
                                        </strong>

                                    </div>

                                    <div className="order-detail-item">

                                        <span>
                                            Total Amount
                                        </span>

                                        <strong>
                                            {formatAmount(
                                                selectedOrder.total_amount
                                            )}
                                        </strong>

                                    </div>

                                    <div className="order-detail-item">

                                        <span>
                                            Status
                                        </span>

                                        <strong>

                                            <span
                                                className={`order-status ${getStatusClass(
                                                    selectedOrder.status
                                                )}`}
                                            >

                                                <span className="order-status-dot" />

                                                {
                                                    selectedOrder.status ||
                                                    "Unknown"
                                                }

                                            </span>

                                        </strong>

                                    </div>

                                    <div className="order-detail-item">

                                        <span>
                                            Created At
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedOrder.created_at
                                            )}
                                        </strong>

                                    </div>

                                </div>

                                {/* SHIPPING */}

                                <div className="order-detail-section">

                                    <span className="detail-section-title">
                                        SHIPPING ADDRESS
                                    </span>

                                    <div className="shipping-address-box">

                                        <strong>
                                            {
                                                selectedOrder.shipping_address ||
                                                "Address not provided"
                                            }
                                        </strong>

                                        <span>

                                            {
                                                selectedOrder.shipping_city ||
                                                ""
                                            }

                                            {selectedOrder.shipping_state
                                                ? `, ${selectedOrder.shipping_state}`
                                                : ""}

                                            {selectedOrder.shipping_country
                                                ? `, ${selectedOrder.shipping_country}`
                                                : ""}

                                        </span>

                                    </div>

                                </div>

                                {/* ASSIGNMENTS */}

                                <div className="order-detail-section">

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "center",
                                            marginBottom:
                                                "12px",
                                        }}
                                    >

                                        <span className="detail-section-title">
                                            ORDER ASSIGNMENTS
                                        </span>

                                        <span>
                                            {
                                                assignments.length
                                            }{" "}
                                            assigned
                                        </span>

                                    </div>

                                    {/* ADD ASSIGNMENT */}

                                    <div
                                        style={{
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                                "1fr 1fr auto",
                                            gap: "10px",
                                            marginBottom:
                                                "18px",
                                        }}
                                    >

                                        <select
                                            value={
                                                selectedParticipant
                                            }
                                            onChange={
                                                handleParticipantChange
                                            }
                                            disabled={
                                                assignmentLoading
                                            }
                                        >

                                            <option value="">
                                                Select Participant
                                            </option>

                                            {participants.map(
                                                (
                                                    participant
                                                ) => (
                                                    <option
                                                        key={
                                                            participant.id
                                                        }
                                                        value={
                                                            participant.id
                                                        }
                                                    >
                                                        {
                                                            participant.full_name ||
                                                            participant.company_name ||
                                                            participant.contact_person ||
                                                            `Participant #${participant.id}`
                                                        }
                                                    </option>
                                                )
                                            )}

                                        </select>

                                        <select
                                            value={
                                                selectedParticipantType
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSelectedParticipantType(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                assignmentLoading
                                            }
                                        >

                                            <option value="">
                                                Select Type
                                            </option>

                                            <option value="1">
                                                Seller
                                            </option>

                                            <option value="2">
                                                Warehouse
                                            </option>

                                            <option value="3">
                                                Logistics
                                            </option>

                                            <option value="4">
                                                Packaging
                                            </option>

                                            <option value="5">
                                                Marketing
                                            </option>

                                            <option value="6">
                                                Affiliate
                                            </option>

                                            <option value="7">
                                                Inspection
                                            </option>

                                            <option value="8">
                                                Repair
                                            </option>

                                            <option value="9">
                                                Installation
                                            </option>

                                        </select>

                                        <button
                                            type="button"
                                            onClick={
                                                handleCreateAssignment
                                            }
                                            disabled={
                                                assignmentLoading
                                            }
                                            style={{
                                                padding:
                                                    "0 16px",
                                                border:
                                                    "none",
                                                borderRadius:
                                                    "8px",
                                                cursor:
                                                    assignmentLoading
                                                        ? "not-allowed"
                                                        : "pointer",
                                            }}
                                        >
                                            {assignmentLoading
                                                ? "..."
                                                : "Assign"}
                                        </button>

                                    </div>

                                    {/* ASSIGNMENT LOADING */}

                                    {assignmentLoading &&
                                        assignments.length ===
                                            0 && (
                                            <div
                                                style={{
                                                    padding:
                                                        "20px",
                                                    textAlign:
                                                        "center",
                                                }}
                                            >
                                                Loading assignments...
                                            </div>
                                        )}

                                    {/* NO ASSIGNMENTS */}

                                    {!assignmentLoading &&
                                        assignments.length ===
                                            0 && (
                                            <div
                                                style={{
                                                    padding:
                                                        "20px",
                                                    textAlign:
                                                        "center",
                                                    border:
                                                        "1px dashed #ccc",
                                                    borderRadius:
                                                        "10px",
                                                }}
                                            >
                                                No participants
                                                assigned to
                                                this order
                                                yet.
                                            </div>
                                        )}

                                    {/* ASSIGNMENT LIST */}

                                    {assignments.length >
                                        0 && (
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column",
                                                gap: "10px",
                                            }}
                                        >

                                            {assignments.map(
                                                (
                                                    assignment
                                                ) => (
                                                    <div
                                                        key={
                                                            assignment.id
                                                        }
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "center",
                                                            gap:
                                                                "15px",
                                                            padding:
                                                                "14px",
                                                            border:
                                                                "1px solid #e5e7eb",
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                    >

                                                        <div>

                                                            <strong
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                {
                                                                    assignment.company_name ||
                                                                    assignment.contact_person ||
                                                                    `Participant #${assignment.participant_id}`
                                                                }
                                                            </strong>

                                                            <span
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                    marginTop:
                                                                        "4px",
                                                                }}
                                                            >
                                                                {
                                                                    assignment.participant_type ||
                                                                    "Participant"
                                                                }
                                                            </span>

                                                            <small
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                    marginTop:
                                                                        "4px",
                                                                }}
                                                            >
                                                                Assigned:{" "}
                                                                {formatDateTime(
                                                                    assignment.assigned_at
                                                                )}
                                                            </small>

                                                        </div>

                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap:
                                                                    "10px",
                                                            }}
                                                        >

                                                            <span
                                                                className={`order-status ${getAssignmentStatusClass(
                                                                    assignment.status
                                                                )}`}
                                                            >

                                                                <span className="order-status-dot" />

                                                                {
                                                                    assignment.status ||
                                                                    "Assigned"
                                                                }

                                                            </span>

                                                            <select
                                                                value={
                                                                    assignment.status ||
                                                                    "Assigned"
                                                                }
                                                                disabled={
                                                                    assignmentLoading
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleUpdateAssignmentStatus(
                                                                        assignment.id,
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            >

                                                                <option value="Assigned">
                                                                    Assigned
                                                                </option>

                                                                <option value="In Progress">
                                                                    In Progress
                                                                </option>

                                                                <option value="Completed">
                                                                    Completed
                                                                </option>

                                                            </select>

                                                        </div>

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* MODAL ACTIONS */}

                            <div className="order-modal-actions">

                                <button
                                    className="order-close-button"
                                    onClick={
                                        closeDetails
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default Orders;