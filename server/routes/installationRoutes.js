const express = require("express");
const router = express.Router();

const {
    createInstallationProfile,
    getInstallationProfile,
    updateInstallationProfile,
    getAllInstallationProviders
} = require("../controllers/installationController");

const { verifyToken } = require("../middleware/authMiddleware");


// Create Installation Profile
router.post(
    "/profile",
    verifyToken,
    createInstallationProfile
);


// Get Installation Profile
router.get(
    "/profile",
    verifyToken,
    getInstallationProfile
);


// Update Installation Profile
router.put(
    "/profile",
    verifyToken,
    updateInstallationProfile
);

// ======================================
// Get All Installation Providers - ADMIN
// ======================================

router.get(
    "/admin/all",
    verifyToken,
    getAllInstallationProviders
);


module.exports = router;