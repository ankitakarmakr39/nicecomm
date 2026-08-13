const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
    createAgencyProfile,
    getAgencyProfile,
    updateAgencyProfile,
    getMarketingClients,
    createMarketingClient,
    getMarketingCampaigns,
    createMarketingCampaign
} = require("../controllers/marketingController");


// ======================================
// Marketing Agency Profile
// ======================================

router.post(
    "/profile",
    verifyToken,
    createAgencyProfile
);

router.get(
    "/profile",
    verifyToken,
    getAgencyProfile
);

router.put(
    "/profile",
    verifyToken,
    updateAgencyProfile
);


// ======================================
// Marketing Clients
// ======================================

router.get(
    "/clients",
    verifyToken,
    getMarketingClients
);

router.post(
    "/clients",
    verifyToken,
    createMarketingClient
);


// ======================================
// Marketing Campaigns
// ======================================

router.get(
    "/campaigns",
    verifyToken,
    getMarketingCampaigns
);

router.post(
    "/campaigns",
    verifyToken,
    createMarketingCampaign
);


module.exports = router;