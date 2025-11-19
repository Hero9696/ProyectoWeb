// controllers/AuthController.js

const UsuarioModel      = require('../models/usuarioModel');
const AuthTokenModel    = require('../models/authTokenModel');
const LoginAttemptModel = require('../models/loginAttemptModel');
const BitacoraModel     = require('../models/bitacoraModel');

const jwt = require('jsonwebtoken'); 

const JWT_SECRET          = process.env.JWT_SECRET || 'mi_secreto_super_seguro_e_irrepetible';
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

class AuthController {

    static generateTokens(idUsuario, nombreUsuario, idRol) {
        const payload = { idUsuario, nombreUsuario, idRol };
        
        const accessToken  = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
        const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
        
        return { accessToken, refreshToken };
    }

static async login(req, res) {
        const { nombreUsuario, contrasena } = req.body;
        const ip_address = req.ip;
        const user_agent = req.headers['user-agent'];
        
        if (!nombreUsuario || !contrasena) {
            return res.status(400).json({ message: 'El nombre de usuario y la contraseña son obligatorios.' });
        }

        try {
            const user = await UsuarioModel.findByUsername(nombreUsuario);

            if (!user) {
                await LoginAttemptModel.create({
                    nombreUsuarioIntentado: nombreUsuario,
                    success: 0,
                    failure_reason: 'Usuario no existe',
                    ip_address,
                    user_agent
                });
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

            // 🔐 AHORA SE USA comparePassword (acepta hash y texto plano)
            const isMatch = await UsuarioModel.comparePassword(contrasena, user.contrasena);

            if (!isMatch) {
                await LoginAttemptModel.create({
                    idUsuario: user.idUsuario,
                    nombreUsuarioIntentado: nombreUsuario,
                    success: 0,
                    failure_reason: 'Contraseña incorrecta',
                    ip_address,
                    user_agent
                });
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }

            const { accessToken, refreshToken } =
                AuthController.generateTokens(user.idUsuario, user.nombreUsuario, user.idRol);
            
            await AuthTokenModel.create({
                idUsuario:  user.idUsuario,
                token_hash: refreshToken, 
                token_type: 'refresh',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 19)
                  .replace('T', ' '),
                ip_address,
                user_agent
            });

            await LoginAttemptModel.create({
                idUsuario: user.idUsuario,
                nombreUsuarioIntentado: nombreUsuario,
                success: 1,
                ip_address,
                user_agent
            });
            
            await BitacoraModel.create({
                idUsuario: user.idUsuario,
                accion: 'LOGIN',
                tabla: 'Usuarios',
                pk_afectada: user.idUsuario.toString(),
                descripcion: `Inicio de sesión exitoso.`
            });

            return res.status(200).json({ 
                message: 'Inicio de sesión exitoso.', 
                accessToken, 
                refreshToken, 
                user: { 
                    idUsuario:      user.idUsuario, 
                    nombreUsuario:  user.nombreUsuario, 
                    idRol:          user.idRol 
                }
            });

        } catch (error) {
            console.error('Error durante el login:', error.message);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    static async logout(req, res) {
        const { refreshToken } = req.body;
        const ip_address = req.ip; 

        if (!refreshToken) {
            return res.status(400).json({ message: 'El token de refresco es obligatorio.' });
        }

        try {
            const tokenRecord = await AuthTokenModel.findValidByHash(refreshToken);

            if (!tokenRecord) {
                return res.status(401).json({ message: 'Token no válido o ya revocado.' });
            }

            await AuthTokenModel.revokeById(tokenRecord.id);

            await BitacoraModel.create({
                idUsuario: tokenRecord.idUsuario,
                accion: 'LOGOUT',
                tabla: 'AuthTokens',
                pk_afectada: tokenRecord.id.toString(),
                descripcion: `Cierre de sesión.`
            });

            return res.status(200).json({ message: 'Sesión cerrada con éxito.' });

        } catch (error) {
            console.error('Error durante el logout:', error.message);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = AuthController;
