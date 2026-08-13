const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

router.get("/", verifyToken, getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;