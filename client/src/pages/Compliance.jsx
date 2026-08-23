import React, { useEffect, useState } from "react";
import "./Compliance.css";

const API_BASE = "http://localhost:5000/api/compliance";

const Compliance = () => {

    const [user, setUser] = useState(null);

    const [profile, setProfile] = useState(null);
    const [compliances, setCompliances] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);


    // ======================================
    // Get Token
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
    // Headers
    // ======================================

    const getHeaders = () => ({
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
    });


    // ======================================
    // Get Logged In User
    // ======================================

    useEffect(() => {

        const savedUser =
            localStorage.getItem("user");

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error(
                    "User Parse Error:",
                    error
                );
            }
        }

    }, []);


    // ======================================
    // Check Admin
    // ======================================

    const isAdmin =
        user?.role?.toLowerCase() === "admin";


    // ======================================
    // ADMIN
    // Fetch All Compliance Partners
    // ======================================

    const fetchAllCompliances = async () => {

        const response = await fetch(
            `${API_BASE}/all`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load compliance partners"
            );
        }

        setCompliances(
            Array.isArray(data.compliances)
                ? data.compliances
                : []
        );
    };


    // ======================================
    // PARTICIPANT
    // Fetch Own Profile
    // ======================================

    const fetchProfile = async () => {

        const response = await fetch(
            `${API_BASE}/profile`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load compliance profile"
            );
        }

        setProfile(
            data.compliance || null
        );
    };


    // ======================================
    // PARTICIPANT
    // Fetch Assignments
    // ======================================

    const fetchAssignments = async () => {

        const response = await fetch(
            `${API_BASE}/assigned`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load compliance assignments"
            );
        }

        setAssignments(
            Array.isArray(data)
                ? data
                : []
        );
    };


    // ======================================
    // Load Data
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


            // ADMIN
            if (isAdmin) {

                await fetchAllCompliances();

            }

            // PARTICIPANT
            else {

                await Promise.all([
                    fetchProfile(),
                    fetchAssignments()
                ]);

            }

        } catch (err) {

            console.error(
                "Compliance Load Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load compliance data"
            );

        } finally {

            setLoading(false);

        }
    };


    // ======================================
    // Load After User Available
    // ======================================

    useEffect(() => {

        if (user) {
            loadData();
        }

    }, [user]);


    // ======================================
    // Statistics
    // ======================================

    const totalPartners =
        compliances.length;

    const activePartners =
        compliances.filter(
            item =>
                String(item.status)
                    .toLowerCase() === "active"
        ).length;

    const inactivePartners =
        compliances.filter(
            item =>
                String(item.status)
                    .toLowerCase() === "inactive"
        ).length;


    const totalAssignments =
        assignments.length;

    const assignedCount =
        assignments.filter(
            item =>
                item.status === "Assigned"
        ).length;

    const completedCount =
        assignments.filter(
            item =>
                item.status === "Completed"
        ).length;


    // ======================================
    // Date Formatter
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
    // Loading
    // ======================================

    if (loading) {

        return (
            <div className="compliance-page">

                <div className="compliance-loading">

                    <div className="compliance-spinner"></div>

                    <p>
                        Loading Compliance Dashboard...
                    </p>

                </div>

            </div>
        );
    }


    // ======================================
    // UI
    // ======================================

    return (

        <div className="compliance-page">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="compliance-header">

                <div>

                    <h1>
                        Compliance Dashboard
                    </h1>

                    <p>
                        Manage compliance partners,
                        services and compliance operations
                    </p>

                </div>

                <button
                    className="compliance-refresh-btn"
                    onClick={loadData}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="compliance-error">

                    <strong>
                        Error:
                    </strong>{" "}

                    {error}

                </div>

            )}


            {/* ======================================
                ADMIN VIEW
            ====================================== */}

            {isAdmin ? (

                <>

                    {/* ==================================
                        ADMIN STATS
                    ================================== */}

                    <div className="compliance-stats">


                        <div className="compliance-stat-card">

                            <div className="compliance-stat-icon purple">
                                ⚖
                            </div>

                            <div>

                                <span>
                                    Total Partners
                                </span>

                                <strong>
                                    {totalPartners}
                                </strong>

                            </div>

                        </div>


                        <div className="compliance-stat-card">

                            <div className="compliance-stat-icon green">
                                ✓
                            </div>

                            <div>

                                <span>
                                    Active Partners
                                </span>

                                <strong>
                                    {activePartners}
                                </strong>

                            </div>

                        </div>


                        <div className="compliance-stat-card">

                            <div className="compliance-stat-icon orange">
                                ⏸
                            </div>

                            <div>

                                <span>
                                    Inactive Partners
                                </span>

                                <strong>
                                    {inactivePartners}
                                </strong>

                            </div>

                        </div>


                    </div>


                    {/* ==================================
                        ADMIN PARTNER TABLE
                    ================================== */}

                    <section className="compliance-content-card">

                        <div className="compliance-card-header">

                            <div>

                                <h2>
                                    Compliance Partners
                                </h2>

                                <p>
                                    All registered compliance
                                    service providers
                                </p>

                            </div>

                            <span className="compliance-count-badge">
                                {compliances.length}
                            </span>

                        </div>


                        {compliances.length === 0 ? (

                            <div className="compliance-empty">

                                No compliance partners found.

                            </div>

                        ) : (

                            <div className="compliance-table-wrapper">

                                <table className="compliance-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                ID
                                            </th>

                                            <th>
                                                Company
                                            </th>

                                            <th>
                                                Contact
                                            </th>

                                            <th>
                                                Phone
                                            </th>

                                            <th>
                                                Compliance Types
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

                                        {compliances.map(
                                            (item) => (

                                                <tr
                                                    key={item.id}
                                                >

                                                    <td>
                                                        #{item.id}
                                                    </td>


                                                    <td>

                                                        <div className="compliance-company">

                                                            <div className="compliance-avatar">
                                                                {item.company_name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase() ||
                                                                    "C"}
                                                            </div>

                                                            <strong>
                                                                {item.company_name ||
                                                                    "-"}
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    <td>
                                                        {item.contact_person ||
                                                            "-"}
                                                    </td>


                                                    <td>
                                                        {item.phone ||
                                                            "-"}
                                                    </td>


                                                    <td>
                                                        {item.compliance_types ||
                                                            "-"}
                                                    </td>


                                                    <td>
                                                        {item.service_areas ||
                                                            "-"}
                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`compliance-status ${
                                                                String(
                                                                    item.status ||
                                                                    ""
                                                                )
                                                                    .toLowerCase()
                                                            }`}
                                                        >
                                                            {item.status ||
                                                                "-"}
                                                        </span>

                                                    </td>


                                                    <td>
                                                        {formatDate(
                                                            item.created_at
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

                </>

            ) : (

                /* ======================================
                   PARTICIPANT VIEW
                ====================================== */

                <>

                    {/* ==================================
                        PROFILE
                    ================================== */}

                    <section className="compliance-profile-card">

                        <div className="compliance-section-header">

                            <div className="compliance-section-icon">
                                ⚖
                            </div>

                            <div>

                                <h2>
                                    Compliance Profile
                                </h2>

                                <p>
                                    Your compliance service
                                    information
                                </p>

                            </div>


                            {profile && (

                                <span
                                    className={`compliance-profile-status ${
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

                            <div className="compliance-profile-grid">


                                <div className="compliance-info-box">

                                    <span>
                                        Company Name
                                    </span>

                                    <strong>
                                        {profile.company_name ||
                                            "-"}
                                    </strong>

                                </div>


                                <div className="compliance-info-box">

                                    <span>
                                        Contact Person
                                    </span>

                                    <strong>
                                        {profile.contact_person ||
                                            "-"}
                                    </strong>

                                </div>


                                <div className="compliance-info-box">

                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        {profile.phone ||
                                            "-"}
                                    </strong>

                                </div>


                                <div className="compliance-info-box">

                                    <span>
                                        Compliance Types
                                    </span>

                                    <strong>
                                        {profile.compliance_types ||
                                            "-"}
                                    </strong>

                                </div>


                                <div className="compliance-info-box">

                                    <span>
                                        Service Areas
                                    </span>

                                    <strong>
                                        {profile.service_areas ||
                                            "-"}
                                    </strong>

                                </div>


                            </div>

                        ) : (

                            <div className="compliance-empty">

                                Compliance profile not found.

                            </div>

                        )}

                    </section>


                    {/* ==================================
                        PARTICIPANT STATS
                    ================================== */}

                    <div className="compliance-stats">


                        <div className="compliance-stat-card">

                            <div className="compliance-stat-icon purple">
                                ⚖
                            </div>

                            <div>

                                <span>
                                    Total Tasks
                                </span>

                                <strong>
                                    {totalAssignments}
                                </strong>

                            </div>

                        </div>


                        <div className="compliance-stat-card">

                            <div className="compliance-stat-icon blue">
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


                        <div className="compliance-stat-card">

                            <div className="compliance-stat-icon green">
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


                    {/* ==================================
                        ASSIGNMENTS
                    ================================== */}

                    <section className="compliance-content-card">

                        <div className="compliance-card-header">

                            <div>

                                <h2>
                                    Assigned Compliance Tasks
                                </h2>

                                <p>
                                    Compliance tasks assigned
                                    to your service
                                </p>

                            </div>

                            <span className="compliance-count-badge">
                                {assignments.length}
                            </span>

                        </div>


                        {assignments.length === 0 ? (

                            <div className="compliance-empty">

                                No compliance assignments found.

                            </div>

                        ) : (

                            <div className="compliance-table-wrapper">

                                <table className="compliance-table">

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
                                                Compliance Type
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

                                        {assignments.map(
                                            (assignment) => (

                                                <tr
                                                    key={assignment.id}
                                                >

                                                    <td>
                                                        #{assignment.id}
                                                    </td>

                                                    <td>
                                                        #{assignment.order_id}
                                                    </td>

                                                    <td>

                                                        <div className="compliance-company">

                                                            <div className="compliance-avatar">
                                                                {assignment.customer_name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase() ||
                                                                    "C"}
                                                            </div>

                                                            <strong>
                                                                {assignment.customer_name ||
                                                                    "-"}
                                                            </strong>

                                                        </div>

                                                    </td>

                                                    <td>
                                                        {assignment.compliance_type ||
                                                            "-"}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`compliance-status ${
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
                                                            {assignment.status ||
                                                                "-"}
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

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

                </>

            )}

        </div>
    );
};

export default Compliance;