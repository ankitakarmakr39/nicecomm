require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const participantRoutes = require("./routes/participantRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const logisticsRoutes = require("./routes/logisticsRoutes");
const rbacRoutes = require("./routes/rbacRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const packagingRoutes = require("./routes/packagingRoutes");
const marketingRoutes = require("./routes/marketingRoutes");
const affiliateRoutes = require("./routes/affiliateRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const inspectionAssignmentRoutes = require("./routes/inspectionAssignmentRoutes");
const repairRoutes = require("./routes/repairRoutes");
const repairAssignmentRoutes = require("./routes/repairAssignmentRoutes");
const installationRoutes = require("./routes/installationRoutes");
const installationAssignmentRoutes = require("./routes/installationAssignmentRoutes");
const complianceRoutes = require("./routes/complianceRoutes");
const complianceAssignmentRoutes = require("./routes/complianceAssignmentRoutes");
const supportTicketRoutes = require("./routes/supportTicketRoutes");
const supportAssignmentRoutes = require("./routes/supportAssignmentRoutes");
const logisticsAssignmentRoutes = require("./routes/logisticsAssignmentRoutes");
const packagingAssignmentRoutes = require("./routes/packagingAssignmentRoutes");
const dashboardRoute = require("./routes/dashboardRoute");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to NiceComm Commerce OS!");
});

// User Routes
app.use("/api/users", userRoutes);

// Participant Routes
app.use("/api/participants", participantRoutes);

// Auth Routes
app.use("/api/auth", authRoutes);

// Product Routes
app.use("/api/products", productRoutes);

// Order Routes
app.use("/api/orders", orderRoutes);

// Logistics Routes
app.use("/api/logistics", logisticsRoutes);

// rbac Routes
app.use("/api/rbac", rbacRoutes);

// Cart Routes
app.use("/api/cart", cartRoutes);

// Checkout Routes
app.use("/api/checkout", checkoutRoutes);

// Warehouse Routes
app.use("/api/warehouses", warehouseRoutes);

// Packaging Routes
app.use("/api/packaging", packagingRoutes);

// Marketing Routes
app.use("/api/marketing", marketingRoutes);

// Affiliate Routes
app.use("/api/affiliate", affiliateRoutes);

// Inspection Routes
app.use("/api/inspection", inspectionRoutes);

// InspectionAssignment Routes
app.use(
    "/api/inspection",
    inspectionAssignmentRoutes
);

// Repair Routes
app.use("/api/repair", repairRoutes);

// RepairAssignment Routes
app.use(
    "/api/repair",
    repairAssignmentRoutes
);

// Installation Routes
app.use("/api/installation", installationRoutes);

// InstallationAssignment Routes
app.use(
    "/api/installation",
    installationAssignmentRoutes
);

// Compilance Routes
app.use(
    "/api/compliance",
    complianceRoutes
);

// CompilanceAssignment Routes
app.use(
    "/api/compliance",
    complianceAssignmentRoutes
);

// SupportTicket Routes
app.use(
    "/api/support",
    supportTicketRoutes
);

// SupportAssignment Routes
app.use(
    "/api/support",
    supportAssignmentRoutes
);

// logisticsAssignment Routes
app.use(
    "/api/logistics",
    logisticsAssignmentRoutes
);

// Packaging Assignment Routes
app.use(
    "/api/packaging",
    packagingAssignmentRoutes
);

// Dashboard Routes
app.use("/api/dashboard", dashboardRoute);

// Database Test API
app.get("/test-db", async (req, res) => {

    try {

        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database Connected Successfully",
            time: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Database Connection Failed"
        });

    }

});

app.listen(PORT, () => {
    console.log(`NiceComm server is running on port ${PORT}`);
});