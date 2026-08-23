import React, { useEffect, useState } from "react";
import "./Repair.css";

const API_BASE = "http://localhost:5000/api/repair";

const Repair = () => {
    const [profile, setProfile] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [repairs, setRepairs] = useState([]);

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
        try {
            const savedUser = localStorage.getItem("user");

            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    };

    // ======================================
    // GET HEADERS
    // ======================================

    const getHeaders = () => {
        const token = getToken();

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    };

    // ======================================
    // FETCH ADMIN REPAIR DATA
    // ======================================

    const fetchAdminRepairData = async () => {
        try {
            const response = await fetch(
                `${API_BASE}/all`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load repair partners."
                );
            }

            setRepairs(
                Array.isArray(data.repairs)
                    ? data.repairs
                    : []
            );

            setProfile(null);
            setAssignments([]);

        } catch (err) {
            console.error(
                "Admin Repair Fetch Error:",
                err
            );

            throw err;
        }
    };

    // ======================================
    // FETCH PARTICIPANT REPAIR DATA
    // ======================================

    const fetchParticipantRepairData = async () => {
        try {
            const headers = getHeaders();

            const [
                profileRes,
                assignmentRes
            ] = await Promise.all([
                fetch(
                    `${API_BASE}/profile`,
                    {
                        method: "GET",
                        headers
                    }
                ),

                fetch(
                    `${API_BASE}/assigned`,
                    {
                        method: "GET",
                        headers
                    }
                )
            ]);

            if (
                profileRes.status === 401 ||
                assignmentRes.status === 401
            ) {
                throw new Error(
                    "Invalid or expired token. Please login again."
                );
            }

            // ==================================
            // PROFILE
            // ==================================

            let profileData = null;

            if (profileRes.ok) {
                profileData =
                    await profileRes.json();
            } else {

                const data =
                    await profileRes.json()
                        .catch(() => ({}));

                if (profileRes.status !== 404) {
                    throw new Error(
                        data.message ||
                        "Failed to load repair profile."
                    );
                }
            }

            // ==================================
            // ASSIGNMENTS
            // ==================================

            let assignmentData = [];

            if (assignmentRes.ok) {

                const data =
                    await assignmentRes.json();

                assignmentData =
                    Array.isArray(data)
                        ? data
                        : [];

            } else {

                const data =
                    await assignmentRes.json()
                        .catch(() => ({}));

                throw new Error(
                    data.message ||
                    "Failed to load repair assignments."
                );
            }

            setProfile(
                profileData?.repair || null
            );

            setAssignments(
                assignmentData
            );

            setRepairs([]);

        } catch (err) {

            console.error(
                "Participant Repair Fetch Error:",
                err
            );

            throw err;
        }
    };

    // ======================================
    // FETCH REPAIR DATA
    // ======================================

    const fetchRepairData = async () => {

        try {

            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError(
                    "Authentication token not found. Please login again."
                );

                return;
            }

            const user = getUser();

            console.log(
                "REPAIR CURRENT USER:",
                user
            );

            // ==================================
            // ADMIN
            // ==================================

            if (
                user?.role?.toLowerCase() === "admin"
            ) {

                await fetchAdminRepairData();

            }

            // ==================================
            // PARTICIPANT
            // ==================================

            else {

                await fetchParticipantRepairData();

            }

        } catch (err) {

            console.error(
                "Repair Fetch Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load repair module."
            );

        } finally {

            setLoading(false);

        }
    };

    // ======================================
    // INITIAL LOAD
    // ======================================

    useEffect(() => {

        fetchRepairData();

    }, []);

    // ======================================
    // UPDATE ASSIGNMENT STATUS
    // PARTICIPANT ONLY
    // ======================================

    const updateAssignmentStatus = async (
        assignmentId,
        status
    ) => {

        try {

            setUpdatingId(assignmentId);
            setError("");

            const response =
                await fetch(
                    `${API_BASE}/assign/${assignmentId}`,
                    {
                        method: "PUT",
                        headers: getHeaders(),
                        body: JSON.stringify({
                            status
                        })
                    }
                );

            const data =
                await response.json()
                    .catch(() => ({}));

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update repair assignment."
                );

            }

            setAssignments((prev) =>
                prev.map(
                    (assignment) =>
                        assignment.id ===
                        assignmentId
                            ? {
                                  ...assignment,
                                  status:
                                      data.assignment
                                          ?.status ||
                                      status,

                                  completed_at:
                                      data.assignment
                                          ?.completed_at ||
                                      null
                              }
                            : assignment
                )
            );

        } catch (err) {

            console.error(
                "Repair Assignment Update Error:",
                err
            );

            setError(
                err.message ||
                "Failed to update assignment."
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

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    };

    // ======================================
    // STATUS CLASS
    // ======================================

    const getStatusClass = (status) => {

        return (status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    // ======================================
    // USER ROLE
    // ======================================

    const user = getUser();

    const isAdmin =
        user?.role?.toLowerCase() === "admin";

    // ======================================
    // PARTICIPANT STATISTICS
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
    // ADMIN STATISTICS
    // ======================================

    const totalRepairPartners =
        repairs.length;

    const activeRepairPartners =
        repairs.filter(
            (item) =>
                item.status === "Active"
        ).length;

    const inactiveRepairPartners =
        repairs.filter(
            (item) =>
                item.status === "Inactive"
        ).length;

    // ======================================
    // LOADING
    // ======================================

    if (loading) {

        return (
            <div className="repair-page">

                <div className="repair-loading">

                    <div className="repair-spinner"></div>

                    <p>
                        Loading Repair Module...
                    </p>

                </div>

            </div>
        );
    }

    // =========================================================
    // ADMIN PAGE
    // =========================================================

    if (isAdmin) {

        return (
            <div className="repair-page">

                {/* HEADER */}

                <div className="repair-header">

                    <div>

                        <h1>
                            Repair
                        </h1>

                        <p>
                            Manage repair partners and repair services
                        </p>

                    </div>

                    <button
                        className="repair-refresh-btn"
                        onClick={fetchRepairData}
                    >
                        ↻ Refresh
                    </button>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="repair-error">

                        <strong>
                            Error:
                        </strong>{" "}

                        {error}

                    </div>
                )}

                {/* ADMIN STATS */}

                <div className="repair-stats">

                    <div className="repair-stat-card">

                        <div className="stat-icon purple">
                            🔧
                        </div>

                        <div>

                            <span>
                                Total Repair Partners
                            </span>

                            <strong>
                                {totalRepairPartners}
                            </strong>

                        </div>

                    </div>

                    <div className="repair-stat-card">

                        <div className="stat-icon green">
                            ✓
                        </div>

                        <div>

                            <span>
                                Active
                            </span>

                            <strong>
                                {activeRepairPartners}
                            </strong>

                        </div>

                    </div>

                    <div className="repair-stat-card">

                        <div className="stat-icon orange">
                            ⏸
                        </div>

                        <div>

                            <span>
                                Inactive
                            </span>

                            <strong>
                                {inactiveRepairPartners}
                            </strong>

                        </div>

                    </div>

                    <div className="repair-stat-card">

                        <div className="stat-icon blue">
                            📋
                        </div>

                        <div>

                            <span>
                                Registered Services
                            </span>

                            <strong>
                                {totalRepairPartners}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* REPAIR PARTNERS */}

                <section className="repair-content-card">

                    <div className="repair-card-header">

                        <div>

                            <h2>
                                Repair Partners
                            </h2>

                            <p>
                                All registered repair service providers
                            </p>

                        </div>

                        <span className="count-badge">
                            {repairs.length}
                        </span>

                    </div>

                    {repairs.length > 0 ? (

                        <div className="repair-table-wrapper">

                            <table className="repair-table">

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

                                    {repairs.map(
                                        (repair) => (

                                            <tr
                                                key={
                                                    repair.id
                                                }
                                            >

                                                <td>
                                                    #{repair.id}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            repair.company_name ||
                                                            "-"
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        repair.contact_person ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        repair.phone ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        repair.service_areas ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={`table-status ${getStatusClass(
                                                            repair.status
                                                        )}`}
                                                    >
                                                        {
                                                            repair.status ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {formatDate(
                                                        repair.created_at
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="repair-empty">

                            No repair partners found.

                        </div>

                    )}

                </section>

            </div>
        );
    }

    // =========================================================
    // PARTICIPANT PAGE
    // =========================================================

    return (

        <div className="repair-page">

            {/* HEADER */}

            <div className="repair-header">

                <div>

                    <h1>
                        Repair
                    </h1>

                    <p>
                        Manage your repair service, assignments and work status
                    </p>

                </div>

                <button
                    className="repair-refresh-btn"
                    onClick={fetchRepairData}
                >
                    ↻ Refresh
                </button>

            </div>

            {/* ERROR */}

            {error && (

                <div className="repair-error">

                    <strong>
                        Error:
                    </strong>{" "}

                    {error}

                </div>

            )}

            {/* PROFILE */}

            <section className="repair-profile-card">

                <div className="repair-section-title">

                    <div className="section-icon">
                        🔧
                    </div>

                    <div>

                        <h2>
                            Repair Service Profile
                        </h2>

                        <p>
                            Your repair service information
                        </p>

                    </div>

                    {profile && (

                        <span
                            className={`repair-status ${
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

                    <div className="repair-profile-grid">

                        <div className="repair-info-box">

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

                        <div className="repair-info-box">

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

                        <div className="repair-info-box">

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

                        <div className="repair-info-box">

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

                        <div className="repair-info-box full-width">

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

                    <div className="repair-empty">

                        Repair service profile not found.

                    </div>

                )}

            </section>

            {/* PARTICIPANT STATS */}

            <div className="repair-stats">

                <div className="repair-stat-card">

                    <div className="stat-icon purple">
                        🔧
                    </div>

                    <div>

                        <span>
                            Total Repairs
                        </span>

                        <strong>
                            {totalAssignments}
                        </strong>

                    </div>

                </div>

                <div className="repair-stat-card">

                    <div className="stat-icon blue">
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

                <div className="repair-stat-card">

                    <div className="stat-icon orange">
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

                <div className="repair-stat-card">

                    <div className="stat-icon green">
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

            <section className="repair-content-card">

                <div className="repair-card-header">

                    <div>

                        <h2>
                            Repair Assignments
                        </h2>

                        <p>
                            Orders assigned to your repair service
                        </p>

                    </div>

                    <span className="count-badge">
                        {assignments.length}
                    </span>

                </div>

                {assignments.length > 0 ? (

                    <div className="repair-table-wrapper">

                        <table className="repair-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Repair Type
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
                                                #{assignment.id}
                                            </td>

                                            <td>
                                                <strong>
                                                    Order #
                                                    {
                                                        assignment.order_id
                                                    }
                                                </strong>
                                            </td>

                                            <td>

                                                <div className="customer-name">

                                                    <div className="customer-avatar">

                                                        {assignment.customer_name
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "C"}

                                                    </div>

                                                    <span>
                                                        {
                                                            assignment.customer_name ||
                                                            "-"
                                                        }
                                                    </span>

                                                </div>

                                            </td>

                                            <td>
                                                {
                                                    assignment.repair_type ||
                                                    "-"
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={`table-status ${getStatusClass(
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

                                                <div className="repair-actions">

                                                    {assignment.status ===
                                                        "Assigned" && (

                                                        <button
                                                            className="action-btn progress-btn"
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
                                                            className="action-btn complete-btn"
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

                                                        <span className="completed-label">
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

                ) : (

                    <div className="repair-empty">

                        No repair assignments found.

                    </div>

                )}

            </section>

        </div>
    );
};

export default Repair;