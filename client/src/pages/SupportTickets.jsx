import React, { useEffect, useState } from "react";
import "./SupportTickets.css";

const API_BASE = "http://localhost:5000/api/support";

const SupportTickets = () => {

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    order_id: "",
    subject: "",
    description: "",
    priority: "Medium",
  });

  const [submitting, setSubmitting] = useState(false);


  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      ""
    );

  };


  const getHeaders = () => {

    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

  };


  // =====================================================
  // FETCH TICKETS
  // =====================================================

  const fetchTickets = async () => {

    try {

      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {

        throw new Error(
          "Authentication token not found. Please login again."
        );

      }


      const response = await fetch(
        `${API_BASE}/tickets`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );


      const data = await response.json();


      console.log(
        "SUPPORT TICKETS API RESPONSE:",
        data
      );


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to fetch support tickets"
        );

      }


      // IMPORTANT
      // Backend response:
      //
      // {
      //   message: "...",
      //   tickets: [...]
      // }
      //

      if (Array.isArray(data)) {

        setTickets(data);

      } else if (Array.isArray(data.tickets)) {

        setTickets(data.tickets);

      } else {

        setTickets([]);

      }


    } catch (err) {

      console.error(
        "Support Ticket Fetch Error:",
        err
      );

      setError(
        err.message ||
        "Failed to load support tickets"
      );

      setTickets([]);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchTickets();

  }, []);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

  };


  // =====================================================
  // CREATE TICKET
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    try {

      setSubmitting(true);
      setError("");


      const response = await fetch(
        `${API_BASE}/tickets`,
        {
          method: "POST",

          headers: getHeaders(),

          body: JSON.stringify({

            order_id:
              formData.order_id
                ? Number(formData.order_id)
                : null,

            subject:
              formData.subject,

            description:
              formData.description,

            priority:
              formData.priority,

          }),

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to create support ticket"
        );

      }


      alert(
        "Support Ticket Created Successfully"
      );


      setFormData({

        order_id: "",

        subject: "",

        description: "",

        priority: "Medium",

      });


      setShowForm(false);


      await fetchTickets();


    } catch (err) {

      console.error(
        "Create Support Ticket Error:",
        err
      );

      setError(
        err.message ||
        "Failed to create support ticket"
      );

    } finally {

      setSubmitting(false);

    }

  };


  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {

    if (!date) return "-";


    return new Date(date)
      .toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

  };


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalTickets =
    tickets.length;


  const openTickets =
    tickets.filter(
      (ticket) => {

        const status =
          String(
            ticket.status || ""
          ).toLowerCase();

        return (
          status === "open" ||
          status === "assigned" ||
          status === "in progress"
        );

      }
    ).length;


  const resolvedTickets =
    tickets.filter(
      (ticket) => {

        const status =
          String(
            ticket.status || ""
          ).toLowerCase();

        return (
          status === "resolved" ||
          status === "closed"
        );

      }
    ).length;


  const highPriorityTickets =
    tickets.filter(
      (ticket) => {

        return (
          String(
            ticket.priority || ""
          ).toLowerCase() === "high"
        );

      }
    ).length;


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="support-page">

        <div className="support-loading">

          <div className="support-spinner"></div>

          <p>
            Loading Support Tickets...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="support-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="support-header">

        <div>

          <span className="support-eyebrow">
            NICECOMM COMMERCE OS
          </span>

          <h1>
            Support Tickets
          </h1>

          <p>
            Create and track your customer
            support requests from one place.
          </p>

        </div>


        <div className="support-header-actions">

          <button
            className="support-refresh-btn"
            onClick={fetchTickets}
          >
            ↻ Refresh
          </button>


          <button
            className="support-create-btn"
            onClick={() => {

              setShowForm(
                !showForm
              );

              setError("");

            }}
          >

            {showForm
              ? "✕ Close"
              : "+ Create Ticket"}

          </button>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="support-error">

          <strong>
            Error:
          </strong>{" "}

          {error}

        </div>

      )}


      {/* =================================================
          CREATE FORM
      ================================================= */}

      {showForm && (

        <section className="support-form-card">

          <div className="support-form-header">

            <div>

              <span className="support-eyebrow">
                CUSTOMER SUPPORT
              </span>

              <h2>
                Create Support Ticket
              </h2>

              <p>
                Tell us what issue you are facing.
              </p>

            </div>

          </div>


          <form
            onSubmit={handleSubmit}
          >

            <div className="support-form-grid">


              <div className="support-form-group">

                <label htmlFor="order_id">
                  Order ID
                </label>

                <input
                  id="order_id"
                  name="order_id"
                  type="number"
                  placeholder="Optional"
                  value={formData.order_id}
                  onChange={handleChange}
                />

              </div>


              <div className="support-form-group">

                <label htmlFor="priority">
                  Priority
                </label>

                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >

                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>

              </div>


              <div className="support-form-group full">

                <label htmlFor="subject">
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Enter your issue subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="support-form-group full">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  placeholder="Describe your issue in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            <div className="support-form-actions">

              <button
                type="button"
                className="support-cancel-btn"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="support-submit-btn"
                disabled={submitting}
              >

                {submitting
                  ? "Creating..."
                  : "Create Ticket"}

              </button>

            </div>

          </form>

        </section>

      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="support-stats">


        <div className="support-stat-card">

          <div className="support-stat-icon purple">
            🎫
          </div>

          <div>

            <span>
              Total Tickets
            </span>

            <strong>
              {totalTickets}
            </strong>

          </div>

        </div>


        <div className="support-stat-card">

          <div className="support-stat-icon blue">
            📋
          </div>

          <div>

            <span>
              Open Tickets
            </span>

            <strong>
              {openTickets}
            </strong>

          </div>

        </div>


        <div className="support-stat-card">

          <div className="support-stat-icon orange">
            ⚠
          </div>

          <div>

            <span>
              High Priority
            </span>

            <strong>
              {highPriorityTickets}
            </strong>

          </div>

        </div>


        <div className="support-stat-card">

          <div className="support-stat-icon green">
            ✓
          </div>

          <div>

            <span>
              Resolved
            </span>

            <strong>
              {resolvedTickets}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          TICKETS
      ================================================= */}

      <section className="support-content-card">


        <div className="support-card-header">

          <div>

            <span className="support-eyebrow">
              MY SUPPORT REQUESTS
            </span>

            <h2>
              My Tickets
            </h2>

            <p>
              Track your submitted support requests
              and their current status.
            </p>

          </div>


          <span className="support-count-badge">

            {tickets.length}

          </span>

        </div>


        {tickets.length === 0 ? (

          <div className="support-empty">

            <div className="support-empty-icon">
              🎫
            </div>

            <h3>
              No Support Tickets
            </h3>

            <p>
              No support tickets found.
            </p>

            <button
              className="support-empty-btn"
              onClick={() =>
                setShowForm(true)
              }
            >
              + Create Your First Ticket
            </button>

          </div>

        ) : (

          <div className="support-table-wrapper">

            <table className="support-table">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Order
                  </th>

                  <th>
                    Subject
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Assigned To
                  </th>

                  <th>
                    Created
                  </th>

                </tr>

              </thead>


              <tbody>

                {tickets.map(
                  (ticket) => (

                    <tr
                      key={ticket.id}
                    >

                      <td>

                        <strong>
                          #{ticket.id}
                        </strong>

                      </td>


                      <td>

                        {ticket.order_id
                          ? `#${ticket.order_id}`
                          : "-"}

                      </td>


                      <td>

                        <div className="support-subject">

                          <strong>
                            {ticket.subject}
                          </strong>

                          <span>
                            {ticket.description}
                          </span>

                        </div>

                      </td>


                      <td>

                        <span
                          className={`support-priority ${String(
                            ticket.priority || ""
                          ).toLowerCase()}`}
                        >

                          {ticket.priority || "-"}

                        </span>

                      </td>


                      <td>

                        <span
                          className={`support-status ${String(
                            ticket.status || ""
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >

                          {ticket.status || "-"}

                        </span>

                      </td>


                      <td>

                        {ticket.assigned_participant_id

                          ? `${ticket.assigned_participant_role || "Participant"} #${ticket.assigned_participant_id}`

                          : "Not Assigned"}

                      </td>


                      <td>

                        {formatDate(
                          ticket.created_at
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


export default SupportTickets;