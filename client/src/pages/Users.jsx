import { useEffect, useMemo, useState } from "react";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Add Form
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "customer",
  });

  // Edit Form
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "customer",
  });

  /* =====================================================
     FETCH USERS
  ===================================================== */

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUsersError("Authentication token not found.");
      return;
    }

    setUsersLoading(true);
    setUsersError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/users",
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
        setUsersError(
          data.message || "Unable to fetch users."
        );
        return;
      }

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch Users Error:", error);
      setUsersError("Unable to connect to server.");
    } finally {
      setUsersLoading(false);
    }
  };

  /* =====================================================
     LOAD USERS
  ===================================================== */

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =====================================================
     ADD USER
  ===================================================== */

  const handleAddUser = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/users",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create user.");
        return;
      }

      alert("User created successfully.");

      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: "customer",
      });

      setShowAddModal(false);

      fetchUsers();
    } catch (error) {
      console.error("Add User Error:", error);
      alert("Unable to connect to server.");
    }
  };

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const handleEditUser = (user) => {
    setEditingUserId(user.id);

    setEditFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      role: user.role || "customer",
    });

    setShowEditModal(true);
  };

  /* =====================================================
     EDIT FORM CHANGE
  ===================================================== */

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     UPDATE USER
  ===================================================== */

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authentication token not found.");
      return;
    }

    if (!editingUserId) {
      alert("User ID not found.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${editingUserId}`,
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
        alert(data.message || "Failed to update user.");
        return;
      }

      alert("User updated successfully.");

      setShowEditModal(false);
      setEditingUserId(null);

      setEditFormData({
        full_name: "",
        email: "",
        password: "",
        role: "customer",
      });

      fetchUsers();
    } catch (error) {
      console.error("Update User Error:", error);
      alert("Unable to connect to server.");
    }
  };

  /* =====================================================
     DELETE USER
     SOFT DELETE -> INACTIVE
  ===================================================== */

  const handleDeleteUser = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this user?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to deactivate user.");
        return;
      }

      alert("User deactivated successfully.");

      fetchUsers();
    } catch (error) {
      console.error("Delete User Error:", error);
      alert("Unable to connect to server.");
    }
  };

  /* =====================================================
     SEARCH + ROLE + STATUS FILTER
  ===================================================== */

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (user.full_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (user.email || "")
          .toLowerCase()
          .includes(searchText);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const userStatus =
        user.status || "Active";

      const matchesStatus =
        statusFilter === "all" ||
        userStatus.toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalUsers = users.length;

  const activeCount = users.filter(
    (user) =>
      (user.status || "Active").toLowerCase() ===
      "active"
  ).length;

  const inactiveCount = users.filter(
    (user) =>
      (user.status || "").toLowerCase() ===
      "inactive"
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  /* =====================================================
     ADD FORM CHANGE
  ===================================================== */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     CLOSE EDIT MODAL
  ===================================================== */

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUserId(null);

    setEditFormData({
      full_name: "",
      email: "",
      password: "",
      role: "customer",
    });
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="users-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="users-page-header">

        <div>

          <span className="users-eyebrow">
            USER MANAGEMENT
          </span>

          <h1>Users</h1>

          <p>
            Manage all registered users in the
            NiceComm platform.
          </p>

        </div>

        <button
          className="add-user-button"
          onClick={() => setShowAddModal(true)}
        >
          <span>+</span>
          Add User
        </button>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="user-stats">

        {/* TOTAL */}

        <div className="user-stat-card">

          <div className="user-stat-icon blue">
            👥
          </div>

          <div>
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>

        </div>

        {/* ACTIVE */}

        <div className="user-stat-card">

          <div className="user-stat-icon green">
            ●
          </div>

          <div>
            <span>Active Users</span>
            <strong>{activeCount}</strong>
          </div>

        </div>

        {/* INACTIVE */}

        <div className="user-stat-card">

          <div className="user-stat-icon orange">
            ○
          </div>

          <div>
            <span>Inactive Users</span>
            <strong>{inactiveCount}</strong>
          </div>

        </div>

        {/* ADMIN */}

        <div className="user-stat-card">

          <div className="user-stat-icon purple">
            🛡️
          </div>

          <div>
            <span>Administrators</span>
            <strong>{adminCount}</strong>
          </div>

        </div>

      </div>

      {/* =================================================
          TABLE CARD
      ================================================= */}

      <div className="users-table-card">

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="users-toolbar">

          <div className="users-toolbar-left">

            <h3>
              All Users
            </h3>

            <span className="user-count">
              {filteredUsers.length} users
            </span>

          </div>

          <div className="users-toolbar-right">

            {/* SEARCH */}

            <div className="user-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            {/* ROLE */}

            <select
              className="role-filter"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
            >

              <option value="all">
                All Roles
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="participant">
                Participant
              </option>

              <option value="customer">
                Customer
              </option>

            </select>

            {/* STATUS */}

            <select
              className="role-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
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

            {/* REFRESH */}

            <button
              className="refresh-button"
              onClick={fetchUsers}
              title="Refresh users"
            >
              ↻
            </button>

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {usersLoading && (

          <div className="users-loading">

            <div className="loading-spinner"></div>

            <span>
              Loading users...
            </span>

          </div>

        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!usersLoading && usersError && (

          <div className="users-error-box">

            <div className="error-icon">
              !
            </div>

            <div>

              <strong>
                Unable to load users
              </strong>

              <p>
                {usersError}
              </p>

            </div>

            <button onClick={fetchUsers}>
              Try Again
            </button>

          </div>

        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!usersLoading &&
          !usersError &&
          filteredUsers.length === 0 && (

            <div className="users-empty">

              <div className="empty-user-icon">
                👥
              </div>

              <h3>
                No users found
              </h3>

              <p>
                Try changing your search,
                role or status filter.
              </p>

            </div>

          )}

        {/* =================================================
            TABLE
        ================================================= */}

        {!usersLoading &&
          !usersError &&
          filteredUsers.length > 0 && (

            <div className="users-table-wrapper">

              <table className="professional-users-table">

                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      User
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredUsers.map((user) => {

                    const initials =
                      (user.full_name || "U")
                        .split(" ")
                        .map((word) =>
                          word.charAt(0)
                        )
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                    const userStatus =
                      user.status || "Active";

                    const normalizedStatus =
                      userStatus.toLowerCase();

                    return (

                      <tr key={user.id}>

                        {/* ID */}

                        <td>

                          <span className="user-id">
                            #{user.id}
                          </span>

                        </td>

                        {/* USER */}

                        <td>

                          <div className="table-user">

                            <div className="table-avatar">
                              {initials}
                            </div>

                            <div>

                              <strong>
                                {user.full_name ||
                                  "Unnamed User"}
                              </strong>

                              <span>
                                NiceComm User
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* EMAIL */}

                        <td>

                          <span className="user-email">
                            {user.email || "—"}
                          </span>

                        </td>

                        {/* ROLE */}

                        <td>

                          <span
                            className={`role-badge ${
                              user.role || "customer"
                            }`}
                          >

                            <span className="role-dot"></span>

                            {user.role || "customer"}

                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`status-badge ${
                              normalizedStatus ===
                              "inactive"
                                ? "inactive"
                                : "active"
                            }`}
                          >

                            <span className="status-dot"></span>

                            {userStatus}

                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="user-actions">

                            {/* EDIT */}

                            <button
                              className="action-button edit"
                              title="Edit user"
                              onClick={() =>
                                handleEditUser(user)
                              }
                            >
                              ✎
                            </button>

                            {/* DELETE / DEACTIVATE */}

                            {normalizedStatus !==
                              "inactive" && (

                              <button
                                className="action-button delete"
                                title="Deactivate user"
                                onClick={() =>
                                  handleDeleteUser(
                                    user.id
                                  )
                                }
                              >
                                🗑
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

      </div>

      {/* =====================================================
          ADD USER MODAL
      ===================================================== */}

      {showAddModal && (

        <div
          className="user-modal-overlay"
          onClick={() =>
            setShowAddModal(false)
          }
        >

          <div
            className="user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span>
                  USER MANAGEMENT
                </span>

                <h2>
                  Add New User
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                ×
              </button>

            </div>

            <form
              className="add-user-form"
              onSubmit={handleAddUser}
            >

              {/* FULL NAME */}

              <div className="form-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="form-field">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

              </div>

              {/* PASSWORD */}

              <div className="form-field">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />

              </div>

              {/* ROLE */}

              <div className="form-field">

                <label>
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >

                  <option value="customer">
                    Customer
                  </option>

                  <option value="participant">
                    Participant
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                </select>

              </div>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-user-button"
                >
                  Create User
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          EDIT USER MODAL
      ===================================================== */}

      {showEditModal && (

        <div
          className="user-modal-overlay"
          onClick={closeEditModal}
        >

          <div
            className="user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span>
                  USER MANAGEMENT
                </span>

                <h2>
                  Edit User
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={closeEditModal}
              >
                ×
              </button>

            </div>

            <form
              className="add-user-form"
              onSubmit={handleUpdateUser}
            >

              {/* FULL NAME */}

              <div className="form-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter full name"
                  value={editFormData.full_name}
                  onChange={handleEditInputChange}
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="form-field">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                />

              </div>

              {/* PASSWORD */}

              <div className="form-field">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Leave blank to keep current password"
                  value={editFormData.password}
                  onChange={handleEditInputChange}
                />

              </div>

              {/* ROLE */}

              <div className="form-field">

                <label>
                  Role
                </label>

                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditInputChange}
                >

                  <option value="customer">
                    Customer
                  </option>

                  <option value="participant">
                    Participant
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                </select>

              </div>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-user-button"
                >
                  Update User
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </section>
  );
}

export default Users;