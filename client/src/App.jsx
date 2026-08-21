
import { useEffect, useState } from "react";
import "./App.css";

import Users from "./pages/Users";
import Participants from "./pages/Participants";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Logistics from "./pages/Logistics";


/* =====================================================
   SIDEBAR MENU
   NOTE:
   Checkout is intentionally NOT included in sidebar.
   Checkout is opened from Cart.
===================================================== */

const menuGroups = [
  {
    title: "MAIN MENU",
    items: [
      { name: "Dashboard", icon: "⌂" },
      { name: "Users", icon: "♟" },
      { name: "Participants", icon: "▦" },
      { name: "Products", icon: "◇" },
      { name: "Orders", icon: "🛒" },
      { name: "Cart", icon: "🛍" },
    ],
  },

  {
    title: "OPERATIONS",
    items: [
      { name: "Logistics", icon: "🚚" },
      { name: "Warehouse", icon: "▣" },
      { name: "Packaging", icon: "□" },
      { name: "Marketing", icon: "◈" },
      { name: "Affiliate", icon: "♢" },
    ],
  },

  {
    title: "SERVICES",
    items: [
      { name: "Inspection", icon: "✓" },
      { name: "Repair", icon: "⚒" },
      { name: "Installation", icon: "⌁" },
      { name: "Compliance", icon: "▤" },
      { name: "Support Tickets", icon: "?" },
    ],
  },
];

/* =====================================================
   APP
===================================================== */

