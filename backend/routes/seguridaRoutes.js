// routes/seguridad.routes.js

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const UsuarioController = require('../controllers/usuarioController');
const BitacoraController = require('../controllers/bitacoraController');
const LoginAttemptController = require('../controllers/loginAttemptController');

/**
 * @swagger
 * tags:
 *   - name: Seguridad y Auditoría
 *     description: Gestión de usuarios, autenticación (login/logout) y logs del sistema.
 */

// =========================================================================
// RUTAS: AUTENTICACIÓN
// =========================================================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y genera tokens (Access y Refresh).
 *     tags: [Seguridad y Auditoría]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *                 example: "admin"
 *               contrasena:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna tokens JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Credenciales inválidas.
 */
router.post('/auth/login', AuthController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cierra la sesión revocando el token de refresco.
 *     tags: [Seguridad y Auditoría]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión cerrada con éxito.
 *       400:
 *         description: Token de refresco no proporcionado.
 */
router.post('/auth/logout', AuthController.logout);

// =========================================================================
// RUTAS: USUARIOS (ADMIN)
// =========================================================================

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene todos los usuarios del sistema. (ADMIN)
 *     tags: [Seguridad y Auditoría]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente.
 *   post:
 *     summary: Crea un nuevo usuario.
 *     tags: [Seguridad y Auditoría]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *                 example: "nuevo_user"
 *               contrasena:
 *                 type: string
 *                 example: "secure123"
 *               idRol:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Usuario creado con éxito.
 *       409:
 *         description: El nombre de usuario ya existe.
 */
router.get('/usuarios', UsuarioController.getAllUsuarios);
router.post('/usuarios', UsuarioController.createUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualiza la información de un usuario (nombre o rol).
 *     tags: [Seguridad y Auditoría]
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
 *               nombreUsuario:
 *                 type: string
 *               idRol:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *   delete:
 *     summary: Elimina un usuario.
 *     tags: [Seguridad y Auditoría]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *       409:
 *         description: Conflicto, el usuario está referenciado en auditoría o transacciones.
 */
router.put('/usuarios/:id', UsuarioController.updateUsuario);
router.delete('/usuarios/:id', UsuarioController.deleteUsuario);

// =========================================================================
// RUTAS: AUDITORÍA (BITÁCORA)
// =========================================================================

/**
 * @swagger
 * /bitacora:
 *   get:
 *     summary: Obtiene los últimos registros de la bitácora de actividad.
 *     tags: [Seguridad y Auditoría]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           maximum: 500
 *         description: Número máximo de registros a devolver (máx. 500).
 *     responses:
 *       200:
 *         description: Registros obtenidos con éxito.
 */
router.get('/bitacora', BitacoraController.getLatest);

/**
 * @swagger
 * /bitacora/{id}:
 *   get:
 *     summary: Obtiene un registro de bitácora por su ID, incluyendo detalle de datos.
 *     tags: [Seguridad y Auditoría]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro obtenido correctamente.
 */
router.get('/bitacora/:id', BitacoraController.getLogById);

// =========================================================================
// RUTAS: INTENTOS DE LOGIN
// =========================================================================

/**
 * @swagger
 * /login-attempts:
 *   get:
 *     summary: Obtiene los últimos intentos de inicio de sesión (fallidos y exitosos).
 *     tags: [Seguridad y Auditoría]
 *     responses:
 *       200:
 *         description: Lista de intentos obtenida correctamente.
 */
router.get('/login-attempts', LoginAttemptController.getLatest);

/**
 * @swagger
 * /login-attempts/failures/ip/{ip}:
 *   get:
 *     summary: Cuenta los intentos de login fallidos recientes por dirección IP.
 *     tags: [Seguridad y Auditoría]
 *     parameters:
 *       - in: path
 *         name: ip
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: minutes
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Rango de tiempo en minutos a verificar.
 *     responses:
 *       200:
 *         description: Conteo de intentos fallidos.
 */
router.get('/login-attempts/failures/ip/:ip', LoginAttemptController.countFailuresByIp);

module.exports = router;
