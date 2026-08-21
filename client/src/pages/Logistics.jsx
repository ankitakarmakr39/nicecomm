import { useEffect, useState } from "react";
import "./Logistics.css";

const PROVIDERS_API =
    "http://localhost:5000/api/logistics/providers";

const ASSIGNMENTS_API =
    "http://localhost:5000/api/logistics/assignments";

function Logistics() {
    const [providers, setProviders] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [assignmentLoading, setAssignmentLoading] = useState(true);

    const [error, setError] = useState("");
    const [assignmentError, setAssignmentError] = useState("");

    // =====================================================
    // CREATE ASSIGNMENT
    // =====================================================

    const [showAssignmentForm, setShowAssignmentForm] =
        useState(false);

    const [creatingAssignment, setCreatingAssignment] =
        useState(false);

    const [createError, setCreateError] =
        useState("");

    const [createSuccess, setCreateSuccess] =
        useState("");

    const [assignmentForm, setAssignmentForm] = useState({
        order_id: "",
        logistics_id: "",
        pickup_address: "",
        destination_address: "",
        status: "Assigned",
    });

    // =====================================================
    // STATUS UPDATE
    // =====================================================

    const [updatingAssignment, setUpdatingAssignment] =
        useState(null);

    // =====================================================
    // TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =====================================================
    // FETCH PROVIDERS
    // =====================================================

    const fetchProviders = async () => {
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
                PROVIDERS_API,
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
                        "Failed to fetch logistics providers."
                );
            }

            setProviders(
                Array.isArray(data.logistics)
                    ? data.logistics
                    : []
            );
        } catch (error) {
            console.error(
                "Fetch Logistics Providers Error:",
                error
            );

            setError(
                error.message ||
                    "Unable to load logistics providers."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FETCH ASSIGNMENTS
    // =====================================================

    const fetchAssignments = async () => {
        try {
            setAssignmentLoading(true);
            setAssignmentError("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response = await fetch(
                ASSIGNMENTS_API,
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
                        "Failed to fetch logistics assignments."
                );
            }

            setAssignments(
                Array.isArray(data.assignments)
                    ? data.assignments
                    : []
            );
        } catch (error) {
            console.error(
                "Fetch Logistics Assignments Error:",
                error
            );

            setAssignmentError(
                error.message ||
                    "Unable to load logistics assignments."
            );
        } finally {
            setAssignmentLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchProviders();
        fetchAssignments();
    }, []);

    // =====================================================
    // REFRESH
    // =====================================================

    const refreshAll = async () => {
        await Promise.all([
            fetchProviders(),
            fetchAssignments(),
        ]);
    };

    // =====================================================
    // PROVIDER STATISTICS
    // =====================================================

    const totalProviders = providers.length;

    const activeProviders = providers.filter(
        (provider) =>
            provider.status?.toLowerCase() === "active"
    ).length;

    const otherProviders =
        totalProviders - activeProviders;

    const totalFleet = providers.reduce(
        (total, provider) =>
            total +
            Number(provider.fleet_size || 0),
        0
    );

    // =====================================================
    // ASSIGNMENT STATISTICS
    // =====================================================

    const totalAssignments = assignments.length;

    const assignedCount = assignments.filter(
        (assignment) =>
            assignment.status === "Assigned"
    ).length;

    const inProgressCount = assignments.filter(
        (assignment) =>
            assignment.status === "In Progress"
    ).length;

    const completedCount = assignments.filter(
        (assignment) =>
            assignment.status === "Completed"
    ).length;

    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
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
    // ASSIGNMENT STATUS CLASS
    // =====================================================

    const getAssignmentStatusClass = (status) => {
        switch (status) {
            case "Assigned":
                return "assigned";

            case "In Progress":
                return "progress";

            case "Completed":
                return "completed";

            default:
                return "unknown";
        }
    };

    // =====================================================
    // CREATE FORM INPUT
    // =====================================================

    const handleAssignmentInput = (event) => {
        const { name, value } = event.target;

        setAssignmentForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =====================================================
    // OPEN CREATE FORM
    // =====================================================

    const openAssignmentForm = () => {
        setCreateError("");
        setCreateSuccess("");

        setAssignmentForm({
            order_id: "",
            logistics_id: "",
            pickup_address: "",
            destination_address: "",
            status: "Assigned",
        });

        setShowAssignmentForm(true);
    };

    // =====================================================
    // CLOSE CREATE FORM
    // =====================================================

    const closeAssignmentForm = () => {
        if (creatingAssignment) {
            return;
        }

        setShowAssignmentForm(false);
        setCreateError("");
        setCreateSuccess("");
    };

    // =====================================================
    // CREATE ASSIGNMENT
    // =====================================================

    const createAssignment = async (event) => {
        event.preventDefault();

        try {
            setCreatingAssignment(true);
            setCreateError("");
            setCreateSuccess("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            if (!assignmentForm.order_id) {
                throw new Error(
                    "Please enter Order ID."
                );
            }

            if (!assignmentForm.logistics_id) {
                throw new Error(
                    "Please select a logistics provider."
                );
            }

            if (!assignmentForm.pickup_address.trim()) {
                throw new Error(
                    "Please enter pickup address."
                );
            }

            if (
                !assignmentForm.destination_address.trim()
            ) {
                throw new Error(
                    "Please enter destination address."
                );
            }

            const response = await fetch(
                ASSIGNMENTS_API,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        order_id:
                            Number(
                                assignmentForm.order_id
                            ),

                        logistics_id:
                            Number(
                                assignmentForm.logistics_id
                            ),

                        pickup_address:
                            assignmentForm.pickup_address,

                        destination_address:
                            assignmentForm.destination_address,

                        status:
                            assignmentForm.status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to create logistics assignment."
                );
            }

            setCreateSuccess(
                "Logistics assignment created successfully."
            );

            setAssignmentForm({
                order_id: "",
                logistics_id: "",
                pickup_address: "",
                destination_address: "",
                status: "Assigned",
            });

            await fetchAssignments();

        } catch (error) {
            console.error(
                "Create Logistics Assignment Error:",
                error
            );

            setCreateError(
                error.message ||
                    "Failed to create logistics assignment."
            );
        } finally {
            setCreatingAssignment(false);
        }
    };

    // =====================================================
    // UPDATE ASSIGNMENT STATUS
    // =====================================================

    const updateAssignmentStatus = async (
        assignmentId,
        status
    ) => {
        try {
            setUpdatingAssignment(assignmentId);

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response = await fetch(
                `${ASSIGNMENTS_API}/${assignmentId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update assignment."
                );
            }

            await fetchAssignments();

        } catch (error) {
            console.error(
                "Update Logistics Assignment Error:",
                error
            );

            setAssignmentError(
                error.message ||
                    "Failed to update assignment."
            );
        } finally {
            setUpdatingAssignment(null);
        }
    };

    // =====================================================
    // NEXT STATUS
    // =====================================================

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case "Assigned":
                return "In Progress";

            case "In Progress":
                return "Completed";

            default:
                return null;
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading && assignmentLoading) {
        return (
            <section className="logistics-page">

                <div className="logistics-page-header">

                    <div className="logistics-title-area">

                        <span className="logistics-eyebrow">
                            OPERATIONS
                        </span>

                        <h1>
                            Logistics
                        </h1>

                        <p>
                            Manage logistics providers,
                            fleet capacity and delivery
                            operations.
                        </p>

                    </div>

                </div>

                <div className="logistics-loading">

                    <div className="logistics-loading-spinner"></div>

                    <span>
                        Loading logistics operations...
                    </span>

                </div>

            </section>
        );
    }

    return (
        <section className="logistics-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="logistics-page-header">

                <div className="logistics-title-area">

                    <span className="logistics-eyebrow">
                        OPERATIONS
                    </span>

                    <h1>
                        Logistics
                    </h1>

                    <p>
                        Manage logistics providers,
                        fleet capacity and delivery
                        operations.
                    </p>

                </div>

                <div className="logistics-header-actions">

                    <button
                        className="logistics-refresh-button"
                        onClick={refreshAll}
                        disabled={
                            loading ||
                            assignmentLoading
                        }
                    >
                        <span className="refresh-icon">
                            ↻
                        </span>

                        Refresh
                    </button>

                    <button
                        className="create-assignment-button"
                        onClick={openAssignmentForm}
                    >
                        + Create Assignment
                    </button>

                </div>

            </div>


            {/* =================================================
                PROVIDER STATISTICS
            ================================================= */}

            <div className="logistics-stat-grid">

                <div className="logistics-stat-card">

                    <div className="logistics-stat-icon blue">
                        🚚
                    </div>

                    <div className="logistics-stat-content">

                        <span>
                            Total Providers
                        </span>

                        <strong>
                            {totalProviders}
                        </strong>

                        <small>
                            Registered providers
                        </small>

                    </div>

                </div>


                <div className="logistics-stat-card">

                    <div className="logistics-stat-icon green">
                        ✓
                    </div>

                    <div className="logistics-stat-content">

                        <span>
                            Active Providers
                        </span>

                        <strong>
                            {activeProviders}
                        </strong>

                        <small>
                            Currently active
                        </small>

                    </div>

                </div>


                <div className="logistics-stat-card">

                    <div className="logistics-stat-icon orange">
                        ◷
                    </div>

                    <div className="logistics-stat-content">

                        <span>
                            Other Status
                        </span>

                        <strong>
                            {otherProviders}
                        </strong>

                        <small>
                            Inactive or pending
                        </small>

                    </div>

                </div>


                <div className="logistics-stat-card">

                    <div className="logistics-stat-icon purple">
                        🚛
                    </div>

                    <div className="logistics-stat-content">

                        <span>
                            Total Fleet
                        </span>

                        <strong>
                            {totalFleet}
                        </strong>

                        <small>
                            Available vehicles
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================================
                PROVIDERS
            ================================================= */}

            <div className="logistics-panel">

                <div className="logistics-panel-header">

                    <div>

                        <span className="logistics-section-label">
                            PROVIDERS
                        </span>

                        <h2>
                            Logistics Providers
                        </h2>

                        <p>
                            Registered logistics partners
                            and their operational capacity.
                        </p>

                    </div>

                    <div className="logistics-count-badge">
                        {totalProviders} Providers
                    </div>

                </div>


                {error ? (

                    <div className="logistics-error">

                        <div className="logistics-error-icon">
                            !
                        </div>

                        <div>

                            <strong>
                                Unable to load providers
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                        <button
                            onClick={fetchProviders}
                        >
                            Try Again
                        </button>

                    </div>

                ) : providers.length === 0 ? (

                    <div className="logistics-empty">

                        <div className="logistics-empty-icon">
                            🚚
                        </div>

                        <h3>
                            No logistics providers found
                        </h3>

                        <p>
                            No logistics provider has
                            been registered yet.
                        </p>

                    </div>

                ) : (

                    <div className="logistics-table-wrapper">

                        <table className="logistics-table">

                            <thead>

                                <tr>

                                    <th>
                                        Provider
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Fleet
                                    </th>

                                    <th>
                                        Service Areas
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {providers.map(
                                    (provider) => (

                                        <tr
                                            key={provider.id}
                                        >

                                            <td>

                                                <div className="logistics-provider">

                                                    <div className="logistics-provider-avatar">

                                                        {provider.company_name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            "L"}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {provider.company_name ||
                                                                "Unnamed Provider"}
                                                        </strong>

                                                        <span>
                                                            Logistics Provider
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>
                                                {provider.contact_person ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {provider.phone ||
                                                    "—"}
                                            </td>

                                            <td>

                                                <span className="fleet-value">
                                                    {provider.fleet_size ||
                                                        0}
                                                </span>

                                            </td>

                                            <td>

                                                <span className="service-area">
                                                    {provider.service_areas ||
                                                        "—"}
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`logistics-status ${
                                                        provider.status
                                                            ?.toLowerCase() ===
                                                        "active"
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >

                                                    <span className="status-dot"></span>

                                                    {provider.status ||
                                                        "Unknown"}

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
                ASSIGNMENT SUMMARY
            ================================================= */}

            <div className="logistics-assignment-summary">

                <div className="assignment-summary-heading">

                    <div>

                        <span className="logistics-section-label">
                            DELIVERY OPERATIONS
                        </span>

                        <h2>
                            Logistics Assignments
                        </h2>

                        <p>
                            Track orders assigned to
                            logistics providers.
                        </p>

                    </div>

                    <div className="assignment-total">

                        <strong>
                            {totalAssignments}
                        </strong>

                        <span>
                            Total Assignments
                        </span>

                    </div>

                </div>


                <div className="assignment-mini-stats">

                    <div className="assignment-mini-card assigned-card">

                        <span className="mini-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                {assignedCount}
                            </strong>

                            <span>
                                Assigned
                            </span>

                        </div>

                    </div>


                    <div className="assignment-mini-card progress-card">

                        <span className="mini-icon">
                            ◷
                        </span>

                        <div>

                            <strong>
                                {inProgressCount}
                            </strong>

                            <span>
                                In Progress
                            </span>

                        </div>

                    </div>


                    <div className="assignment-mini-card completed-card">

                        <span className="mini-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                {completedCount}
                            </strong>

                            <span>
                                Completed
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                ASSIGNMENTS TABLE
            ================================================= */}

            <div className="logistics-panel assignment-panel">

                <div className="logistics-panel-header">

                    <div>

                        <span className="logistics-section-label">
                            ASSIGNMENTS
                        </span>

                        <h2>
                            Logistics Assignments
                        </h2>

                        <p>
                            Orders currently assigned to
                            logistics providers.
                        </p>

                    </div>

                    <div className="assignment-header-actions">

                        <div className="logistics-count-badge">
                            {totalAssignments} Assignments
                        </div>

                        <button
                            className="small-create-button"
                            onClick={openAssignmentForm}
                        >
                            + New
                        </button>

                    </div>

                </div>


                {assignmentLoading ? (

                    <div className="assignment-loading">

                        <div className="logistics-loading-spinner"></div>

                        <span>
                            Loading assignments...
                        </span>

                    </div>

                ) : assignmentError ? (

                    <div className="logistics-error">

                        <div className="logistics-error-icon">
                            !
                        </div>

                        <div>

                            <strong>
                                Unable to load assignments
                            </strong>

                            <p>
                                {assignmentError}
                            </p>

                        </div>

                        <button
                            onClick={fetchAssignments}
                        >
                            Try Again
                        </button>

                    </div>

                ) : assignments.length === 0 ? (

                    <div className="logistics-empty">

                        <div className="logistics-empty-icon">
                            📦
                        </div>

                        <h3>
                            No logistics assignments
                        </h3>

                        <p>
                            No orders have been assigned
                            to a logistics provider yet.
                        </p>

                        <button
                            className="empty-create-button"
                            onClick={openAssignmentForm}
                        >
                            + Create First Assignment
                        </button>

                    </div>

                ) : (

                    <div className="logistics-table-wrapper">

                        <table className="logistics-table assignment-table">

                            <thead>

                                <tr>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Logistics Provider
                                    </th>

                                    <th>
                                        Pickup
                                    </th>

                                    <th>
                                        Destination
                                    </th>

                                    <th>
                                        Assigned
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {assignments.map(
                                    (assignment) => {

                                        const nextStatus =
                                            getNextStatus(
                                                assignment.status
                                            );

                                        return (
                                            <tr
                                                key={
                                                    assignment.assignment_id
                                                }
                                            >

                                                <td>

                                                    <span className="order-number">
                                                        #
                                                        {
                                                            assignment.order_id
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="assignment-provider">

                                                        <div className="assignment-provider-avatar">

                                                            {assignment.company_name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ||
                                                                "L"}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    assignment.company_name ||
                                                                    "Unknown Provider"
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    assignment.contact_person ||
                                                                    "Logistics Provider"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className="address-text">
                                                        {
                                                            assignment.pickup_address ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="address-text">
                                                        {
                                                            assignment.destination_address ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="date-text">
                                                        {
                                                            formatDate(
                                                                assignment.assigned_at
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`assignment-status ${getAssignmentStatusClass(
                                                            assignment.status
                                                        )}`}
                                                    >

                                                        <span className="assignment-status-dot"></span>

                                                        {
                                                            assignment.status ||
                                                            "Unknown"
                                                        }

                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    {nextStatus ? (

                                                        <button
                                                            className={`assignment-update-button ${getAssignmentStatusClass(
                                                                nextStatus
                                                            )}`}
                                                            disabled={
                                                                updatingAssignment ===
                                                                assignment.assignment_id
                                                            }
                                                            onClick={() =>
                                                                updateAssignmentStatus(
                                                                    assignment.assignment_id,
                                                                    nextStatus
                                                                )
                                                            }
                                                        >

                                                            {updatingAssignment ===
                                                            assignment.assignment_id
                                                                ? "Updating..."
                                                                : nextStatus ===
                                                                  "In Progress"
                                                                ? "Start Delivery"
                                                                : "Complete"}

                                                        </button>

                                                    ) : (

                                                        <span className="completed-label">
                                                            ✓ Completed
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                CREATE ASSIGNMENT MODAL
            ================================================= */}

            {showAssignmentForm && (

                <div
                    className="assignment-modal-overlay"
                    onClick={closeAssignmentForm}
                >

                    <div
                        className="assignment-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="assignment-modal-header">

                            <div>

                                <span className="logistics-section-label">
                                    DELIVERY OPERATIONS
                                </span>

                                <h2>
                                    Create Logistics Assignment
                                </h2>

                                <p>
                                    Assign an order to a
                                    logistics provider.
                                </p>

                            </div>

                            <button
                                className="modal-close-button"
                                onClick={closeAssignmentForm}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="assignment-form"
                            onSubmit={createAssignment}
                        >

                            {/* ORDER ID */}

                            <div className="form-group">

                                <label>
                                    Order ID
                                </label>

                                <input
                                    type="number"
                                    name="order_id"
                                    value={
                                        assignmentForm.order_id
                                    }
                                    onChange={
                                        handleAssignmentInput
                                    }
                                    placeholder="Example: 4"
                                    min="1"
                                />

                            </div>


                            {/* PROVIDER */}

                            <div className="form-group">

                                <label>
                                    Logistics Provider
                                </label>

                                <select
                                    name="logistics_id"
                                    value={
                                        assignmentForm.logistics_id
                                    }
                                    onChange={
                                        handleAssignmentInput
                                    }
                                >

                                    <option value="">
                                        Select provider
                                    </option>

                                    {providers
                                        .filter(
                                            (provider) =>
                                                provider.status
                                                    ?.toLowerCase() ===
                                                "active"
                                        )
                                        .map(
                                            (provider) => (
                                                <option
                                                    key={
                                                        provider.id
                                                    }
                                                    value={
                                                        provider.id
                                                    }
                                                >
                                                    {
                                                        provider.company_name
                                                    }
                                                </option>
                                            )
                                        )}

                                </select>

                            </div>


                            {/* PICKUP */}

                            <div className="form-group">

                                <label>
                                    Pickup Address
                                </label>

                                <textarea
                                    name="pickup_address"
                                    value={
                                        assignmentForm.pickup_address
                                    }
                                    onChange={
                                        handleAssignmentInput
                                    }
                                    placeholder="Enter pickup address"
                                    rows="3"
                                />

                            </div>


                            {/* DESTINATION */}

                            <div className="form-group">

                                <label>
                                    Destination Address
                                </label>

                                <textarea
                                    name="destination_address"
                                    value={
                                        assignmentForm.destination_address
                                    }
                                    onChange={
                                        handleAssignmentInput
                                    }
                                    placeholder="Enter delivery destination"
                                    rows="3"
                                />

                            </div>


                            {/* STATUS */}

                            <div className="form-group">

                                <label>
                                    Initial Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        assignmentForm.status
                                    }
                                    onChange={
                                        handleAssignmentInput
                                    }
                                >

                                    <option value="Assigned">
                                        Assigned
                                    </option>

                                    <option value="In Progress">
                                        In Progress
                                    </option>

                                </select>

                            </div>


                            {/* ERROR */}

                            {createError && (

                                <div className="form-message error">
                                    {createError}
                                </div>

                            )}


                            {/* SUCCESS */}

                            {createSuccess && (

                                <div className="form-message success">
                                    {createSuccess}
                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="assignment-form-actions">

                                <button
                                    type="button"
                                    className="cancel-assignment-button"
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
                                    className="submit-assignment-button"
                                    disabled={
                                        creatingAssignment
                                    }
                                >

                                    {creatingAssignment
                                        ? "Creating..."
                                        : "Create Assignment"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </section>
    );
}

export default Logistics;