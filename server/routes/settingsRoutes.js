const express = require("express");

const router = express.Router();

const {
    getMyProfile,
    updateMyProfile,
    changePassword
} = require("../controllers/settingsController");

const {
    verifyToken
} = require("../middleware/authMiddleware");


// =====================================================
// PROFILE
// =====================================================

router.get(
    "/profile",
    verifyToken,
    getMyProfile
);


router.put(
    "/profile",
    verifyToken,
    updateMyProfile
);


// =====================================================
// PASSWORD
// =====================================================

router.put(
    "/password",
    verifyToken,
    changePassword
);


module.exports = router;