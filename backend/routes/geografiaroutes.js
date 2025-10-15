// routes/geografia.routes.js

const express = require('express');
const router = express.Router();

const DepartamentoController = require('../controllers/departamentoController');
const MunicipioController = require('../controllers/municipioController');
const LugarController = require('../controllers/lugarController');

/**
 * @swagger
 * tags:
 *   - name: Geografía
 *     description: Gestión de la división política y lugares.
 */

// =========================================================================
// RUTAS: DEPARTAMENTOS
// =========================================================================

/**
 * @swagger
 * /departamentos:
 *   get:
 *     summary: Obtiene todos los departamentos con el nombre del país asociado.
 *     tags: [Geografía]
 *     responses:
 *       200:
 *         description: Lista de departamentos obtenida correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/departamentos', DepartamentoController.getAllDepartamentos);

/**
 * @swagger
 * /departamentos:
 *   post:
 *     summary: Crea un nuevo departamento.
 *     tags: [Geografía]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idPaisDepa:
 *                 type: integer
 *                 example: 502
 *               nombreDepartamento:
 *                 type: string
 *                 example: Guatemala
 *     responses:
 *       201:
 *         description: Departamento creado con éxito.
 *       400:
 *         description: Error de validación o ID de país inexistente.
 */
router.post('/departamentos', DepartamentoController.createDepartamento);

/**
 * @swagger
 * /departamentos/{id}:
 *   get:
 *     summary: Obtiene un departamento por su ID.
 *     tags: [Geografía]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento.
 *     responses:
 *       200:
 *         description: Departamento encontrado.
 *       404:
 *         description: No encontrado.
 *
 *   put:
 *     summary: Actualiza un departamento por su ID.
 *     tags: [Geografía]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idPaisDepa:
 *                 type: integer
 *                 example: 502
 *               nombreDepartamento:
 *                 type: string
 *                 example: Guatemala Central
 *     responses:
 *       200:
 *         description: Departamento actualizado con éxito.
 *       404:
 *         description: No encontrado.
 *
 *   delete:
 *     summary: Elimina un departamento por su ID.
 *     tags: [Geografía]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del departamento a eliminar.
 *     responses:
 *       200:
 *         description: Departamento eliminado con éxito.
 *       409:
 *         description: Conflicto, el departamento tiene municipios o lugares asociados.
 */
router.get('/departamentos/:id', DepartamentoController.getDepartamentoById);
router.put('/departamentos/:id', DepartamentoController.updateDepartamento);
router.delete('/departamentos/:id', DepartamentoController.deleteDepartamento);

// =========================================================================
// RUTAS: MUNICIPIOS
// =========================================================================

/**
 * @swagger
 * /municipios:
 *   get:
 *     summary: Obtiene todos los municipios con su jerarquía (país, departamento).
 *     tags: [Geografía]
 *     responses:
 *       200:
 *         description: Lista de municipios obtenida correctamente.
 */
router.get('/municipios', MunicipioController.getAllMunicipios);

/**
 * @swagger
 * /municipios:
 *   post:
 *     summary: Crea un nuevo municipio.
 *     tags: [Geografía]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idDepartamentoMuni:
 *                 type: integer
 *                 example: 1
 *               idPaisMuni:
 *                 type: integer
 *                 example: 502
 *               nombreMunicipio:
 *                 type: string
 *                 example: Mixco
 *     responses:
 *       201:
 *         description: Municipio creado con éxito.
 *       400:
 *         description: Inconsistencia de jerarquía (el departamento no pertenece al país).
 */
router.post('/municipios', MunicipioController.createMunicipio);

/**
 * @swagger
 * /municipios/{id}:
 *   get:
 *     summary: Obtiene un municipio por su ID.
 *     tags: [Geografía]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del municipio.
 *     responses:
 *       200:
 *         description: Municipio encontrado.
 *       404:
 *         description: No encontrado.
 *
 *   put:
 *     summary: Actualiza un municipio por su ID.
 *     tags: [Geografía]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del municipio a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idDepartamentoMuni:
 *                 type: integer
 *                 example: 1
 *               idPaisMuni:
 *                 type: integer
 *                 example: 502
 *               nombreMunicipio:
 *                 type: string
 *                 example: San Pedro Sacatepéquez
 *     responses:
 *       200:
 *         description: Municipio actualizado con éxito.
 *
 *   delete:
 *     summary: Elimina un municipio por su ID.
 *     tags: [Geografía]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Municipio eliminado con éxito.
 *       409:
 *         description: Conflicto, el municipio está asociado a Lugares, Encargados o Donantes.
 */
router.get('/municipios/:id', MunicipioController.getMunicipioById);
router.put('/municipios/:id', MunicipioController.updateMunicipio);
router.delete('/municipios/:id', MunicipioController.deleteMunicipio);

// =========================================================================
// RUTAS: LUGARES
// =========================================================================

/**
 * @swagger
 * /lugares:
 *   get:
 *     summary: Obtiene todos los lugares con su jerarquía completa.
 *     tags: [Geografía]
 *     responses:
 *       200:
 *         description: Lista de lugares obtenida correctamente.
 */
router.get('/lugares', LugarController.getAllLugares);

/**
 * @swagger
 * /lugares:
 *   post:
 *     summary: Crea un nuevo lugar (ubicación final).
 *     tags: [Geografía]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idPaisLugar:
 *                 type: integer
 *                 example: 502
 *               idDepartamentoLugar:
 *                 type: integer
 *                 example: 1
 *               idMunicipioLugar:
 *                 type: integer
 *                 example: 101
 *               nombreLugar:
 *                 type: string
 *                 example: Colonia El Milagro
 *     responses:
 *       201:
 *         description: Lugar creado con éxito.
 *       400:
 *         description: Error de jerarquía de ubicación (no existe la combinación).
 */
router.post('/lugares', LugarController.createLugar);

/**
 * @swagger
 * /lugares/{id}:
 *   get:
 *     summary: Obtiene un lugar por su ID.
 *     tags: [Geografía]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lugar encontrado.
 *       404:
 *         description: No encontrado.
 *
 *   put:
 *     summary: Actualiza un lugar por su ID.
 *     tags: [Geografía]
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
 *               nombreLugar:
 *                 type: string
 *                 example: Zona 10
 *     responses:
 *       200:
 *         description: Lugar actualizado con éxito.
 *
 *   delete:
 *     summary: Elimina un lugar por su ID.
 *     tags: [Geografía]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lugar eliminado con éxito.
 *       409:
 *         description: Conflicto, el lugar está asociado a Encargados o Beneficiarios.
 */
router.get('/lugares/:id', LugarController.getLugarById);
router.put('/lugares/:id', LugarController.updateLugar);
router.delete('/lugares/:id', LugarController.deleteLugar);

module.exports = router;
