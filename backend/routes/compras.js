// backend/routes/compras.js
const express = require('express');
const router = express.Router();

const ComprasController = require('../controllers/compraController');

// Lista todas las compras
// GET /api/compras
router.get('/compras', ComprasController.getAllCompras);

// Registra una compra
// POST /api/compras
router.post('/compras', ComprasController.createCompra);

module.exports = router;