function App() {
  /* =====================================================
     LOGIN STATE
  ===================================================== */

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  /* =====================================================
     DASHBOARD STATE
  ===================================================== */

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalAssignments: 0, }); const [dashboardStatsLoading, setDashboardStatsLoading] = useState(true); useEffect(() => { const fetchDashboardStats = async () => { const token = localStorage.getItem("token"); if (!token) { setDashboardStatsLoading(false); return; } try { const response = await fetch("http://localhost:5000/api/dashboard/stats", { method: "GET", headers: { Authorization: `Bearer ${token}`, }, }); const data = await response.json(); if (!response.ok) { console.error("Dashboard Stats Error:", data.message); return; } setDashboardStats({ totalUsers: Number(data.totalUsers || 0), totalProducts: Number(data.totalProducts || 0), totalOrders: Number(data.totalOrders || 0), totalAssignments: Number(data.totalAssignments || 0), }); } catch (error) { console.error("Dashboard Stats Fetch Error:", error); } finally { setDashboardStatsLoading(false); } }; fetchDashboardStats(); }, []);

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
      setLoggedIn(true);

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Unable to connect to server");
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setLoggedIn(false);

    setSidebarOpen(false);
    setActiveMenu("Dashboard");
  };

  /* =====================================================
     MENU CLICK
  ===================================================== */

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
  };

  /* =====================================================
     GO TO CHECKOUT
     Cart -> Checkout
  ===================================================== */

  const handleCheckout = () => {
    setActiveMenu("Checkout");
    setSidebarOpen(false);
  };

  /* =====================================================
     BACK TO CART
     Checkout -> Cart
  ===================================================== */

  const handleBackToCart = () => {
    setActiveMenu("Cart");
    setSidebarOpen(false);
  };

  /* =====================================================
     CHECKOUT COMPLETE
     Checkout -> Orders
  ===================================================== */

  const handleCheckoutComplete = () => {
    setActiveMenu("Orders");
    setSidebarOpen(false);
  };

  /* =====================================================
     LOGGED-IN DASHBOARD
  ===================================================== */

  if (loggedIn) {
    const firstName =
      user?.full_name?.split(" ")[0] || "Admin";

    return (
      <div className="dashboard-layout">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className={`sidebar ${sidebarOpen ? "sidebar-open" : ""
            }`}
        >

          {/* BRAND */}

          <div className="sidebar-brand">

            <div className="sidebar-logo">
              N
            </div>

            <div className="sidebar-brand-text">
              <h2>NiceComm</h2>

              <span>
                Commerce OS
              </span>
            </div>

          </div>

          {/* NAVIGATION */}

          <div className="sidebar-scroll">

            {menuGroups.map((group) => (
              <div
                className="sidebar-group"
                key={group.title}
              >

                <div className="sidebar-label">
                  {group.title}
                </div>

                <nav className="sidebar-nav">

                  {group.items.map((item) => (
                    <button
                      key={item.name}
                      className={`sidebar-link ${activeMenu === item.name
                        ? "active"
                        : ""
                        }`}
                      onClick={() =>
                        handleMenuClick(item.name)
                      }
                    >

                      <span className="nav-icon">
                        {item.icon}
                      </span>

                      <span className="nav-text">
                        {item.name}
                      </span>

                    </button>
                  ))}

                </nav>

              </div>
            ))}

          </div>

          {/* =================================================
              SIDEBAR BOTTOM
          ================================================= */}

          <div className="sidebar-bottom">

            {/* SETTINGS */}

            <button
              className={`sidebar-link ${activeMenu === "Settings"
                ? "active"
                : ""
                }`}
              onClick={() =>
                handleMenuClick("Settings")
              }
            >

              <span className="nav-icon">
                ⚙
              </span>

              <span className="nav-text">
                Settings
              </span>

            </button>

            {/* LOGOUT */}

            <button
              className="sidebar-link logout-sidebar"
              onClick={handleLogout}
            >

              <span className="nav-icon">
                ↪
              </span>

              <span className="nav-text">
                Logout
              </span>

            </button>

          </div>

        </aside>

        {/* =================================================
            MAIN AREA
        ================================================= */}

        <div className="dashboard-area">

          {/* MOBILE OVERLAY */}

          {sidebarOpen && (
            <div
              className="sidebar-overlay"
              onClick={() =>
                setSidebarOpen(false)
              }
            />
          )}

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="dashboard-header">

            <div className="header-left">

              {/* MOBILE MENU */}

              <button
                className="mobile-menu-toggle"
                onClick={() =>
                  setSidebarOpen(!sidebarOpen)
                }
                aria-label="Toggle sidebar"
              >
                ☰
              </button>

              {/* PAGE TITLE */}

              <div className="header-page-title">

                <h3>
                  {activeMenu}
                </h3>

                <div className="breadcrumb">

                  <span>
                    NiceComm
                  </span>

                  <span>
                    /
                  </span>

                  <strong>
                    {activeMenu}
                  </strong>

                </div>

              </div>

            </div>

            {/* =================================================
                HEADER RIGHT
            ================================================= */}

            <div className="header-actions">

              <button className="header-icon-button">
                🔔
                <span className="notification-dot" />
              </button>

              <div className="header-profile">

                <div className="profile-avatar">
                  {firstName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="profile-details">

                  <strong>
                    {user?.full_name || "Admin"}
                  </strong>

                  <span>
                    {user?.role || "admin"}
                  </span>

                </div>

              </div>

            </div>

          </header>

          {/* =================================================
              CONTENT
          ================================================= */}

          <main className="dashboard-content">

            {/* =================================================
                DASHBOARD PAGE
            ================================================= */}

            {activeMenu === "Dashboard" && (
              <>

                {/* WELCOME BANNER */}

                <section className="welcome-banner">

                  <div className="welcome-content">

                    <span className="welcome-eyebrow">
                      NICECOMM COMMERCE OS
                    </span>

                    <h1>
                      Welcome back, {firstName}
                      <span> 👋</span>
                    </h1>

                    <p>
                      Manage your entire commerce
                      ecosystem from one powerful
                      workspace.
                    </p>

                  </div>

                  <div className="welcome-decoration">

                    <div className="circle circle-one" />
                    <div className="circle circle-two" />
                    <div className="circle circle-three" />

                  </div>

                </section>

                {/* =================================================
                    STATS
                ================================================= */}

                <section className="stats-grid">

                  {/* USERS */}

                  <div className="dashboard-stat-card">

                    <div className="stat-top">

                      <div className="stat-icon blue">
                        👥
                      </div>

                      <span className="stat-trend">
                        OVERVIEW
                      </span>

                    </div>

                    <span className="stat-title">
                      Total Users
                    </span>

                    <strong className="stat-number">
                      {dashboardStatsLoading
                        ? "..."
                        : dashboardStats.totalUsers}
                    </strong>

                  </div>

                  {/* PRODUCTS */}

                  <div className="dashboard-stat-card">

                    <div className="stat-top">

                      <div className="stat-icon purple">
                        📦
                      </div>

                      <span className="stat-trend">
                        CATALOGUE
                      </span>

                    </div>

                    <span className="stat-title">
                      Products
                    </span>

                    <strong className="stat-number">
                      {dashboardStatsLoading
                        ? "..."
                        : dashboardStats.totalProducts}
                    </strong>

                  </div>

                  {/* ORDERS */}

                  <div className="dashboard-stat-card">

                    <div className="stat-top">

                      <div className="stat-icon orange">
                        🛒
                      </div>

                      <span className="stat-trend">
                        SALES
                      </span>

                    </div>

                    <span className="stat-title">
                      Orders
                    </span>

                    <strong className="stat-number">
                      {dashboardStatsLoading
                        ? "..."
                        : dashboardStats.totalOrders}
                    </strong>

                  </div>

                  {/* ASSIGNMENTS */}

                  <div className="dashboard-stat-card">

                    <div className="stat-top">

                      <div className="stat-icon green">
                        🚚
                      </div>

                      <span className="stat-trend">
                        OPERATIONS
                      </span>

                    </div>

                    <span className="stat-title">
                      Assignments
                    </span>

                    <strong className="stat-number">
                      {dashboardStatsLoading
                        ? "..."
                        : dashboardStats.totalAssignments}
                    </strong>

                  </div>

                </section>

                {/* MANAGEMENT HEADING */}

                <div className="content-section-heading">

                  <span className="section-eyebrow">
                    MANAGEMENT
                  </span>

                  <h2>
                    Commerce Management
                  </h2>

                  <p>
                    Access and manage different areas
                    of your commerce ecosystem.
                  </p>

                </div>

                {/* MODULES */}

                <section className="module-grid">

                  <ModuleCard
                    icon="👤"
                    color="blue"
                    title="Users"
                    description="Manage customer accounts, administrators and system users."
                    link="Manage users"
                    onClick={() =>
                      handleMenuClick("Users")
                    }
                  />

                  <ModuleCard
                    icon="🏢"
                    color="purple"
                    title="Participants"
                    description="Manage sellers, warehouses and commerce ecosystem participants."
                    link="Manage participants"
                    onClick={() =>
                      handleMenuClick("Participants")
                    }
                  />

                  <ModuleCard
                    icon="📦"
                    color="orange"
                    title="Products"
                    description="Manage your product catalogue, inventory and product information."
                    link="Manage products"
                    onClick={() =>
                      handleMenuClick("Products")
                    }
                  />

                  <ModuleCard
                    icon="🛍"
                    color="green"
                    title="Orders"
                    description="Track customer orders and manage the complete order lifecycle."
                    link="View orders"
                    onClick={() =>
                      handleMenuClick("Orders")
                    }
                  />

                  <ModuleCard
                    icon="🚚"
                    color="cyan"
                    title="Logistics"
                    description="Manage logistics providers, deliveries and assignments."
                    link="Manage logistics"
                    onClick={() =>
                      handleMenuClick("Logistics")
                    }
                  />

                  <ModuleCard
                    icon="▣"
                    color="pink"
                    title="Warehouse"
                    description="Manage warehouses, inventory operations and warehouse assignments."
                    link="Manage warehouse"
                    onClick={() =>
                      handleMenuClick("Warehouse")
                    }
                  />

                  <ModuleCard
                    icon="□"
                    color="blue"
                    title="Packaging"
                    description="Manage packaging operations, assignments and workflows."
                    link="Manage packaging"
                    onClick={() =>
                      handleMenuClick("Packaging")
                    }
                  />

                  <ModuleCard
                    icon="◈"
                    color="purple"
                    title="Marketing"
                    description="Manage marketing agencies, campaigns and commerce activities."
                    link="Manage marketing"
                    onClick={() =>
                      handleMenuClick("Marketing")
                    }
                  />

                  <ModuleCard
                    icon="♢"
                    color="orange"
                    title="Affiliate"
                    description="Manage affiliates, commissions and affiliate operations."
                    link="Manage affiliates"
                    onClick={() =>
                      handleMenuClick("Affiliate")
                    }
                  />

                  <ModuleCard
                    icon="✓"
                    color="green"
                    title="Inspection"
                    description="Manage inspections, inspection assignments and workflows."
                    link="Manage inspections"
                    onClick={() =>
                      handleMenuClick("Inspection")
                    }
                  />

                  <ModuleCard
                    icon="⚒"
                    color="cyan"
                    title="Repair"
                    description="Manage repair requests, assignments and repair operations."
                    link="Manage repairs"
                    onClick={() =>
                      handleMenuClick("Repair")
                    }
                  />

                  <ModuleCard
                    icon="⌁"
                    color="pink"
                    title="Installation"
                    description="Manage installation operations and installation assignments."
                    link="Manage installation"
                    onClick={() =>
                      handleMenuClick("Installation")
                    }
                  />

                  <ModuleCard
                    icon="▤"
                    color="blue"
                    title="Compliance"
                    description="Manage compliance records, requirements and assignments."
                    link="Manage compliance"
                    onClick={() =>
                      handleMenuClick("Compliance")
                    }
                  />

                  <ModuleCard
                    icon="?"
                    color="purple"
                    title="Support Tickets"
                    description="Manage customer support tickets and support assignments."
                    link="Manage support"
                    onClick={() =>
                      handleMenuClick("Support Tickets")
                    }
                  />

                </section>

                {/* =================================================
                    SYSTEM STATUS
                ================================================= */}

                <section className="bottom-overview">

                  <div className="overview-card">

                    <div className="overview-header">

                      <div>

                        <span className="section-eyebrow">
                          SYSTEM STATUS
                        </span>

                        <h3>
                          NiceComm Platform
                        </h3>

                      </div>

                      <span className="status-badge">
                        ● Operational
                      </span>

                    </div>

                    <div className="system-row">

                      <div>
                        <span>
                          Authentication
                        </span>

                        <strong>
                          Active
                        </strong>
                      </div>

                      <div>
                        <span>
                          Database
                        </span>

                        <strong>
                          Connected
                        </strong>
                      </div>

                      <div>
                        <span>
                          API Server
                        </span>

                        <strong>
                          Running
                        </strong>
                      </div>

                    </div>

                  </div>

                  <div className="quick-card">

                    <span className="section-eyebrow">
                      CURRENT ACCESS
                    </span>

                    <h3>
                      {user?.role || "Admin"}
                    </h3>

                    <p>
                      You are currently signed in
                      with administrative access.
                    </p>

                  </div>

                </section>

              </>
            )}

            {/* =================================================
                USERS PAGE
            ================================================= */}

            {activeMenu === "Users" && (
              <Users />
            )}

            {/* =================================================
                PARTICIPANTS PAGE
            ================================================= */}

            {activeMenu === "Participants" && (
              <Participants />
            )}

            {/* =================================================
                PRODUCTS PAGE
            ================================================= */}

            {activeMenu === "Products" && (
              <Products />
            )}

            {/* =================================================
                ORDERS PAGE
            ================================================= */}

            {activeMenu === "Orders" && (
              <Orders />
            )}

            {/* =================================================
                CART PAGE
            ================================================= */}

            {activeMenu === "Cart" && (
              <Cart
                onCheckout={handleCheckout}
              />
            )}

            {/* =================================================
                CHECKOUT PAGE

                Checkout is NOT a sidebar item.

                Cart -> Checkout
                Checkout -> Cart
                Checkout -> Orders
            ================================================= */}

            {activeMenu === "Checkout" && (
              <Checkout
                onBackToCart={handleBackToCart}
                onCheckoutComplete={handleCheckoutComplete}
              />
            )}


            {/* =================================================
                LOGISTICS PAGE
            ================================================= */}

            {activeMenu === "Logistics" && (
              <Logistics />
            )}

            {/* =================================================
                OTHER MODULES
            ================================================= */}

            {activeMenu !== "Dashboard" &&
              activeMenu !== "Users" &&
              activeMenu !== "Participants" &&
              activeMenu !== "Products" &&
              activeMenu !== "Orders" &&
              activeMenu !== "Cart" &&
              activeMenu !== "Checkout" &&
              activeMenu !== "Logistics" && (

                <section className="module-placeholder">

                  <span className="section-eyebrow">
                    NICECOMM COMMERCE OS
                  </span>

                  <h1>
                    {activeMenu}
                  </h1>

                  <p>
                    The {activeMenu} management module
                    is ready to be connected with its
                    API and management interface.
                  </p>

                  <button
                    className="back-dashboard-button"
                    onClick={() =>
                      setActiveMenu("Dashboard")
                    }
                  >
                    ← Back to Dashboard
                  </button>

                </section>

              )}

          </main>

        </div>

      </div>
    );
  }

  /* =====================================================
     LOGIN PAGE
  ===================================================== */

  return (
    <div className="login-page">

      {/* =================================================
          LOGIN LEFT
      ================================================= */}

      <section className="login-left">

        <div className="brand">

          <div className="brand-icon">
            N
          </div>

          <div className="brand-text">

            <strong>
              NiceComm
            </strong>

            <span>
              COMMERCE OPERATING SYSTEM
            </span>

          </div>

        </div>

        <div className="hero-content">

          <p className="eyebrow">
            COMMERCE OPERATING SYSTEM
          </p>

          <h1>
            Manage your commerce
            <span>
              {" "}
              ecosystem smarter.
            </span>
          </h1>

          <p className="hero-description">
            Connect sellers, warehouses, logistics,
            packaging, marketing and other commerce
            participants in one powerful platform.
          </p>

          <div className="feature-list">

            <div className="feature-item">
              <span>✓</span>

              <p>
                Unified commerce management
              </p>
            </div>

            <div className="feature-item">
              <span>✓</span>

              <p>
                Role-based participant management
              </p>
            </div>

            <div className="feature-item">
              <span>✓</span>

              <p>
                Order and assignment tracking
              </p>
            </div>

          </div>

        </div>

        <p className="copyright">
          © 2026 NiceComm. All rights reserved.
        </p>

      </section>

      {/* =================================================
          LOGIN RIGHT
      ================================================= */}

      <section className="login-right">

        <div className="login-card">

          <div className="mobile-brand">

            <div className="brand-icon">
              N
            </div>

            <strong>
              NiceComm
            </strong>

          </div>

          <div className="login-heading">

            <span className="login-eyebrow">
              SECURE ACCESS
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to your NiceComm account
            </p>

          </div>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <a href="#forgot">
                  Forgot password?
                </a>

              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            {/* REMEMBER */}

            <div className="remember-row">

              <label>

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
            >
              Sign in
            </button>

          </form>

          <div className="login-divider">

            <span>
              Secure access
            </span>

          </div>

          <p className="login-footer">
            NiceComm Commerce OS
          </p>

        </div>

      </section>

    </div>
  );
}

/* =====================================================
   MODULE CARD
===================================================== */

function ModuleCard({
  icon,
  color,
  title,
  description,
  link,
  onClick,
}) {
  return (
    <div
      className="professional-module"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
    >

      <div className="module-top">

        <div className={`module-icon ${color}`}>
          {icon}
        </div>

        <span className="module-arrow">
          →
        </span>

      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      <span className="module-link">
        {link} →
      </span>

    </div>
  );
}

export default App;

