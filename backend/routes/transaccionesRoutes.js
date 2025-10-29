// routes/transaccionesRoutes.js
const express = require('express');

const router = express.Router();

const CajaController = require('../controllers/cajaController');
const TransaccionCajaController = require('../controllers/transaccionCajaController');
const DonacionController = require('../controllers/donacionController');
const InventarioController = require('../controllers/inventarioController');
const VentaController = require('../controllers/ventaController');

/**
 * @swaggerc
 * tags:
 *   name: Tesorería y Movimiento
 *   description: Gestión de Caja, Donaciones, Inventario y Ventas (flujo financiero y de stock).
 */

// =========================================================================
// RUTAS: CAJA Y TRANSACCIONES
// =========================================================================

/**
 * @swagger
 * /caja/estado:
 *   get:
 *     summary: Obtiene el monto total actual de la caja.
 *     tags: [Tesorería y Movimiento]
 */

/**
 * @swagger
 * /caja/movimiento:
 *   post:
 *     summary: Registra un ingreso o egreso de caja manual (es atómico).
 *     tags: [Tesorería y Movimiento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               montoTrx:
 *                 type: number
 *                 format: float
 *                 example: 50.00
 *                 description: Positivo para ingreso, negativo para egreso.
 *               idTipoTrx:
 *                 type: integer
 *                 example: 3
 *                 description: ID del TipoTransaccion.
 *               descripcionTrx:
 *                 type: string
 *                 example: Pago de servicios.
 *               idUsuarioIngreso:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Movimiento registrado, caja actualizada.
 *       400:
 *         description: Saldo negativo o datos inválidos.
 */

/**
 * @swagger
 * /transacciones-caja:
 *   get:
 *     summary: Obtiene el historial de todas las transacciones de caja.
 *     tags: [Tesorería y Movimiento]
 */
router.get('/caja/estado', CajaController.getCajaStatus);
router.get('/caja/resumen-diario', CajaController.getDailySummary);
router.get('/caja/ultimos-movimientos', CajaController.getLatestTransactions);
router.post('/caja/movimiento', CajaController.createMovimiento);
router.get('/transacciones-caja', TransaccionCajaController.getAllTransacciones);

// =========================================================================
// RUTAS: DONACIONES
// =========================================================================

/**
 * @swagger
 * /donaciones:
 *   get:
 *     summary: Obtiene todas las donaciones registradas.
 *     tags: [Tesorería y Movimiento]
 *   post:
 *     summary: Registra una nueva donación (actualiza caja si es efectivo).
 *     tags: [Tesorería y Movimiento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idDonante:
 *                 type: integer
 *               idTipoDona:
 *                 type: integer
 *                 description: ID 1 si es efectivo.
 *               montoDonado:
 *                 type: number
 *                 format: float
 *                 description: Solo si es efectivo.
 *               idUsuarioIngreso:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Donación registrada atómicamente.
 *       500:
 *         description: Error en la transacción atómica.
 */
// Donaciones (sin tipos)
router.get('/donaciones', DonacionController.getAllDonaciones);
router.get('/donaciones/:id', DonacionController.getDonacionById);
router.post('/donaciones', DonacionController.createDonacion);
router.delete('/donaciones/:id', DonacionController.deleteDonacion);
// =========================================================================
// RUTAS: INVENTARIO
// =========================================================================

/**
 * @swagger
 * /inventario:
 *   get:
 *     summary: Obtiene todos los registros de inventario.
 *     tags: [Tesorería y Movimiento]
 *   post:
 *     summary: Inicializa el registro de inventario para un beneficiario.
 *     tags: [Tesorería y Movimiento]
 */

/**
 * @swagger
 * /inventario/beneficiario/{id}:
 *   get:
 *     summary: Obtiene el registro de inventario de un beneficiario específico.
 *     tags: [Tesorería y Movimiento]
 */
router.get('/inventario', InventarioController.getAllInventario);
router.get('/inventario/beneficiario/:id', InventarioController.getInventarioByBeneficiarioId);
router.post('/inventario', InventarioController.createInventario);

// =========================================================================
// RUTAS: VENTAS
// =========================================================================

/**
 * @swagger
 * /ventas:
 *   get:
 *     summary: Obtiene todas las cabeceras de ventas.
 *     tags: [Tesorería y Movimiento]
 *   post:
 *     summary: Registra una Venta completa (Cabecera, Detalle, Inventario, Caja - ATÓMICO).
 *     tags: [Tesorería y Movimiento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idBeneficiarioVenta:
 *                 type: integer
 *               TotalVenta:
 *                 type: number
 *                 format: float
 *               idUsuarioIngresa:
 *                 type: integer
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     cantidad:
 *                       type: integer
 *                     valorUnidad:
 *                       type: number
 *                       format: float
 *                     subtotal:
 *                       type: number
 *                       format: float
 *     responses:
 *       201:
 *         description: Venta registrada atómicamente.
 *       400:
 *         description: Stock insuficiente o datos inválidos.
 */

/**
 * @swagger
 * /ventas/{id}:
 *   get:
 *     summary: Obtiene una venta por ID con su detalle de productos.
 *     tags: [Tesorería y Movimiento]
 */
router.get('/ventas', VentaController.getAllVentas);
router.post('/ventas', VentaController.createVenta);
router.get('/ventas/:id', VentaController.getVentaWithDetails);

module.exports = router;
