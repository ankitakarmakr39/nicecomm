
import React, { useEffect, useState } from "react";
import "./Packaging.css";

const API_BASE_URL = "http://localhost:5000/api/packaging";

const Packaging = () => {
    const [providers, setProviders] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("authToken") ||
            localStorage.getItem("accessToken")
        );
    };

    const getAuthHeaders = () => {
        const token = getToken();

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    const fetchPackagingData = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Login token not found. Please login again.");
                setLoading(false);
                return;
            }

            const [providersResponse, assignmentsResponse] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/providers`, {
                        method: "GET",
                        headers: getAuthHeaders(),
                    }),

                    fetch(`${API_BASE_URL}/assignments`, {
                        method: "GET",
                        headers: getAuthHeaders(),
                    }),
                ]);

            if (
                providersResponse.status === 401 ||
                assignmentsResponse.status === 401
            ) {
                setError("Invalid Token. Please login again.");
                setLoading(false);
                return;
            }

            if (!providersResponse.ok) {
                throw new Error("Unable to load packaging providers");
            }

            if (!assignmentsResponse.ok) {
                throw new Error("Unable to load packaging assignments");
            }

            const providersData = await providersResponse.json();
            const assignmentsData = await assignmentsResponse.json();

            setProviders(providersData.packaging || []);
            setAssignments(assignmentsData.assignments || []);

        } catch (err) {
            console.error("Packaging Fetch Error:", err);
            setError(err.message || "Failed to load packaging data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackagingData();
    }, []);

    // ==========================================
    // Statistics
    // ==========================================

    const totalProviders = providers.length;

    const activeProviders = providers.filter(
        (provider) => provider.status === "Active"
    ).length;

    const otherProviders = providers.filter(
        (provider) => provider.status !== "Active"
    ).length;

    const totalCapacity = providers.reduce(
        (total, provider) => total + Number(provider.capacity || 0),
        0
    );

    const totalAssignments = assignments.length;

    const assignedCount = assignments.filter(
        (item) => item.status === "Assigned"
    ).length;

    const inProgressCount = assignments.filter(
        (item) => item.status === "In Progress"
    ).length;

    const completedCount = assignments.filter(
        (item) => item.status === "Completed"
    ).length;

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Active":
            case "Completed":
                return "status-success";

            case "Assigned":
                return "status-assigned";

            case "In Progress":
                return "status-progress";

            default:
                return "status-other";
        }
    };

    return (
        <div className="packaging-page">

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="packaging-header">

                <div>
                    <div className="packaging-eyebrow">
                        OPERATIONS
                    </div>

                    <h1>Packaging</h1>

                    <p>
                        Manage packaging providers, service capacity and
                        packaging operations.
                    </p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={fetchPackagingData}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (
                <div className="packaging-error">
                    <div>
                        <strong>Unable to load packaging data</strong>
                        <span>{error}</span>
                    </div>

                    <button onClick={fetchPackagingData}>
                        Try Again
                    </button>
                </div>
            )}


            {/* ==========================================
                STATISTICS
            ========================================== */}

            <div className="packaging-stats">

                <div className="stat-card">

                    <div className="stat-icon provider-icon">
                        📦
                    </div>

                    <div>
                        <span className="stat-label">
                            TOTAL PROVIDERS
                        </span>

                        <strong>{loading ? "—" : totalProviders}</strong>

                        <small>
                            Registered providers
                        </small>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon active-icon">
                        ✓
                    </div>

                    <div>
                        <span className="stat-label">
                            ACTIVE PROVIDERS
                        </span>

                        <strong>{loading ? "—" : activeProviders}</strong>

                        <small>
                            Currently active
                        </small>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon other-icon">
                        ◷
                    </div>

                    <div>
                        <span className="stat-label">
                            OTHER STATUS
                        </span>

                        <strong>{loading ? "—" : otherProviders}</strong>

                        <small>
                            Inactive or pending
                        </small>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon capacity-icon">
                        🏭
                    </div>

                    <div>
                        <span className="stat-label">
                            TOTAL CAPACITY
                        </span>

                        <strong>
                            {loading ? "—" : totalCapacity}
                        </strong>

                        <small>
                            Packaging capacity
                        </small>
                    </div>

                </div>

            </div>


            {/* ==========================================
                PROVIDERS
            ========================================== */}

            <section className="packaging-section">

                <div className="section-heading">

                    <div>
                        <div className="section-eyebrow">
                            PROVIDERS
                        </div>

                        <h2>Packaging Providers</h2>

                        <p>
                            Registered packaging partners and their
                            operational capacity.
                        </p>
                    </div>

                    <span className="count-badge">
                        {totalProviders} Providers
                    </span>

                </div>


                {loading ? (
                    <div className="empty-state">
                        Loading packaging providers...
                    </div>
                ) : providers.length === 0 ? (
                    <div className="empty-state">
                        No packaging providers found.
                    </div>
                ) : (
                    <div className="provider-grid">

                        {providers.map((provider) => (

                            <div
                                className="provider-card"
                                key={provider.id}
                            >

                                <div className="provider-top">

                                    <div className="provider-logo">
                                        📦
                                    </div>

                                    <span
                                        className={`status-badge ${getStatusClass(
                                            provider.status
                                        )}`}
                                    >
                                        {provider.status}
                                    </span>

                                </div>


                                <h3>
                                    {provider.company_name}
                                </h3>

                                <p className="provider-contact">
                                    {provider.contact_person || "No contact person"}
                                </p>


                                <div className="provider-details">

                                    <div>
                                        <span>Phone</span>
                                        <strong>
                                            {provider.phone || "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Capacity</span>
                                        <strong>
                                            {provider.capacity || 0}
                                        </strong>
                                    </div>

                                </div>


                                <div className="packaging-types">

                                    <span>
                                        Packaging Types
                                    </span>

                                    <p>
                                        {provider.packaging_types || "-"}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </section>


            {/* ==========================================
                ASSIGNMENT STATISTICS
            ========================================== */}

            <section className="packaging-section">

                <div className="section-heading">

                    <div>
                        <div className="section-eyebrow">
                            PACKAGING OPERATIONS
                        </div>

                        <h2>Packaging Assignments</h2>

                        <p>
                            Track orders assigned to packaging providers.
                        </p>
                    </div>

                    <div className="assignment-total">
                        <strong>
                            {loading ? "—" : totalAssignments}
                        </strong>

                        <span>
                            TOTAL ASSIGNMENTS
                        </span>
                    </div>

                </div>


                <div className="assignment-stats">

                    <div className="assignment-stat assigned">
                        <div className="assignment-icon">
                            ✓
                        </div>

                        <div>
                            <strong>{assignedCount}</strong>
                            <span>ASSIGNED</span>
                        </div>
                    </div>


                    <div className="assignment-stat progress">
                        <div className="assignment-icon">
                            ◷
                        </div>

                        <div>
                            <strong>{inProgressCount}</strong>
                            <span>IN PROGRESS</span>
                        </div>
                    </div>


                    <div className="assignment-stat completed">
                        <div className="assignment-icon">
                            ✓
                        </div>

                        <div>
                            <strong>{completedCount}</strong>
                            <span>COMPLETED</span>
                        </div>
                    </div>

                </div>


                {/* ==========================================
                    ASSIGNMENTS TABLE
                ========================================== */}

                {loading ? (
                    <div className="empty-state">
                        Loading assignments...
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="empty-state">
                        No packaging assignments found.
                    </div>
                ) : (
                    <div className="assignment-table-wrapper">

                        <table className="assignment-table">

                            <thead>
                                <tr>
                                    <th>ORDER</th>
                                    <th>PACKAGING PROVIDER</th>
                                    <th>PACKAGING TYPE</th>
                                    <th>STATUS</th>
                                    <th>ASSIGNED AT</th>
                                    <th>COMPLETED AT</th>
                                </tr>
                            </thead>

                            <tbody>

                                {assignments.map((assignment) => (

                                    <tr key={assignment.assignment_id}>

                                        <td>
                                            <strong>
                                                #{assignment.order_id}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="table-provider">

                                                <div className="table-provider-icon">
                                                    📦
                                                </div>

                                                <div>
                                                    <strong>
                                                        {assignment.company_name}
                                                    </strong>

                                                    <span>
                                                        {assignment.contact_person}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <span className="type-badge">
                                                {assignment.packaging_type}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    assignment.status
                                                )}`}
                                            >
                                                {assignment.status}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(
                                                assignment.assigned_at
                                            )}
                                        </td>

                                        <td>
                                            {formatDate(
                                                assignment.completed_at
                                            )}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </div>
    );
};

export default Packaging;
