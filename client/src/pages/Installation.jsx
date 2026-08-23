import React, { useEffect, useState } from "react";
import "./Installation.css";

const API_BASE = "http://localhost:5000/api/installation";

const Installation = () => {

    const savedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = savedUser ? JSON.parse(savedUser) : null;
    } catch {
        user = null;
    }

    const isAdmin = user?.role === "admin";

    // ======================================
    // PARTICIPANT STATES
    // ======================================

    const [profile, setProfile] = useState(null);
    const [assignments, setAssignments] = useState([]);

    // ======================================
    // ADMIN STATES
    // ======================================

    const [installations, setInstallations] = useState([]);

    // ======================================
    // COMMON STATES
    // ======================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    // ======================================
    // TOKEN
    // ======================================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("token") ||
            ""
        );
    };

    const getHeaders = () => ({
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    });

    // ======================================
    // ADMIN
    // FETCH ALL INSTALLATION PROVIDERS
    // ======================================

    const fetchAllInstallations = async () => {

        const response = await fetch(
            `${API_BASE}/admin/all`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load installation providers"
            );
        }

        setInstallations(
            Array.isArray(data.installations)
                ? data.installations
                : []
        );
    };

    // ======================================
    // PARTICIPANT
    // FETCH PROFILE
    // ======================================

    const fetchProfile = async () => {

        const response = await fetch(
            `${API_BASE}/profile`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load installation profile"
            );
        }

        setProfile(
            data.installation || null
        );
    };

    // ======================================
    // PARTICIPANT
    // FETCH ASSIGNMENTS
    // ======================================

    const fetchAssignments = async () => {

        const response = await fetch(
            `${API_BASE}/assigned`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load installation assignments"
            );
        }

        setAssignments(
            Array.isArray(data.assignments)
                ? data.assignments
                : Array.isArray(data)
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

                await fetchAllInstallations();

            }

            // ==================================
            // PARTICIPANT
            // ==================================

            else {

                await Promise.all([
                    fetchProfile(),
                    fetchAssignments()
                ]);

            }

        } catch (err) {

            console.error(
                "Installation Load Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load installation data"
            );

        } finally {

            setLoading(false);

        }
    };

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
                        status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update installation assignment"
                );
            }

            setAssignments((prev) =>
                prev.map((assignment) =>
                    assignment.id === assignmentId
                        ? data.assignment
                        : assignment
                )
            );

            alert(
                "Installation Assignment Updated Successfully"
            );

        } catch (err) {

            console.error(
                "Installation Assignment Update Error:",
                err
            );

            setError(
                err.message ||
                "Failed to update installation assignment"
            );

        } finally {

            setUpdatingId(null);

        }
    };

    // ======================================
    // DATE FORMAT
    // ======================================

    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // ======================================
    // LOADING
    // ======================================

    if (loading) {

        return (
            <div className="installation-page">

                <div className="installation-loading">

                    <div className="installation-spinner"></div>

                    <p>
                        Loading Installation Dashboard...
                    </p>

                </div>

            </div>
        );
    }

    // =========================================================
    // ADMIN UI
    // =========================================================

    if (isAdmin) {

        const totalProviders =
            installations.length;

        const activeProviders =
            installations.filter(
                (item) =>
                    String(item.status)
                        .toLowerCase() === "active"
            ).length;

        const inactiveProviders =
            installations.filter(
                (item) =>
                    String(item.status)
                        .toLowerCase() === "inactive"
            ).length;

        return (

            <div className="installation-page">

                {/* HEADER */}

                <div className="installation-header">

                    <div>

                        <h1>
                            Installation Management
                        </h1>

                        <p>
                            Manage installation service providers
                            and installation operations
                        </p>

                    </div>

                    <button
                        className="installation-refresh-btn"
                        onClick={loadData}
                    >
                        ↻ Refresh
                    </button>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="installation-error">

                        <strong>
                            Error:
                        </strong>{" "}
                        {error}

                    </div>
                )}

                {/* STATS */}

                <div className="installation-stats">

                    <div className="installation-stat-card">

                        <div className="installation-stat-icon purple">
                            🔧
                        </div>

                        <div>

                            <span>
                                Total Providers
                            </span>

                            <strong>
                                {totalProviders}
                            </strong>

                        </div>

                    </div>


                    <div className="installation-stat-card">

                        <div className="installation-stat-icon green">
                            ✓
                        </div>

                        <div>

                            <span>
                                Active
                            </span>

                            <strong>
                                {activeProviders}
                            </strong>

                        </div>

                    </div>


                    <div className="installation-stat-card">

                        <div className="installation-stat-icon orange">
                            ⏸
                        </div>

                        <div>

                            <span>
                                Inactive
                            </span>

                            <strong>
                                {inactiveProviders}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* PROVIDERS */}

                <section className="installation-content-card">

                    <div className="installation-card-header">

                        <div>

                            <h2>
                                Installation Providers
                            </h2>

                            <p>
                                All registered installation
                                service providers
                            </p>

                        </div>

                        <span className="installation-count-badge">
                            {installations.length}
                        </span>

                    </div>


                    {installations.length === 0 ? (

                        <div className="installation-empty">

                            No installation providers found.

                        </div>

                    ) : (

                        <div className="installation-table-wrapper">

                            <table className="installation-table">

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

                                    {installations.map(
                                        (installation) => (

                                            <tr
                                                key={
                                                    installation.id
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        installation.id
                                                    }
                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            installation.company_name ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </td>


                                                <td>
                                                    {
                                                        installation.contact_person ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        installation.phone ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        installation.service_areas ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={`installation-status ${
                                                            String(
                                                                installation.status ||
                                                                ""
                                                            )
                                                                .toLowerCase()
                                                        }`}
                                                    >
                                                        {
                                                            installation.status ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    {formatDate(
                                                        installation.created_at
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

    // =========================================================
    // PARTICIPANT UI
    // =========================================================

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

    return (

        <div className="installation-page">

            {/* HEADER */}

            <div className="installation-header">

                <div>

                    <h1>
                        Installation Dashboard
                    </h1>

                    <p>
                        Manage your installation profile
                        and assigned installations
                    </p>

                </div>

                <button
                    className="installation-refresh-btn"
                    onClick={loadData}
                >
                    ↻ Refresh
                </button>

            </div>

            {/* ERROR */}

            {error && (

                <div className="installation-error">

                    <strong>
                        Error:
                    </strong>{" "}
                    {error}

                </div>

            )}

            {/* PROFILE */}

            <section className="installation-profile-card">

                <div className="installation-section-header">

                    <div className="installation-section-icon">
                        🔧
                    </div>

                    <div>

                        <h2>
                            Installation Profile
                        </h2>

                        <p>
                            Your installation service
                            information
                        </p>

                    </div>

                    {profile && (

                        <span
                            className={`installation-profile-status ${
                                String(
                                    profile.status || ""
                                ).toLowerCase() === "active"
                                    ? "active"
                                    : "inactive"
                            }`}
                        >
                            {profile.status}
                        </span>

                    )}

                </div>


                {profile ? (

                    <div className="installation-profile-grid">

                        <div className="installation-info-box">

                            <span>
                                Company Name
                            </span>

                            <strong>
                                {
                                    profile.company_name ||
                                    "-"
                                }
                            </strong>

                        </div>


                        <div className="installation-info-box">

                            <span>
                                Contact Person
                            </span>

                            <strong>
                                {
                                    profile.contact_person ||
                                    "-"
                                }
                            </strong>

                        </div>


                        <div className="installation-info-box">

                            <span>
                                Phone
                            </span>

                            <strong>
                                {
                                    profile.phone ||
                                    "-"
                                }
                            </strong>

                        </div>


                        <div className="installation-info-box">

                            <span>
                                Status
                            </span>

                            <strong>
                                {
                                    profile.status ||
                                    "-"
                                }
                            </strong>

                        </div>


                        <div className="installation-info-box full">

                            <span>
                                Service Areas
                            </span>

                            <strong>
                                {
                                    profile.service_areas ||
                                    "-"
                                }
                            </strong>

                        </div>

                    </div>

                ) : (

                    <div className="installation-empty">
                        Installation profile not found.
                    </div>

                )}

            </section>


            {/* STATISTICS */}

            <div className="installation-stats">

                <div className="installation-stat-card">

                    <div className="installation-stat-icon purple">
                        🔧
                    </div>

                    <div>

                        <span>
                            Total Installations
                        </span>

                        <strong>
                            {totalAssignments}
                        </strong>

                    </div>

                </div>


                <div className="installation-stat-card">

                    <div className="installation-stat-icon blue">
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


                <div className="installation-stat-card">

                    <div className="installation-stat-icon orange">
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


                <div className="installation-stat-card">

                    <div className="installation-stat-icon green">
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

            <section className="installation-content-card">

                <div className="installation-card-header">

                    <div>

                        <h2>
                            Assigned Installations
                        </h2>

                        <p>
                            Orders assigned to your
                            installation service
                        </p>

                    </div>

                    <span className="installation-count-badge">
                        {assignments.length}
                    </span>

                </div>


                {assignments.length === 0 ? (

                    <div className="installation-empty">

                        No installation assignments found.

                    </div>

                ) : (

                    <div className="installation-table-wrapper">

                        <table className="installation-table">

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
                                                assignment.id ||
                                                assignment.assignment_id
                                            }
                                        >

                                            <td>
                                                #
                                                {
                                                    assignment.id ||
                                                    assignment.assignment_id
                                                }
                                            </td>


                                            <td>
                                                #
                                                {
                                                    assignment.order_id ||
                                                    "-"
                                                }
                                            </td>


                                            <td>

                                                <strong>
                                                    {
                                                        assignment.customer_name ||
                                                        "-"
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                <span
                                                    className={`installation-status ${
                                                        String(
                                                            assignment.status ||
                                                            ""
                                                        )
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s+/g,
                                                                "-"
                                                            )
                                                    }`}
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

                                                {assignment.status ===
                                                    "Assigned" && (

                                                        <button
                                                            className="installation-action-btn progress"
                                                            disabled={
                                                                updatingId ===
                                                                (
                                                                    assignment.id ||
                                                                    assignment.assignment_id
                                                                )
                                                            }
                                                            onClick={() =>
                                                                updateAssignmentStatus(
                                                                    assignment.id ||
                                                                    assignment.assignment_id,
                                                                    "In Progress"
                                                                )
                                                            }
                                                        >
                                                            {updatingId ===
                                                                (
                                                                    assignment.id ||
                                                                    assignment.assignment_id
                                                                )
                                                                ? "Updating..."
                                                                : "Start"}
                                                        </button>

                                                    )}


                                                {assignment.status ===
                                                    "In Progress" && (

                                                        <button
                                                            className="installation-action-btn complete"
                                                            disabled={
                                                                updatingId ===
                                                                (
                                                                    assignment.id ||
                                                                    assignment.assignment_id
                                                                )
                                                            }
                                                            onClick={() =>
                                                                updateAssignmentStatus(
                                                                    assignment.id ||
                                                                    assignment.assignment_id,
                                                                    "Completed"
                                                                )
                                                            }
                                                        >
                                                            {updatingId ===
                                                                (
                                                                    assignment.id ||
                                                                    assignment.assignment_id
                                                                )
                                                                ? "Updating..."
                                                                : "Complete"}
                                                        </button>

                                                    )}


                                                {assignment.status ===
                                                    "Completed" && (

                                                        <span className="installation-completed-label">
                                                            ✓ Completed
                                                        </span>

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
};

export default Installation;