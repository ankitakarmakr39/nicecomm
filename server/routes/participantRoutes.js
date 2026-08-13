const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const {
    getParticipants,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    getMyParticipantProfile,
    updateMyParticipantProfile
} = require("../controllers/participantController");

// My Participant Profile
router.get("/me", verifyToken, getMyParticipantProfile);

// Update My Participant Profile
router.put("/me", verifyToken, updateMyParticipantProfile);

// Admin Only
router.get("/", verifyToken, requireAdmin, getParticipants);

router.post("/", verifyToken, requireAdmin, createParticipant);

router.put("/:id", verifyToken, requireAdmin, updateParticipant);

router.delete("/:id", verifyToken, requireAdmin, deleteParticipant);

module.exports = router;