const express = require("express");
const { subNewsletter } = require("../Controllers/SubscriptionController");
const { verifyCSRFToken } = require("../Config/csrfToken");

const router = express.Router();

router.post("/newsletter", subNewsletter);

module.exports = router;