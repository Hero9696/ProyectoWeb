// backend/routes/lugares.js
const express = require('express');
const router = express.Router();
const LugaresController = require('../controllers/lugarController');

// GET /api/lugares
router.get('/lugares', LugaresController.getAllLugares);

module.exports = router;
