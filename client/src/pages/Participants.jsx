
import { useEffect, useMemo, useState } from "react";
import "./Participant.css";

const API_URL = "http://localhost:5000/api/participants";
const USERS_API_URL = "http://localhost:5000/api/users";

const PARTICIPANT_TYPES = [
    { id: 1, name: "Seller" },
    { id: 2, name: "Warehouse" },
    { id: 3, name: "Logistics" },
    { id: 4, name: "Packaging" },
    { id: 5, name: "Marketing" },
    { id: 6, name: "Affiliate" },
    { id: 7, name: "Inspection" },
    { id: 8, name: "Repair" },
    { id: 9, name: "Installation" },
];

function Participants() {
    const [participants, setParticipants] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        user_id: "",
        participant_type_id: "",
        company_name: "",
        contact_person: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
    });

    const [editFormData, setEditFormData] = useState({
        company_name: "",
        contact_person: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        status: "Active",
    });

    // =====================================================
    // GET TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =====================================================
    // FETCH PARTICIPANTS
    // =====================================================

    const fetchParticipants = async () => {
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
                    data.message || "Failed to fetch participants."
                );
            }

            setParticipants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch Participants Error:", err);
            setError(err.message || "Unable to load participants.");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FETCH USERS
    // =====================================================

    const fetchUsers = async () => {
        const token = getToken();

        if (!token) {
            return;
        }

        try {
            setUsersLoading(true);

            const response = await fetch(USERS_API_URL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch users."
                );
            }

            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch Users Error:", err);
            alert("Unable to load users.");
        } finally {
            setUsersLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchParticipants();
        fetchUsers();
    }, []);

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEditInputChange = (event) => {
        const { name, value } = event.target;

        setEditFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =====================================================
    // OPEN ADD MODAL
    // =====================================================

    const handleOpenAddModal = () => {
        setFormData({
            user_id: "",
            participant_type_id: "",
            company_name: "",
            contact_person: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            country: "",
        });

        setShowAddModal(true);
    };

    // =====================================================
    // ADD PARTICIPANT
    // =====================================================

    const handleAddParticipant = async (event) => {
        event.preventDefault();

        const token = getToken();

        if (!token) {
            alert("Authentication token not found.");
            return;
        }

        if (!formData.user_id) {
            alert("Please select a user.");
            return;
        }

        if (!formData.participant_type_id) {
            alert("Please select a participant type.");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    user_id: Number(formData.user_id),
                    participant_type_id: Number(
                        formData.participant_type_id
                    ),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to create participant."
                );
                return;
            }

            alert("Participant created successfully.");

            setFormData({
                user_id: "",
                participant_type_id: "",
                company_name: "",
                contact_person: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                country: "",
            });

            setShowAddModal(false);

            fetchParticipants();
        } catch (err) {
            console.error("Create Participant Error:", err);
            alert("Unable to connect to server.");
        }
    };

    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================

    const handleEditParticipant = (participant) => {
        setEditingId(participant.id);

        setEditFormData({
            company_name: participant.company_name || "",
            contact_person: participant.contact_person || "",
            phone: participant.phone || "",
            address: participant.address || "",
            city: participant.city || "",
            state: participant.state || "",
            country: participant.country || "",
            status: participant.status || "Active",
        });

        setShowEditModal(true);
    };

    // =====================================================
    // UPDATE PARTICIPANT
    // =====================================================

    const handleUpdateParticipant = async (event) => {
        event.preventDefault();

        const token = getToken();

        if (!token) {
            alert("Authentication token not found.");
            return;
        }

        if (!editingId) {
            alert("Participant ID not found.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editFormData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to update participant."
                );
                return;
            }

            alert("Participant updated successfully.");

            setShowEditModal(false);
            setEditingId(null);

            fetchParticipants();
        } catch (err) {
            console.error("Update Participant Error:", err);
            alert("Unable to connect to server.");
        }
    };

    // =====================================================
    // DELETE PARTICIPANT
    // =====================================================

    const handleDeleteParticipant = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this participant?"
        );

        if (!confirmed) {
            return;
        }

        const token = getToken();

        if (!token) {
            alert("Authentication token not found.");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to delete participant."
                );
                return;
            }

            alert("Participant deleted successfully.");

            fetchParticipants();
        } catch (err) {
            console.error("Delete Participant Error:", err);
            alert("Unable to connect to server.");
        }
    };

    // =====================================================
    // SEARCH + FILTER
    // =====================================================

    const filteredParticipants = useMemo(() => {
        return participants.filter((participant) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                (participant.full_name || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (participant.email || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (participant.company_name || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (participant.phone || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (participant.city || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "all" ||
                participant.status === statusFilter;

            const matchesType =
                typeFilter === "all" ||
                participant.participant_type === typeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );
        });
    }, [
        participants,
        search,
        statusFilter,
        typeFilter,
    ]);

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalParticipants = participants.length;

    const activeParticipants = participants.filter(
        (participant) =>
            participant.status === "Active"
    ).length;

    const inactiveParticipants = participants.filter(
        (participant) =>
            participant.status !== "Active"
    ).length;

    const participantTypes = [
        ...new Set(
            participants
                .map(
                    (participant) =>
                        participant.participant_type
                )
                .filter(Boolean)
        ),
    ];

    // =====================================================
    // INITIALS
    // =====================================================

    const getInitials = (name) => {
        if (!name) {
            return "P";
        }

        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="participants-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="participants-header">

                <div>
                    <span className="participants-eyebrow">
                        NICECOMM COMMERCE OS
                    </span>

                    <h1>Participants</h1>

                    <p>
                        Manage sellers, warehouses and
                        other commerce ecosystem participants.
                    </p>
                </div>

                <button
                    className="add-participant-button"
                    onClick={handleOpenAddModal}
                >
                    <span>+</span>
                    Add Participant
                </button>

            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="participant-stats">

                <div className="participant-stat-card">

                    <div className="participant-stat-icon purple">
                        👥
                    </div>

                    <div>
                        <span>Total Participants</span>

                        <strong>
                            {totalParticipants}
                        </strong>
                    </div>

                </div>

                <div className="participant-stat-card">

                    <div className="participant-stat-icon green">
                        ✓
                    </div>

                    <div>
                        <span>Active</span>

                        <strong>
                            {activeParticipants}
                        </strong>
                    </div>

                </div>

                <div className="participant-stat-card">

                    <div className="participant-stat-icon orange">
                        !
                    </div>

                    <div>
                        <span>Inactive</span>

                        <strong>
                            {inactiveParticipants}
                        </strong>
                    </div>

                </div>

            </section>

            {/* =================================================
                FILTERS
            ================================================= */}

            <section className="participants-toolbar">

                <div className="participant-search">

                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Search participant..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                >
                    <option value="all">
                        All Status
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Inactive">
                        Inactive
                    </option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(event) =>
                        setTypeFilter(event.target.value)
                    }
                >
                    <option value="all">
                        All Types
                    </option>

                    {participantTypes.map((type) => (
                        <option
                            key={type}
                            value={type}
                        >
                            {type}
                        </option>
                    ))}
                </select>

                <button
                    className="refresh-button"
                    onClick={fetchParticipants}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="participant-error">

                    <div>
                        <strong>
                            Unable to load participants
                        </strong>

                        <p>{error}</p>
                    </div>

                    <button
                        onClick={fetchParticipants}
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
                <div className="participant-loading">

                    <div className="loading-spinner" />

                    <p>
                        Loading participants...
                    </p>

                </div>
            )}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
                !error &&
                filteredParticipants.length === 0 && (
                    <div className="participant-empty">

                        <div className="empty-icon">
                            👥
                        </div>

                        <h3>
                            No participants found
                        </h3>

                        <p>
                            Try changing your search
                            or add a new participant.
                        </p>

                    </div>
                )}

            {/* =================================================
                TABLE
            ================================================= */}

            {!loading &&
                !error &&
                filteredParticipants.length > 0 && (
                    <section className="participants-table-card">

                        <div className="table-heading">

                            <div>
                                <span>
                                    PARTICIPANT DIRECTORY
                                </span>

                                <h2>
                                    All Participants
                                </h2>
                            </div>

                            <strong>
                                {filteredParticipants.length}{" "}
                                records
                            </strong>

                        </div>

                        <div className="participants-table-wrapper">

                            <table className="participants-table">

                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Participant</th>
                                        <th>Type</th>
                                        <th>Company</th>
                                        <th>Phone</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredParticipants.map(
                                        (participant) => (
                                            <tr
                                                key={
                                                    participant.id
                                                }
                                            >

                                                <td>
                                                    <span className="participant-id">
                                                        #
                                                        {
                                                            participant.id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="participant-user">

                                                        <div className="participant-avatar">
                                                            {getInitials(
                                                                participant.full_name
                                                            )}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    participant.full_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    participant.email
                                                                }
                                                            </span>
                                                        </div>

                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="type-badge">
                                                        {
                                                            participant.participant_type ||
                                                            "—"
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        participant.company_name ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        participant.phone ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    <div className="location-cell">

                                                        <strong>
                                                            {
                                                                participant.city ||
                                                                "—"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                participant.state ||
                                                                ""
                                                            }

                                                            {participant.country
                                                                ? `, ${participant.country}`
                                                                : ""}
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${participant.status ===
                                                            "Active"
                                                            ? "active"
                                                            : "inactive"
                                                            }`}
                                                    >
                                                        <span className="status-dot" />

                                                        {
                                                            participant.status ||
                                                            "Unknown"
                                                        }
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="participant-actions">

                                                        <button
                                                            className="edit-button"
                                                            onClick={() =>
                                                                handleEditParticipant(
                                                                    participant
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                handleDeleteParticipant(
                                                                    participant.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

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
                ADD PARTICIPANT MODAL
            ================================================= */}

            {showAddModal && (
                <div
                    className="participant-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowAddModal(false);
                        }
                    }}
                >

                    <div className="participant-modal">

                        <div className="modal-header">

                            <div>
                                <span>
                                    NEW PARTICIPANT
                                </span>

                                <h2>
                                    Add Participant
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setShowAddModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleAddParticipant
                            }
                        >

                            <div className="form-grid">

                                {/* USER DROPDOWN */}

                                <div className="form-group">
                                    <label>
                                        User *
                                    </label>

                                    <select
                                        name="user_id"
                                        value={
                                            formData.user_id
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    >
                                        <option value="">
                                            {usersLoading
                                                ? "Loading users..."
                                                : "Select User"}
                                        </option>

                                        {users.map(
                                            (user) => (
                                                <option
                                                    key={
                                                        user.id
                                                    }
                                                    value={
                                                        user.id
                                                    }
                                                >
                                                    {user.full_name}
                                                    {user.email
                                                        ? ` — ${user.email}`
                                                        : ""}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* PARTICIPANT TYPE */}

                                <div className="form-group">
                                    <label>
                                        Participant Type *
                                    </label>

                                    <select
                                        name="participant_type_id"
                                        value={
                                            formData.participant_type_id
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select Participant Type
                                        </option>

                                        {PARTICIPANT_TYPES.map(
                                            (type) => (
                                                <option
                                                    key={
                                                        type.id
                                                    }
                                                    value={
                                                        type.id
                                                    }
                                                >
                                                    {type.name}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="form-group">
                                    <label>
                                        Company Name
                                    </label>

                                    <input
                                        type="text"
                                        name="company_name"
                                        value={
                                            formData.company_name
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Company name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Contact Person</label>

                                    <input
                                        type="text"
                                        name="contact_person"
                                        value={editFormData.contact_person ?? ""}
                                        onChange={(event) => {
                                            setEditFormData((previous) => ({
                                                ...previous,
                                                contact_person: event.target.value,
                                            }));
                                        }}
                                        placeholder="Enter contact person"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={
                                            formData.city
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="City"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        State
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={
                                            formData.state
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="State"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Country
                                    </label>

                                    <input
                                        type="text"
                                        name="country"
                                        value={
                                            formData.country
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Country"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Address</label>

                                    <textarea
                                        name="address"
                                        value={editFormData.address ?? ""}
                                        onChange={(event) => {
                                            setEditFormData((previous) => ({
                                                ...previous,
                                                address: event.target.value,
                                            }));
                                        }}
                                        placeholder="Enter full address"
                                        rows="4"
                                    />
                                </div>

                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setShowAddModal(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={
                                        usersLoading
                                    }
                                >
                                    Create Participant
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                EDIT PARTICIPANT MODAL
            ================================================= */}

            {showEditModal && (
                <div
                    className="participant-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowEditModal(false);
                        }
                    }}
                >

                    <div className="participant-modal">

                        <div className="modal-header">

                            <div>
                                <span>
                                    UPDATE PARTICIPANT
                                </span>

                                <h2>
                                    Edit Participant
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setShowEditModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleUpdateParticipant
                            }
                        >

                            <div className="form-grid">

                                <div className="form-group">
                                    <label>
                                        Company Name
                                    </label>

                                    <input
                                        type="text"
                                        name="company_name"
                                        value={
                                            editFormData.company_name
                                        }
                                        onChange={
                                            handleEditInputChange
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Contact Person
                                    </label>

                                    <input
                                        type="text"
                                        name="contact_person"
                                        value={
                                            editFormData.contact_person
                                        }
                                        onChange={
                                            handleEditInputChange
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={
                                            editFormData.phone
                                        }
                                        onChange={
                                            handleEditInputChange
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={
                                            editFormData.city
                                        }
                                        onChange={
                                            handleEditInputChange
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        State
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={
                                            editFormData.state
                                        }
                                        onChange={
                                            handleEditInputChange
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Country
                                    </label>

                                    <input
                                        type="text"
                                        name="country"
                                        value={
                                            editFormData.country
                                        }
                                        onChange={
                                            handleEditInputChange
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            editFormData.status
                                        }
                                        onChange={
                                            handleEditInputChange
                                        }
                                    >
                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            editFormData.address
                                        }
                                        onChange={
                                            handleEditInputChange
                                        }
                                        rows="3"
                                    />
                                </div>

                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setShowEditModal(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                >
                                    Save Changes
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Participants;

