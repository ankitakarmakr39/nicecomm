const express = require("express");
const router = express.Router();

const {
    createInstallationProfile,
    getInstallationProfile,
    updateInstallationProfile
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


module.exports = router;