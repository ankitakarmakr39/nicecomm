import React, { useEffect, useState } from "react";
import "./Marketing.css";

const API_BASE = "http://localhost:5000/api/marketing";

const Marketing = () => {
  // ======================================
  // STATE
  // ======================================

  const [isAdmin, setIsAdmin] = useState(false);

  const [profile, setProfile] = useState(null);

  const [agencies, setAgencies] = useState([]);
  const [clients, setClients] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // TOKEN
  // ======================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("authToken") ||
      ""
    );
  };

  // ======================================
  // DECODE JWT
  // ======================================

  const decodeToken = (token) => {
    try {
      if (!token) return null;

      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];

      const decoded = JSON.parse(
        atob(
          payload
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      return decoded;
    } catch (error) {
      console.error("Token Decode Error:", error);
      return null;
    }
  };

  // ======================================
  // GET USER ROLE
  // ======================================

  const getUserRole = () => {
    const token = getToken();

    // --------------------------------------
    // 1. Check JWT
    // --------------------------------------

    const decodedToken = decodeToken(token);

    if (decodedToken) {
      const tokenRole =
        decodedToken.role ||
        decodedToken.user_role ||
        decodedToken.userRole ||
        decodedToken.type;

      if (tokenRole) {
        return String(tokenRole).toLowerCase();
      }
    }

    // --------------------------------------
    // 2. Check localStorage role
    // --------------------------------------

    const storedRole =
      localStorage.getItem("role") ||
      localStorage.getItem("userRole") ||
      sessionStorage.getItem("role") ||
      sessionStorage.getItem("userRole");

    if (storedRole) {
      return String(storedRole).toLowerCase();
    }

    // --------------------------------------
    // 3. Check stored user object
    // --------------------------------------

    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser") ||
      sessionStorage.getItem("user") ||
      sessionStorage.getItem("currentUser");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        const userRole =
          user?.role ||
          user?.user_role ||
          user?.userRole ||
          user?.type;

        if (userRole) {
          return String(userRole).toLowerCase();
        }
      } catch (error) {
        console.error("Stored User Parse Error:", error);
      }
    }

    return "";
  };

  // ======================================
  // CHECK ADMIN
  // ======================================

  const checkAdmin = () => {
    const role = getUserRole();

    console.log("Marketing User Role:", role);

    return (
      role === "admin" ||
      role === "administrator" ||
      role === "superadmin" ||
      role === "super_admin"
    );
  };

  // ======================================
  // HEADERS
  // ======================================

  const getHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ======================================
  // AGENCY USER DATA
  // ======================================

  const fetchAgencyData = async () => {
    const headers = getHeaders();

    const [profileRes, clientsRes, campaignsRes] =
      await Promise.all([
        fetch(`${API_BASE}/profile`, {
          method: "GET",
          headers,
        }),

        fetch(`${API_BASE}/clients`, {
          method: "GET",
          headers,
        }),

        fetch(`${API_BASE}/campaigns`, {
          method: "GET",
          headers,
        }),
      ]);

    // --------------------------------------
    // PROFILE
    // --------------------------------------

    if (profileRes.status === 401) {
      throw new Error(
        "Invalid or expired token. Please login again."
      );
    }

    const profileData = await profileRes
      .json()
      .catch(() => ({}));

    /*
     * Profile not found should not stop
     * clients/campaigns from loading.
     */

    if (profileRes.ok) {
      setProfile(profileData.agency || null);
    } else if (profileRes.status === 404) {
      setProfile(null);
    } else {
      throw new Error(
        profileData.message ||
          "Failed to load marketing profile."
      );
    }

    // --------------------------------------
    // CLIENTS
    // --------------------------------------

    const clientsData = clientsRes.ok
      ? await clientsRes.json()
      : [];

    // --------------------------------------
    // CAMPAIGNS
    // --------------------------------------

    const campaignsData = campaignsRes.ok
      ? await campaignsRes.json()
      : [];

    setClients(
      Array.isArray(clientsData)
        ? clientsData
        : []
    );

    setCampaigns(
      Array.isArray(campaignsData)
        ? campaignsData
        : []
    );

    // Agency user doesn't need all agencies.
    setAgencies([]);
  };

  // ======================================
  // ADMIN DATA
  // ======================================

  const fetchAdminData = async () => {
    const headers = getHeaders();

    const [
      agenciesRes,
      clientsRes,
      campaignsRes,
    ] = await Promise.all([
      fetch(`${API_BASE}/all`, {
        method: "GET",
        headers,
      }),

      fetch(`${API_BASE}/clients/all`, {
        method: "GET",
        headers,
      }),

      fetch(`${API_BASE}/campaigns/all`, {
        method: "GET",
        headers,
      }),
    ]);

    // --------------------------------------
    // AUTH CHECK
    // --------------------------------------

    if (
      agenciesRes.status === 401 ||
      clientsRes.status === 401 ||
      campaignsRes.status === 401
    ) {
      throw new Error(
        "Invalid or expired token. Please login again."
      );
    }

    // --------------------------------------
    // AGENCIES
    // --------------------------------------

    const agenciesData = agenciesRes.ok
      ? await agenciesRes.json()
      : { agencies: [] };

    // --------------------------------------
    // CLIENTS
    // --------------------------------------

    const clientsData = clientsRes.ok
      ? await clientsRes.json()
      : { clients: [] };

    // --------------------------------------
    // CAMPAIGNS
    // --------------------------------------

    const campaignsData = campaignsRes.ok
      ? await campaignsRes.json()
      : { campaigns: [] };

    // --------------------------------------
    // SET DATA
    // --------------------------------------

    setAgencies(
      Array.isArray(agenciesData.agencies)
        ? agenciesData.agencies
        : []
    );

    setClients(
      Array.isArray(clientsData.clients)
        ? clientsData.clients
        : []
    );

    setCampaigns(
      Array.isArray(campaignsData.campaigns)
        ? campaignsData.campaigns
        : []
    );

    /*
     * Admin doesn't have one particular
     * marketing agency profile.
     */
    setProfile(null);
  };

  // ======================================
  // MAIN LOAD DATA
  // ======================================

  const fetchMarketingData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const adminUser = checkAdmin();

      setIsAdmin(adminUser);

      console.log(
        "Marketing Dashboard Mode:",
        adminUser ? "ADMIN" : "AGENCY"
      );

      if (adminUser) {
        await fetchAdminData();
      } else {
        await fetchAgencyData();
      }
    } catch (err) {
      console.error(
        "Marketing Fetch Error:",
        err
      );

      setError(
        err.message ||
          "Failed to load marketing data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    fetchMarketingData();
  }, []);

  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
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

  // ======================================
  // COUNTS
  // ======================================

  const totalAgencies = agencies.length;

  const activeAgencies = agencies.filter(
    (agency) =>
      agency.status?.toLowerCase() ===
      "active"
  ).length;

  const totalClients = clients.length;

  const activeClients = clients.filter(
    (client) =>
      client.status?.toLowerCase() ===
      "active"
  ).length;

  const totalCampaigns = campaigns.length;

  const activeCampaigns = campaigns.filter(
    (campaign) =>
      campaign.status?.toLowerCase() ===
      "active"
  ).length;

  const plannedCampaigns = campaigns.filter(
    (campaign) =>
      campaign.status?.toLowerCase() ===
      "planned"
  ).length;

  const completedCampaigns = campaigns.filter(
    (campaign) =>
      campaign.status?.toLowerCase() ===
      "completed"
  ).length;

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="marketing-page">
        <div className="marketing-loading">
          <div className="marketing-spinner"></div>

          <p>
            Loading Marketing Module...
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // UI
  // ======================================

  return (
    <div className="marketing-page">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="marketing-header">
        <div>
          <h1>
            {isAdmin
              ? "Marketing Administration"
              : "Marketing"}
          </h1>

          <p>
            {isAdmin
              ? "Manage all marketing agencies, clients and campaigns"
              : "Manage your marketing agency, clients and campaigns"}
          </p>
        </div>

        <button
          className="marketing-refresh-btn"
          onClick={fetchMarketingData}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ==================================
          ERROR
      ================================== */}

      {error && (
        <div className="marketing-error">
          <strong>Error:</strong>{" "}
          {error}
        </div>
      )}

      {/* ==================================
          ADMIN AGENCY SECTION
      ================================== */}

      {isAdmin ? (
        <section className="marketing-profile-card">

          <div className="marketing-section-title">

            <div className="section-icon">
              📣
            </div>

            <div>
              <h2>
                Marketing Agencies
              </h2>

              <p>
                All registered marketing agencies
              </p>
            </div>

            <span className="count-badge">
              {totalAgencies}
            </span>

          </div>

          {agencies.length > 0 ? (
            <div className="marketing-table-wrapper">

              <table className="marketing-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Agency Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Service Areas</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>

                  {agencies.map(
                    (agency) => (
                      <tr key={agency.id}>

                        <td>
                          #{agency.id}
                        </td>

                        <td>
                          <div className="client-name">

                            <div className="client-avatar">
                              {agency.agency_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "A"}
                            </div>

                            <strong>
                              {agency.agency_name ||
                                "-"}
                            </strong>

                          </div>
                        </td>

                        <td>
                          {agency.contact_person ||
                            "-"}
                        </td>

                        <td>
                          {agency.phone || "-"}
                        </td>

                        <td>
                          {agency.email || "-"}
                        </td>

                        <td>
                          {agency.service_areas ||
                            "-"}
                        </td>

                        <td>

                          <span
                            className={`table-status ${
                              agency.status?.toLowerCase() ===
                              "active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {agency.status ||
                              "-"}
                          </span>

                        </td>

                        <td>
                          {formatDate(
                            agency.created_at
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          ) : (
            <div className="marketing-empty">
              No marketing agencies found.
            </div>
          )}

        </section>
      ) : (
        /* ==================================
           AGENCY PROFILE
        ================================== */

        <section className="marketing-profile-card">

          <div className="marketing-section-title">

            <div className="section-icon">
              📣
            </div>

            <div>
              <h2>
                Marketing Agency Profile
              </h2>

              <p>
                Your agency information
              </p>
            </div>

            {profile && (
              <span
                className={`marketing-status ${
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
            <div className="marketing-profile-grid">

              <div className="marketing-info-box">
                <span>
                  Agency Name
                </span>

                <strong>
                  {profile.agency_name ||
                    "-"}
                </strong>
              </div>

              <div className="marketing-info-box">
                <span>
                  Contact Person
                </span>

                <strong>
                  {profile.contact_person ||
                    "-"}
                </strong>
              </div>

              <div className="marketing-info-box">
                <span>
                  Phone
                </span>

                <strong>
                  {profile.phone || "-"}
                </strong>
              </div>

              <div className="marketing-info-box">
                <span>
                  Email
                </span>

                <strong>
                  {profile.email || "-"}
                </strong>
              </div>

              <div className="marketing-info-box full-width">
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
            <div className="marketing-empty">
              Marketing agency profile not found.
            </div>
          )}

        </section>
      )}

      {/* ==================================
          STATISTICS
      ================================== */}

      <div className="marketing-stats">

        {isAdmin && (
          <div className="marketing-stat-card">

            <div className="stat-icon purple">
              📣
            </div>

            <div>
              <span>
                Total Agencies
              </span>

              <strong>
                {totalAgencies}
              </strong>
            </div>

          </div>
        )}

        {isAdmin && (
          <div className="marketing-stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>
                Active Agencies
              </span>

              <strong>
                {activeAgencies}
              </strong>
            </div>

          </div>
        )}

        <div className="marketing-stat-card">

          <div className="stat-icon blue">
            👥
          </div>

          <div>
            <span>
              Total Clients
            </span>

            <strong>
              {totalClients}
            </strong>
          </div>

        </div>

        <div className="marketing-stat-card">

          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <span>
              Active Clients
            </span>

            <strong>
              {activeClients}
            </strong>
          </div>

        </div>

        <div className="marketing-stat-card">

          <div className="stat-icon purple">
            📣
          </div>

          <div>
            <span>
              Total Campaigns
            </span>

            <strong>
              {totalCampaigns}
            </strong>
          </div>

        </div>

        <div className="marketing-stat-card">

          <div className="stat-icon orange">
            ⏳
          </div>

          <div>
            <span>
              Planned Campaigns
            </span>

            <strong>
              {plannedCampaigns}
            </strong>
          </div>

        </div>

        <div className="marketing-stat-card">

          <div className="stat-icon purple">
            🚀
          </div>

          <div>
            <span>
              Active Campaigns
            </span>

            <strong>
              {activeCampaigns}
            </strong>
          </div>

        </div>

        <div className="marketing-stat-card">

          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <span>
              Completed Campaigns
            </span>

            <strong>
              {completedCampaigns}
            </strong>
          </div>

        </div>

      </div>

      {/* ==================================
          CLIENTS
      ================================== */}

      <section className="marketing-content-card">

        <div className="marketing-card-header">

          <div>
            <h2>
              Marketing Clients
            </h2>

            <p>
              {isAdmin
                ? "All clients associated with marketing agencies"
                : "Clients associated with your agency"}
            </p>
          </div>

          <span className="count-badge">
            {clients.length}
          </span>

        </div>

        {clients.length > 0 ? (
          <div className="marketing-table-wrapper">

            <table className="marketing-table">

              <thead>
                <tr>

                  <th>ID</th>

                  {isAdmin && (
                    <th>Agency</th>
                  )}

                  <th>Client Name</th>

                  <th>Client Type</th>

                  <th>Status</th>

                  <th>Created</th>

                </tr>
              </thead>

              <tbody>

                {clients.map(
                  (client) => (
                    <tr key={client.id}>

                      <td>
                        #{client.id}
                      </td>

                      {isAdmin && (
                        <td>
                          {client.agency_name ||
                            "-"}
                        </td>
                      )}

                      <td>

                        <div className="client-name">

                          <div className="client-avatar">
                            {client.client_name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "C"}
                          </div>

                          <strong>
                            {client.client_name ||
                              "-"}
                          </strong>

                        </div>

                      </td>

                      <td>
                        {client.client_type ||
                          "-"}
                      </td>

                      <td>

                        <span
                          className={`table-status ${
                            client.status?.toLowerCase() ===
                            "active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {client.status ||
                            "-"}
                        </span>

                      </td>

                      <td>
                        {formatDate(
                          client.created_at
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        ) : (
          <div className="marketing-empty">
            No marketing clients found.
          </div>
        )}

      </section>

      {/* ==================================
          CAMPAIGNS
      ================================== */}

      <section className="marketing-content-card">

        <div className="marketing-card-header">

          <div>
            <h2>
              Marketing Campaigns
            </h2>

            <p>
              {isAdmin
                ? "All campaigns managed by marketing agencies"
                : "Campaigns managed by your agency"}
            </p>
          </div>

          <span className="count-badge">
            {campaigns.length}
          </span>

        </div>

        {campaigns.length > 0 ? (
          <div className="campaign-grid">

            {campaigns.map(
              (campaign) => (
                <div
                  className="campaign-card"
                  key={campaign.id}
                >

                  <div className="campaign-top">

                    <div className="campaign-icon">
                      📢
                    </div>

                    <span
                      className={`campaign-status ${
                        (
                          campaign.status ||
                          ""
                        )
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )
                      }`}
                    >
                      {campaign.status ||
                        "Unknown"}
                    </span>

                  </div>

                  <h3>
                    {campaign.campaign_name ||
                      "-"}
                  </h3>

                  <p className="campaign-description">
                    {campaign.description ||
                      "No description available."}
                  </p>

                  <div className="campaign-details">

                    {isAdmin && (
                      <div>
                        <span>
                          Agency
                        </span>

                        <strong>
                          {campaign.agency_name ||
                            "-"}
                        </strong>
                      </div>
                    )}

                    <div>
                      <span>
                        Campaign Type
                      </span>

                      <strong>
                        {campaign.campaign_type ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Client
                      </span>

                      <strong>
                        {campaign.client_name ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Start Date
                      </span>

                      <strong>
                        {formatDate(
                          campaign.start_date
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        End Date
                      </span>

                      <strong>
                        {formatDate(
                          campaign.end_date
                        )}
                      </strong>
                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        ) : (
          <div className="marketing-empty">
            No marketing campaigns found.
          </div>
        )}

      </section>

    </div>
  );
};

export default Marketing;