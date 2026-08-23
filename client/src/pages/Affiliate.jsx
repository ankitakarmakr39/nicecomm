import React, { useEffect, useState } from "react";
import "./Affiliate.css";

const API_BASE = "http://localhost:5000/api/affiliate";

const Affiliate = () => {
  const [profile, setProfile] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [commissions, setCommissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEdit, setShowEdit] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState({
    affiliate_name: "",
    phone: "",
    email: "",
    referral_code: "",
    status: "Active",
  });

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
  // Detect User Role
  // ======================================

  const getUserRole = () => {
    const directRole =
      localStorage.getItem("role") ||
      localStorage.getItem("userRole") ||
      sessionStorage.getItem("role") ||
      sessionStorage.getItem("userRole");

    if (directRole) {
      return directRole.toLowerCase();
    }

    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser") ||
      sessionStorage.getItem("user") ||
      sessionStorage.getItem("currentUser");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        return (
          parsedUser?.role ||
          parsedUser?.user?.role ||
          ""
        ).toLowerCase();
      } catch (error) {
        console.error("User Parse Error:", error);
      }
    }

    return "";
  };


  // ======================================
  // Headers
  // ======================================

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });


  // ======================================
  // Participant Profile
  // ======================================

  const fetchParticipantProfile = async () => {
    const response = await fetch(`${API_BASE}/profile`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load affiliate profile"
      );
    }

    const affiliate = data.affiliate;

    setProfile(affiliate);

    setForm({
      affiliate_name: affiliate?.affiliate_name || "",
      phone: affiliate?.phone || "",
      email: affiliate?.email || "",
      referral_code: affiliate?.referral_code || "",
      status: affiliate?.status || "Active",
    });
  };


  // ======================================
  // Participant Commissions
  // ======================================

  const fetchParticipantCommissions = async () => {
    const response = await fetch(`${API_BASE}/commissions`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load commissions"
      );
    }

    setCommissions(
      Array.isArray(data) ? data : []
    );
  };


  // ======================================
  // Admin - Affiliates
  // ======================================

  const fetchAdminAffiliates = async () => {
    const response = await fetch(`${API_BASE}/all`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load affiliates"
      );
    }

    const allAffiliates = Array.isArray(data.affiliates)
      ? data.affiliates
      : [];

    setAffiliates(allAffiliates);

    // Show first affiliate in profile section
    if (allAffiliates.length > 0) {
      const firstAffiliate = allAffiliates[0];

      setProfile(firstAffiliate);

      setForm({
        affiliate_name:
          firstAffiliate?.affiliate_name || "",
        phone:
          firstAffiliate?.phone || "",
        email:
          firstAffiliate?.email || "",
        referral_code:
          firstAffiliate?.referral_code || "",
        status:
          firstAffiliate?.status || "Active",
      });
    }
  };


  // ======================================
  // Admin - All Commissions
  // ======================================

  const fetchAdminCommissions = async () => {
    const response = await fetch(
      `${API_BASE}/commissions/all`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load affiliate commissions"
      );
    }

    setCommissions(
      Array.isArray(data.commissions)
        ? data.commissions
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

      const role = getUserRole();

      const admin =
        role === "admin" ||
        role === "administrator";

      setIsAdmin(admin);

      if (admin) {
        await Promise.all([
          fetchAdminAffiliates(),
          fetchAdminCommissions(),
        ]);
      } else {
        await Promise.all([
          fetchParticipantProfile(),
          fetchParticipantCommissions(),
        ]);
      }

    } catch (err) {
      console.error(
        "Affiliate Load Error:",
        err
      );

      setError(
        err.message ||
          "Failed to load Affiliate data"
      );
    } finally {
      setLoading(false);
    }
  };


  // ======================================
  // Initial Load
  // ======================================

  useEffect(() => {
    loadData();
  }, []);


  // ======================================
  // Form Change
  // ======================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  // ======================================
  // Update Profile
  // ======================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/profile`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile"
        );
      }

      setProfile(data.affiliate);
      setShowEdit(false);

      alert(
        "Affiliate Profile Updated Successfully"
      );

      loadData();

    } catch (err) {
      console.error(
        "Affiliate Update Error:",
        err
      );

      setError(
        err.message ||
          "Failed to update profile"
      );
    }
  };


  // ======================================
  // Commission Calculations
  // ======================================

  const totalCommission =
    commissions.reduce(
      (total, item) =>
        total +
        Number(
          item.commission_amount || 0
        ),
      0
    );


  const pendingCommission =
    commissions
      .filter(
        (item) =>
          String(item.status)
            .toLowerCase() ===
          "pending"
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.commission_amount || 0
          ),
        0
      );


  const completedCommission =
    commissions
      .filter(
        (item) =>
          String(item.status)
            .toLowerCase() ===
          "completed"
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.commission_amount || 0
          ),
        0
      );


  // ======================================
  // Loading
  // ======================================

  if (loading) {
    return (
      <div className="affiliate-page">
        <div className="affiliate-loading">
          Loading Affiliate Dashboard...
        </div>
      </div>
    );
  }


  // ======================================
  // UI
  // ======================================

  return (
    <div className="affiliate-page">

      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}

      <div className="affiliate-header">

        <div>
          <h1>Affiliate Dashboard</h1>

          <p>
            {isAdmin
              ? "Manage all affiliates and commissions"
              : "Manage your affiliate profile and commissions"}
          </p>
        </div>

        {profile && !isAdmin && (
          <span
            className={`affiliate-status ${
              profile.status === "Active"
                ? "active"
                : "inactive"
            }`}
          >
            {profile.status}
          </span>
        )}

      </div>


      {/* ============================= */}
      {/* ERROR */}
      {/* ============================= */}

      {error && (
        <div className="affiliate-error">
          {error}
        </div>
      )}


      {/* ============================= */}
      {/* STAT CARDS */}
      {/* ============================= */}

      <div className="affiliate-stats">

        <div className="affiliate-stat-card">

          <div className="stat-icon">
            👤
          </div>

          <div>

            <span>
              {isAdmin
                ? "Total Affiliates"
                : "Affiliate"}
            </span>

            <strong>
              {isAdmin
                ? affiliates.length
                : profile?.affiliate_name || "-"}
            </strong>

          </div>

        </div>


        <div className="affiliate-stat-card">

          <div className="stat-icon">
            🔗
          </div>

          <div>

            <span>
              {isAdmin
                ? "Referral Codes"
                : "Referral Code"}
            </span>

            <strong>
              {isAdmin
                ? affiliates.length
                : profile?.referral_code || "-"}
            </strong>

          </div>

        </div>


        <div className="affiliate-stat-card">

          <div className="stat-icon">
            ₹
          </div>

          <div>

            <span>
              Total Commission
            </span>

            <strong>
              ₹{totalCommission.toFixed(2)}
            </strong>

          </div>

        </div>


        <div className="affiliate-stat-card">

          <div className="stat-icon">
            ⏳
          </div>

          <div>

            <span>
              Pending Commission
            </span>

            <strong>
              ₹{pendingCommission.toFixed(2)}
            </strong>

          </div>

        </div>

      </div>


      {/* ============================= */}
      {/* PROFILE */}
      {/* ============================= */}

      <div className="affiliate-grid">

        <div className="affiliate-card profile-card">

          <div className="card-title-row">

            <div>

              <h2>
                {isAdmin
                  ? "Affiliate Profiles"
                  : "Affiliate Profile"}
              </h2>

              <p>
                {isAdmin
                  ? "Registered affiliate accounts"
                  : "Your affiliate account information"}
              </p>

            </div>

            {!isAdmin && profile && (
              <button
                className="affiliate-edit-btn"
                onClick={() =>
                  setShowEdit(!showEdit)
                }
              >
                {showEdit
                  ? "Cancel"
                  : "Edit Profile"}
              </button>
            )}

          </div>


          {/* ============================= */}
          {/* ADMIN AFFILIATES */}
          {/* ============================= */}

          {isAdmin ? (

            affiliates.length === 0 ? (

              <div className="empty-commissions">
                No affiliate profiles found.
              </div>

            ) : (

              <div className="table-wrapper">

                <table className="affiliate-table">

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>Affiliate Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Referral Code</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {affiliates.map(
                      (affiliate) => (

                        <tr
                          key={
                            affiliate.id
                          }
                        >

                          <td>
                            #{affiliate.id}
                          </td>

                          <td>
                            {affiliate.affiliate_name}
                          </td>

                          <td>
                            {affiliate.phone ||
                              "-"}
                          </td>

                          <td>
                            {affiliate.email ||
                              "-"}
                          </td>

                          <td>

                            <span className="table-referral">
                              {
                                affiliate.referral_code
                              }
                            </span>

                          </td>

                          <td>

                            <span
                              className={`commission-status ${
                                String(
                                  affiliate.status ||
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
                                affiliate.status
                              }
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )

          ) : (

            /* ============================= */
            /* PARTICIPANT PROFILE */
            /* ============================= */

            !showEdit ? (

              <div className="profile-details">

                <div className="detail-item">
                  <span>
                    Affiliate Name
                  </span>

                  <strong>
                    {profile?.affiliate_name ||
                      "-"}
                  </strong>
                </div>


                <div className="detail-item">
                  <span>
                    Phone
                  </span>

                  <strong>
                    {profile?.phone || "-"}
                  </strong>
                </div>


                <div className="detail-item">
                  <span>
                    Email
                  </span>

                  <strong>
                    {profile?.email || "-"}
                  </strong>
                </div>


                <div className="detail-item">
                  <span>
                    Referral Code
                  </span>

                  <strong className="referral-code">
                    {profile?.referral_code ||
                      "-"}
                  </strong>
                </div>


                <div className="detail-item">
                  <span>
                    Status
                  </span>

                  <strong>
                    {profile?.status || "-"}
                  </strong>
                </div>

              </div>

            ) : (

              <form
                className="affiliate-form"
                onSubmit={handleUpdate}
              >

                <div className="form-group">

                  <label>
                    Affiliate Name
                  </label>

                  <input
                    type="text"
                    name="affiliate_name"
                    value={
                      form.affiliate_name
                    }
                    onChange={handleChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    Referral Code
                  </label>

                  <input
                    type="text"
                    name="referral_code"
                    value={
                      form.referral_code
                    }
                    onChange={handleChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>


                <button
                  type="submit"
                  className="save-profile-btn"
                >
                  Save Changes
                </button>

              </form>

            )

          )}

        </div>


        {/* ============================= */}
        {/* COMMISSION SUMMARY */}
        {/* ============================= */}

        <div className="affiliate-card commission-summary-card">

          <h2>
            Commission Summary
          </h2>

          <p>
            {isAdmin
              ? "Overview of all affiliate earnings"
              : "Overview of your affiliate earnings"}
          </p>


          <div className="commission-summary">

            <div>
              <span>
                Total Records
              </span>

              <strong>
                {commissions.length}
              </strong>
            </div>


            <div>
              <span>
                Total Earned
              </span>

              <strong>
                ₹{totalCommission.toFixed(2)}
              </strong>
            </div>


            <div>
              <span>
                Pending
              </span>

              <strong>
                ₹{pendingCommission.toFixed(2)}
              </strong>
            </div>


            <div>
              <span>
                Completed
              </span>

              <strong>
                ₹{completedCommission.toFixed(2)}
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* ============================= */}
      {/* COMMISSION HISTORY */}
      {/* ============================= */}

      <div className="affiliate-card commissions-card">

        <div className="card-title-row">

          <div>

            <h2>
              Commission History
            </h2>

            <p>
              {isAdmin
                ? "All affiliate commissions"
                : "All commissions generated through your referral code"}
            </p>

          </div>


          <button
            className="refresh-btn"
            onClick={loadData}
          >
            Refresh
          </button>

        </div>


        {commissions.length === 0 ? (

          <div className="empty-commissions">
            No commission records found.
          </div>

        ) : (

          <div className="table-wrapper">

            <table className="affiliate-table">

              <thead>

                <tr>

                  <th>ID</th>

                  {isAdmin && (
                    <th>Affiliate</th>
                  )}

                  <th>Order ID</th>

                  <th>Referral Code</th>

                  <th>Order Amount</th>

                  <th>Rate</th>

                  <th>Commission</th>

                  <th>Status</th>

                  <th>Date</th>

                </tr>

              </thead>


              <tbody>

                {commissions.map(
                  (commission) => (

                    <tr
                      key={
                        commission.id
                      }
                    >

                      <td>
                        #{commission.id}
                      </td>


                      {isAdmin && (
                        <td>
                          {
                            commission.affiliate_name ||
                            "-"
                          }
                        </td>
                      )}


                      <td>
                        {commission.order_id
                          ? `#${commission.order_id}`
                          : "-"}
                      </td>


                      <td>

                        <span className="table-referral">
                          {
                            commission.referral_code
                          }
                        </span>

                      </td>


                      <td>
                        ₹
                        {Number(
                          commission.order_amount ||
                            0
                        ).toFixed(2)}
                      </td>


                      <td>
                        {Number(
                          commission.commission_rate ||
                            0
                        ).toFixed(2)}
                        %
                      </td>


                      <td className="commission-value">
                        ₹
                        {Number(
                          commission.commission_amount ||
                            0
                        ).toFixed(2)}
                      </td>


                      <td>

                        <span
                          className={`commission-status ${String(
                            commission.status ||
                              ""
                          )
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )}`}
                        >
                          {
                            commission.status
                          }
                        </span>

                      </td>


                      <td>
                        {commission.created_at
                          ? new Date(
                              commission.created_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Affiliate;