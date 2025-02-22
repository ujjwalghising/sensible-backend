const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { updateProfilePicture } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

// Profile picture upload route
router.post("/upload", authMiddleware, upload.single("profilePicture"), updateProfilePicture);

module.exports = router;
