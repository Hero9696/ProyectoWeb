// routes/personas.routes.js

const express = require('express');
const router = express.Router();

const EncargadoController = require('../controllers/encargadoController');
const DonanteController = require('../controllers/donanteController');
const BeneficiarioController = require('../controllers/beneficiarioController');

/**
 * @swagger
 * tags:
 *   - name: Gestión de Personas
 *     description: CRUD de Encargados, Donantes y Beneficiarios.
 */

// =========================================================================
// RUTAS: ENCARGADOS
// =========================================================================

/**
 * @swagger
 * /encargados:
 *   get:
 *     summary: Obtiene todos los encargados con datos de ubicación y auditoría.
 *     tags: [Gestión de Personas]
 *     responses:
 *       200:
 *         description: Lista de encargados obtenida con éxito.
 *   post:
 *     summary: Crea un nuevo encargado.
 *     tags: [Gestión de Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               IdentificacionEncarga:
 *                 type: string
 *               nombre1Encargado:
 *                 type: string
 *               apellido1Encargado:
 *                 type: string
 *               idLugarEncargado:
 *                 type: integer
 *                 description: ID de la tabla Lugares
 *               idUsuarioIngreso:
 *                 type: integer
 *                 description: ID del usuario que registra
 *     responses:
 *       201:
 *         description: Encargado creado con éxito.
 */
router.get('/encargados', EncargadoController.getAllEncargados);
router.post('/encargados', EncargadoController.createEncargado);

/**
 * @swagger
 * /encargados/{id}:
 *   get:
 *     summary: Obtiene un encargado por su ID.
 *     tags: [Gestión de Personas]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Encargado obtenido correctamente.
 *   put:
 *     summary: Actualiza la información de un encargado.
 *     tags: [Gestión de Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idUsuarioActualiza:
 *                 type: integer
 *                 description: ID del usuario que actualiza
 *     responses:
 *       200:
 *         description: Encargado actualizado correctamente.
 *   delete:
 *     summary: Elimina un encargado.
 *     tags: [Gestión de Personas]
 *     responses:
 *       409:
 *         description: No se puede eliminar porque tiene Beneficiarios asociados.
 */
router.get('/encargados/:id', EncargadoController.getEncargadoById);
router.put('/encargados/:id', EncargadoController.updateEncargado);
router.delete('/encargados/:id', EncargadoController.deleteEncargado);

// =========================================================================
// RUTAS: DONANTES
// =========================================================================

/**
 * @swagger
 * /donantes:
 *   get:
 *     summary: Obtiene todos los donantes.
 *     tags: [Gestión de Personas]
 *     responses:
 *       200:
 *         description: Lista de donantes obtenida correctamente.
 *   post:
 *     summary: Crea un nuevo donante.
 *     tags: [Gestión de Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre1Donante:
 *                 type: string
 *               apellido1Donante:
 *                 type: string
 *               idUsuarioIngreso:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Donante creado con éxito.
 */
router.get('/donantes', DonanteController.getAllDonantes);
router.post('/donantes', DonanteController.createDonante);

/**
 * @swagger
 * /donantes/{id}:
 *   put:
 *     summary: Actualiza la información de un donante.
 *     tags: [Gestión de Personas]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Donante actualizado correctamente.
 *   delete:
 *     summary: Elimina un donante.
 *     tags: [Gestión de Personas]
 *     responses:
 *       409:
 *         description: No se puede eliminar porque tiene Donaciones asociadas.
 */
router.put('/donantes/:id', DonanteController.updateDonante);
router.delete('/donantes/:id', DonanteController.deleteDonante);

// =========================================================================
// RUTAS: BENEFICIARIOS
// =========================================================================

/**
 * @swagger
 * /beneficiarios:
 *   get:
 *     summary: Obtiene todos los beneficiarios con información detallada.
 *     tags: [Gestión de Personas]
 *     responses:
 *       200:
 *         description: Lista de beneficiarios obtenida correctamente.
 *   post:
 *     summary: Crea un nuevo beneficiario.
 *     tags: [Gestión de Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre1Beneficiario:
 *                 type: string
 *               apellido1Beneficiario:
 *                 type: string
 *               idEncargadoBeneficiario:
 *                 type: integer
 *               idUsuarioIngreso:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Beneficiario creado con éxito.
 */
router.get('/beneficiarios', BeneficiarioController.getAllBeneficiarios);
router.post('/beneficiarios', BeneficiarioController.createBeneficiario);

/**
 * @swagger
 * /beneficiarios/{id}:
 *   get:
 *     summary: Obtiene un beneficiario por su ID.
 *     tags: [Gestión de Personas]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Beneficiario obtenido correctamente.
 *   put:
 *     summary: Actualiza la información de un beneficiario.
 *     tags: [Gestión de Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idUsuarioActualiza:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Beneficiario actualizado correctamente.
 */
router.get('/beneficiarios/:id', BeneficiarioController.getBeneficiarioById);
router.put('/beneficiarios/:id', BeneficiarioController.updateBeneficiario);

module.exports = router;
