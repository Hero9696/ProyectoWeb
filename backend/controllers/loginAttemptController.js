// controllers/LoginAttemptController.js

const LoginAttemptModel = require('../models/loginAttemptModel');

/**
 * Controlador para la consulta de LoginAttempts (intentos de inicio de sesión).
 * Nota: Solo lectura para auditoría. La inserción se maneja en la lógica de autenticación (AuthService/UsuarioController).
 */
class LoginAttemptController {

    /**
     * Obtiene los últimos intentos de inicio de sesión. (GET /api/login-attempts)
     * Permite un parámetro de query `limit`.
     */
    static async getLatest(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            
            if (limit < 1 || limit > 500) {
                 return res.status(400).json({ message: 'El límite debe ser un número entre 1 y 500.' });
            }
            
            const attempts = await LoginAttemptModel.findLatest(limit);
            res.status(200).json(attempts);
        } catch (error) {
            console.error('Error al obtener intentos de login:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Endpoint de auditoría: Cuenta los intentos fallidos recientes por IP. (GET /api/login-attempts/failures/ip/:ip)
     * @param {string} ip - Dirección IP a verificar.
     * @param {number} minutes - Rango de tiempo en minutos (query param).
     */
    static async countFailuresByIp(req, res) {
        try {
            const { ip } = req.params;
            const minutes = parseInt(req.query.minutes) || 15; // Por defecto: últimos 15 minutos

            if (!ip || minutes < 1 || minutes > 60) {
                 return res.status(400).json({ message: 'IP y un rango de minutos válido (1-60) son requeridos.' });
            }

            const count = await LoginAttemptModel.countRecentFailures(ip, 'ip_address', minutes);
            res.status(200).json({ 
                ip_address: ip, 
                failed_attempts: count,
                time_range_minutes: minutes
            });
        } catch (error) {
            console.error('Error al contar intentos fallidos por IP:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = LoginAttemptController;