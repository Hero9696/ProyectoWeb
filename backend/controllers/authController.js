// controllers/AuthController.js

const UsuarioModel = require('../models/usuarioModel');
const AuthTokenModel = require('../models/authTokenModel');
const LoginAttemptModel = require('../models/loginAttemptModel');
const BitacoraModel = require('../models/bitacoraModel');

// Requerir JWT (necesitarás instalar y configurar 'jsonwebtoken')
const jwt = require('jsonwebtoken'); 
// Opcional: Instalar jsonwebtoken: npm install jsonwebtoken

// Configuración de tokens (debería ir en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_e_irrepetible';
const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hora
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 días

/**
 * Controlador dedicado a la autenticación (Login, Logout, Refresh).
 */
class AuthController {

    /**
     * Genera un par de tokens (acceso y refresco).
     */
    static generateTokens(idUsuario, nombreUsuario, idRol) {
        const payload = { idUsuario, nombreUsuario, idRol };
        
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
        
        return { accessToken, refreshToken };
    }

    /**
     * Inicia sesión de un usuario. (POST /api/auth/login)
     */
    static async login(req, res) {
        const { nombreUsuario, contrasena } = req.body;
        const ip_address = req.ip; // Express ya inyecta la IP
        const user_agent = req.headers['user-agent'];
        
        if (!nombreUsuario || !contrasena) {
            return res.status(400).json({ message: 'El nombre de usuario y la contraseña son obligatorios.' });
        }

        try {
            const user = await UsuarioModel.findByUsername(nombreUsuario);

            if (!user) {
                // Registro de intento fallido (usuario no encontrado)
                await LoginAttemptModel.create({ nombreUsuarioIntentado: nombreUsuario, success: 0, failure_reason: 'Usuario no existe', ip_address, user_agent });
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

            const isMatch = await UsuarioModel.comparePassword(contrasena, user.contrasena);

            if (!isMatch) {
                // Registro de intento fallido (contraseña incorrecta)
                await LoginAttemptModel.create({ idUsuario: user.idUsuario, nombreUsuarioIntentado: nombreUsuario, success: 0, failure_reason: 'Contraseña incorrecta', ip_address, user_agent });
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

            // Generación de Tokens
            const { accessToken, refreshToken } = AuthController.generateTokens(user.idUsuario, user.nombreUsuario, user.idRol);
            
            // Guardar Refresh Token en DB (se recomienda hashear el token antes de guardar, aquí guardamos el token completo para simplicidad)
            await AuthTokenModel.create({
                idUsuario: user.idUsuario,
                token_hash: refreshToken, // Aquí se debe guardar el hash del token
                token_type: 'refresh',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // Fecha + 7 días
                ip_address,
                user_agent
            });

            // Registro de éxito
            await LoginAttemptModel.create({ idUsuario: user.idUsuario, nombreUsuarioIntentado: nombreUsuario, success: 1, ip_address, user_agent });
            
            // Registro en Bitácora
            await BitacoraModel.create({
                idUsuario: user.idUsuario,
                accion: 'LOGIN',
                tabla: 'Usuarios',
                pk_afectada: user.idUsuario.toString(),
                descripcion: `Inicio de sesión exitoso.`
            });

            res.status(200).json({ 
                message: 'Inicio de sesión exitoso.', 
                accessToken, 
                refreshToken, 
                user: { idUsuario: user.idUsuario, nombreUsuario: user.nombreUsuario, idRol: user.idRol }
            });

        } catch (error) {
            console.error('Error durante el login:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Cierra la sesión (invalida el token de refresco). (POST /api/auth/logout)
     */
    static async logout(req, res) {
        const { refreshToken } = req.body;
        const ip_address = req.ip; 

        if (!refreshToken) {
            return res.status(400).json({ message: 'El token de refresco es obligatorio.' });
        }

        try {
            // Buscar el token en DB (usando el hash)
            const tokenRecord = await AuthTokenModel.findValidByHash(refreshToken);

            if (!tokenRecord) {
                return res.status(401).json({ message: 'Token no válido o ya revocado.' });
            }

            // Revocar el token
            await AuthTokenModel.revokeById(tokenRecord.id);

            // Registro en Bitácora
            await BitacoraModel.create({
                idUsuario: tokenRecord.idUsuario,
                accion: 'LOGOUT',
                tabla: 'AuthTokens',
                pk_afectada: tokenRecord.id.toString(),
                descripcion: `Cierre de sesión.`
            });

            res.status(200).json({ message: 'Sesión cerrada con éxito.' });

        } catch (error) {
            console.error('Error durante el logout:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = AuthController;