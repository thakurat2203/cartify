const express = require('express');
const { healthCheck } = require('../controllers/healthController');

const router = express.Router();

// Server status check
router.get('/', healthCheck);

module.exports = router;
