// routes/catalogos.routes.js

const express = require('express');
const router = express.Router();

const PaisController = require('../controllers/paisController');
const RolController = require('../controllers/rolController');
const TipoTransaccionController = require('../controllers/tipoTransaccionController');

/**
 * @swagger
 * tags:
 *   - name: Catálogos
 *     description: Endpoints para la gestión de catálogos base (Países, Roles, Tipos de Transacción)
 */

// =========================================================================
// RUTAS: PAISES
// =========================================================================

/**
 * @swagger
 * /paises:
 *   get:
 *     summary: Obtiene la lista de todos los países.
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de países obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idPais:
 *                     type: integer
 *                     example: 502
 *                   nombrePais:
 *                     type: string
 *                     example: Guatemala
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/paises', PaisController.getAllPaises);

/**
 * @swagger
 * /paises:
 *   post:
 *     summary: Crea un nuevo país.
 *     tags: [Catálogos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombrePais:
 *                 type: string
 *                 example: Honduras
 *     responses:
 *       201:
 *         description: País creado con éxito.
 *       400:
 *         description: El nombre del país es obligatorio.
 */
router.post('/paises', PaisController.createPais);

/**
 * @swagger
 * /paises/{id}:
 *   get:
 *     summary: Obtiene un país por su ID.
 *     tags: [Catálogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del país
 *     responses:
 *       200:
 *         description: País encontrado.
 *       404:
 *         description: País no encontrado.
 *
 *   put:
 *     summary: Actualiza un país por su ID.
 *     tags: [Catálogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del país a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombrePais:
 *                 type: string
 *                 example: Honduras Central
 *     responses:
 *       200:
 *         description: País actualizado con éxito.
 *       404:
 *         description: País no encontrado.
 *
 *   delete:
 *     summary: Elimina un país por su ID.
 *     tags: [Catálogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del país a eliminar.
 *     responses:
 *       200:
 *         description: País eliminado con éxito.
 *       409:
 *         description: Conflicto, el país está referenciado por otras tablas.
 */
router.get('/paises/:id', PaisController.getPaisById);
router.put('/paises/:id', PaisController.updatePais);
router.delete('/paises/:id', PaisController.deletePais);

// =========================================================================
// RUTAS: ROLES
// =========================================================================

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Obtiene la lista de todos los roles.
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de roles obtenida con éxito.
 */
router.get('/roles', RolController.getAllRoles);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Crea un nuevo rol.
 *     tags: [Catálogos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreRol:
 *                 type: string
 *                 example: Administrador
 *               descripcionRol:
 *                 type: string
 *                 example: Control total del sistema
 *     responses:
 *       201:
 *         description: Rol creado con éxito.
 */
router.post('/roles', RolController.createRol);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Obtiene un rol por su ID.
 *     tags: [Catálogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rol obtenido con éxito.
 *       404:
 *         description: Rol no encontrado.
 *
 *   put:
 *     summary: Actualiza un rol por su ID.
 *     tags: [Catálogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreRol:
 *                 type: string
 *                 example: Admin General
 *               descripcionRol:
 *                 type: string
 *                 example: Control casi total
 *     responses:
 *       200:
 *         description: Rol actualizado con éxito.
 *
 *   delete:
 *     summary: Elimina un rol por su ID.
 *     tags: [Catálogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rol eliminado con éxito.
 *       409:
 *         description: Conflicto, el rol está asociado a usuarios.
 */
router.get('/roles/:id', RolController.getRolById);
router.put('/roles/:id', RolController.updateRol);
router.delete('/roles/:id', RolController.deleteRol);

// =========================================================================
// RUTAS: TIPOS DE TRANSACCIÓN
// =========================================================================

/**
 * @swagger
 * /tipos-trx:
 *   get:
 *     summary: Obtiene la lista de todos los tipos de transacción.
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de tipos de transacción obtenida con éxito.
 */
router.get('/tipos-trx', TipoTransaccionController.getAllTiposTrx);

/**
 * @swagger
 * /tipos-trx:
 *   post:
 *     summary: Crea un nuevo tipo de transacción.
 *     tags: [Catálogos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigoTrx:
 *                 type: string
 *                 example: ING
 *                 maxLength: 3
 *               descripcionTrx:
 *                 type: string
 *                 example: Ingreso por Venta
 *     responses:
 *       201:
 *         description: Tipo de transacción creado con éxito.
 */
router.post('/tipos-trx', TipoTransaccionController.createTipoTrx);

/**
 * @swagger
 * /tipos-trx/{id}:
 *   get:
 *     summary: Obtiene un tipo de transacción por su ID.
 *     tags: [Catálogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de transacción encontrado.
 *       404:
 *         description: No encontrado.
 *
 *   put:
 *     summary: Actualiza un tipo de transacción por su ID.
 *     tags: [Catálogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigoTrx:
 *                 type: string
 *                 example: EGR
 *                 maxLength: 3
 *               descripcionTrx:
 *                 type: string
 *                 example: Egreso por Compra
 *     responses:
 *       200:
 *         description: Tipo de transacción actualizado con éxito.
 *
 *   delete:
 *     summary: Elimina un tipo de transacción por su ID.
 *     tags: [Catálogos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de transacción eliminado con éxito.
 *       409:
 *         description: Conflicto, el tipo está asociado a transacciones de caja.
 */
router.get('/tipos-trx/:id', TipoTransaccionController.getTipoTrxById);
router.put('/tipos-trx/:id', TipoTransaccionController.updateTipoTrx);
router.delete('/tipos-trx/:id', TipoTransaccionController.deleteTipoTrx);

module.exports = router;
