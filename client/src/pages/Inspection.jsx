import React, { useEffect, useState } from "react";
import "./Inspection.css";

const API_BASE = "http://localhost:5000/api/inspection";

const Inspection = () => {
    const [profile, setProfile] = useState(null);
    const [inspections, setInspections] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    // ======================================
    // GET TOKEN
    // ======================================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("token") ||
            ""
        );
    };

    // ======================================
    // GET USER
    // ======================================

    const getUser = () => {
        const savedUser = localStorage.getItem("user");

        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    };

    // ======================================
    // HEADERS
    // ======================================

    const getHeaders = () => ({
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    });

    // ======================================
    // CHECK ADMIN
    // ======================================

    const user = getUser();

    const isAdmin =
        user?.role === "admin" ||
        user?.role === "Admin";

    // ======================================
    // FETCH ADMIN INSPECTIONS
    // ======================================

    const fetchAdminInspections = async () => {
        const response = await fetch(
            `${API_BASE}/all`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load inspection partners"
            );
        }

        setInspections(
            Array.isArray(data.inspections)
                ? data.inspections
                : []
        );
    };

    // ======================================
    // FETCH PARTICIPANT PROFILE
    // ======================================

    const fetchProfile = async () => {
        const response = await fetch(
            `${API_BASE}/profile`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load inspection profile"
            );
        }

        setProfile(data.inspection || null);
    };

    // ======================================
    // FETCH PARTICIPANT ASSIGNMENTS
    // ======================================

    const fetchAssignments = async () => {
        const response = await fetch(
            `${API_BASE}/assigned`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load inspection assignments"
            );
        }

        setAssignments(
            Array.isArray(data)
                ? data
                : []
        );
    };

    // ======================================
    // LOAD DATA
    // ======================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please login again."
                );
            }

            // ==================================
            // ADMIN
            // ==================================

            if (isAdmin) {
                await fetchAdminInspections();
                return;
            }

            // ==================================
            // PARTICIPANT
            // ==================================

            await Promise.all([
                fetchProfile(),
                fetchAssignments(),
            ]);

        } catch (err) {

            console.error(
                "Inspection Load Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load inspection data"
            );

        } finally {
            setLoading(false);
        }
    };

    // ======================================
    // INITIAL LOAD
    // ======================================

    useEffect(() => {
        loadData();
    }, []);

    // ======================================
    // UPDATE ASSIGNMENT STATUS
    // ======================================

    const updateAssignmentStatus = async (
        assignmentId,
        status
    ) => {

        try {

            setUpdatingId(assignmentId);
            setError("");

            const response = await fetch(
                `${API_BASE}/assign/${assignmentId}`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update inspection assignment"
                );
            }

            setAssignments((prev) =>
                prev.map((assignment) =>
                    assignment.id === assignmentId
                        ? data.assignment
                        : assignment
                )
            );

        } catch (err) {

            console.error(
                "Inspection Assignment Update Error:",
                err
            );

            setError(
                err.message ||
                "Failed to update inspection assignment"
            );

        } finally {

            setUpdatingId(null);

        }
    };

    // ======================================
    // STATISTICS
    // ======================================

    const totalAssignments =
        assignments.length;

    const assignedCount =
        assignments.filter(
            (item) =>
                item.status === "Assigned"
        ).length;

    const inProgressCount =
        assignments.filter(
            (item) =>
                item.status === "In Progress"
        ).length;

    const completedCount =
        assignments.filter(
            (item) =>
                item.status === "Completed"
        ).length;

    // ======================================
    // DATE FORMATTER
    // ======================================

    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // ======================================
    // STATUS CLASS
    // ======================================

    const getStatusClass = (status) => {

        return String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    // ======================================
    // LOADING
    // ======================================

    if (loading) {

        return (
            <div className="inspection-page">

                <div className="inspection-loading">

                    <div className="inspection-spinner"></div>

                    <p>
                        Loading Inspection Dashboard...
                    </p>

                </div>

            </div>
        );
    }

    // ======================================
    // ADMIN UI
    // ======================================

    if (isAdmin) {

        return (
            <div className="inspection-page">

                {/* HEADER */}

                <div className="inspection-header">

                    <div>

                        <h1>
                            Inspection Partners
                        </h1>

                        <p>
                            Manage all inspection service
                            partners in NiceComm
                        </p>

                    </div>

                    <button
                        className="inspection-refresh-btn"
                        onClick={loadData}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="inspection-error">

                        <strong>
                            Error:
                        </strong>{" "}

                        {error}

                    </div>
                )}


                {/* STATS */}

                <div className="inspection-stats">

                    <div className="inspection-stat-card">

                        <div className="inspection-stat-icon purple">
                            🔍
                        </div>

                        <div>

                            <span>
                                Total Inspection Partners
                            </span>

                            <strong>
                                {inspections.length}
                            </strong>

                        </div>

                    </div>


                    <div className="inspection-stat-card">

                        <div className="inspection-stat-icon green">
                            ✓
                        </div>

                        <div>

                            <span>
                                Active Partners
                            </span>

                            <strong>
                                {
                                    inspections.filter(
                                        (item) =>
                                            String(
                                                item.status
                                            ).toLowerCase() ===
                                            "active"
                                    ).length
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="inspection-stat-card">

                        <div className="inspection-stat-icon orange">
                            ○
                        </div>

                        <div>

                            <span>
                                Inactive Partners
                            </span>

                            <strong>
                                {
                                    inspections.filter(
                                        (item) =>
                                            String(
                                                item.status
                                            ).toLowerCase() !==
                                            "active"
                                    ).length
                                }
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ALL INSPECTION PARTNERS */}

                <section className="inspection-content-card">

                    <div className="inspection-card-header">

                        <div>

                            <h2>
                                All Inspection Partners
                            </h2>

                            <p>
                                Registered inspection
                                service providers
                            </p>

                        </div>

                        <span className="inspection-count-badge">
                            {inspections.length}
                        </span>

                    </div>


                    {inspections.length === 0 ? (

                        <div className="inspection-empty">

                            No inspection partners found.

                        </div>

                    ) : (

                        <div className="inspection-table-wrapper">

                            <table className="inspection-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Company
                                        </th>

                                        <th>
                                            Contact Person
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Service Areas
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Created
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {inspections.map(
                                        (inspection) => (

                                            <tr
                                                key={
                                                    inspection.id
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        inspection.id
                                                    }
                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            inspection.company_name ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <div className="inspection-customer">

                                                        <div className="inspection-avatar">

                                                            {
                                                                inspection.contact_person
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    ?.toUpperCase() ||
                                                                "I"
                                                            }

                                                        </div>

                                                        <strong>
                                                            {
                                                                inspection.contact_person ||
                                                                "-"
                                                            }
                                                        </strong>

                                                    </div>

                                                </td>


                                                <td>
                                                    {
                                                        inspection.phone ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        inspection.service_areas ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={`inspection-status ${getStatusClass(
                                                            inspection.status
                                                        )}`}
                                                    >

                                                        {
                                                            inspection.status ||
                                                            "-"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {formatDate(
                                                        inspection.created_at
                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>
        );
    }

    // ======================================
    // PARTICIPANT UI
    // ======================================

    return (

        <div className="inspection-page">

            {/* HEADER */}

            <div className="inspection-header">

                <div>

                    <h1>
                        Inspection Dashboard
                    </h1>

                    <p>
                        Manage your inspection profile
                        and assigned inspections
                    </p>

                </div>

                <button
                    className="inspection-refresh-btn"
                    onClick={loadData}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div className="inspection-error">

                    <strong>
                        Error:
                    </strong>{" "}

                    {error}

                </div>

            )}


            {/* PROFILE */}

            <section className="inspection-profile-card">

                <div className="inspection-section-header">

                    <div className="inspection-section-icon">
                        🔍
                    </div>

                    <div>

                        <h2>
                            Inspection Profile
                        </h2>

                        <p>
                            Your inspection service
                            information
                        </p>

                    </div>

                    {profile && (

                        <span
                            className={`inspection-profile-status ${
                                profile.status?.toLowerCase() ===
                                "active"
                                    ? "active"
                                    : "inactive"
                            }`}
                        >

                            {profile.status}

                        </span>

                    )}

                </div>


                {profile ? (

                    <div className="inspection-profile-grid">

                        <div className="inspection-info-box">

                            <span>
                                Company Name
                            </span>

                            <strong>
                                {profile.company_name || "-"}
                            </strong>

                        </div>


                        <div className="inspection-info-box">

                            <span>
                                Contact Person
                            </span>

                            <strong>
                                {profile.contact_person || "-"}
                            </strong>

                        </div>


                        <div className="inspection-info-box">

                            <span>
                                Phone
                            </span>

                            <strong>
                                {profile.phone || "-"}
                            </strong>

                        </div>


                        <div className="inspection-info-box">

                            <span>
                                Service Areas
                            </span>

                            <strong>
                                {profile.service_areas || "-"}
                            </strong>

                        </div>

                    </div>

                ) : (

                    <div className="inspection-empty">

                        Inspection profile not found.

                    </div>

                )}

            </section>


            {/* STATISTICS */}

            <div className="inspection-stats">

                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon purple">
                        🔍
                    </div>

                    <div>

                        <span>
                            Total Inspections
                        </span>

                        <strong>
                            {totalAssignments}
                        </strong>

                    </div>

                </div>


                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon blue">
                        📋
                    </div>

                    <div>

                        <span>
                            Assigned
                        </span>

                        <strong>
                            {assignedCount}
                        </strong>

                    </div>

                </div>


                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon orange">
                        ⏳
                    </div>

                    <div>

                        <span>
                            In Progress
                        </span>

                        <strong>
                            {inProgressCount}
                        </strong>

                    </div>

                </div>


                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon green">
                        ✓
                    </div>

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedCount}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ASSIGNMENTS */}

            <section className="inspection-content-card">

                <div className="inspection-card-header">

                    <div>

                        <h2>
                            Assigned Inspections
                        </h2>

                        <p>
                            Orders assigned to your
                            inspection service
                        </p>

                    </div>

                    <span className="inspection-count-badge">
                        {assignments.length}
                    </span>

                </div>


                {assignments.length === 0 ? (

                    <div className="inspection-empty">

                        No inspection assignments found.

                    </div>

                ) : (

                    <div className="inspection-table-wrapper">

                        <table className="inspection-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Order ID
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Inspection Type
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

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {assignments.map(
                                    (assignment) => (

                                        <tr
                                            key={
                                                assignment.id
                                            }
                                        >

                                            <td>
                                                #
                                                {
                                                    assignment.id
                                                }
                                            </td>


                                            <td>
                                                #
                                                {
                                                    assignment.order_id
                                                }
                                            </td>


                                            <td>

                                                <div className="inspection-customer">

                                                    <div className="inspection-avatar">

                                                        {
                                                            assignment.customer_name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase() ||
                                                            "C"
                                                        }

                                                    </div>

                                                    <strong>
                                                        {
                                                            assignment.customer_name ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>

                                            </td>


                                            <td>
                                                {
                                                    assignment.inspection_type ||
                                                    "-"
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={`inspection-status ${getStatusClass(
                                                        assignment.status
                                                    )}`}
                                                >

                                                    {
                                                        assignment.status ||
                                                        "-"
                                                    }

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


                                            <td>

                                                <div className="inspection-actions">

                                                    {assignment.status ===
                                                        "Assigned" && (

                                                        <button
                                                            className="inspection-action-btn progress"
                                                            disabled={
                                                                updatingId ===
                                                                assignment.id
                                                            }
                                                            onClick={() =>
                                                                updateAssignmentStatus(
                                                                    assignment.id,
                                                                    "In Progress"
                                                                )
                                                            }
                                                        >

                                                            {
                                                                updatingId ===
                                                                assignment.id
                                                                    ? "Updating..."
                                                                    : "Start"
                                                            }

                                                        </button>

                                                    )}


                                                    {assignment.status ===
                                                        "In Progress" && (

                                                        <button
                                                            className="inspection-action-btn complete"
                                                            disabled={
                                                                updatingId ===
                                                                assignment.id
                                                            }
                                                            onClick={() =>
                                                                updateAssignmentStatus(
                                                                    assignment.id,
                                                                    "Completed"
                                                                )
                                                            }
                                                        >

                                                            {
                                                                updatingId ===
                                                                assignment.id
                                                                    ? "Updating..."
                                                                    : "Complete"
                                                            }

                                                        </button>

                                                    )}


                                                    {assignment.status ===
                                                        "Completed" && (

                                                        <span className="inspection-completed-label">

                                                            ✓ Completed

                                                        </span>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>

    );
};

export default Inspection;