const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
    createAffiliateProfile,
    getAffiliateProfile,
    updateAffiliateProfile,
    getAffiliateCommissions,
    createAffiliateCommission
} = require("../controllers/affiliateController");


// ======================================
// Affiliate Profile
// ======================================

router.post(
    "/profile",
    verifyToken,
    createAffiliateProfile
);

router.get(
    "/profile",
    verifyToken,
    getAffiliateProfile
);

router.put(
    "/profile",
    verifyToken,
    updateAffiliateProfile
);


// ======================================
// Affiliate Commissions
// ======================================

router.get(
    "/commissions",
    verifyToken,
    getAffiliateCommissions
);

router.post(
    "/commissions",
    verifyToken,
    createAffiliateCommission
);


module.exports = router;