// models/LoginAttemptModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla LoginAttempts (Registro de intentos de inicio de sesión).
 * Dependencia: Usuarios (Puede ser NULL)
 */
class LoginAttemptModel {

    /**
     * Obtiene los últimos intentos de inicio de sesión.
     */
    static async findLatest(limit = 50) {
        const query = `
            SELECT 
                l.*,
                u.nombreUsuario AS usuarioExistente
            FROM LoginAttempts l
            LEFT JOIN Usuarios u ON l.idUsuario = u.idUsuario
            ORDER BY l.attempted_at DESC
            LIMIT ?
        `;
        const [rows] = await pool.query(query, [limit]);
        return rows;
    }

    /**
     * Registra un nuevo intento de inicio de sesión.
     * * @param {Object} data - Datos del intento.
     * @param {number|null} [data.idUsuario] - ID del usuario (si fue exitoso o el usuario existe, si no, NULL).
     * @param {string|null} [data.nombreUsuarioIntentado] - Nombre de usuario utilizado.
     * @param {string|null} [data.emailIntentado] - Email utilizado.
     * @param {string|null} [data.ip_address] - Dirección IP.
     * @param {string|null} [data.user_agent] - User Agent.
     * @param {boolean} data.success - Éxito (1) o fracaso (0).
     * @param {string|null} [data.failure_reason] - Razón del fracaso.
     * @returns {Promise<number>} El ID del registro insertado.
     */
    static async create({ 
        idUsuario = null, 
        nombreUsuarioIntentado = null, 
        emailIntentado = null, 
        ip_address = null, 
        user_agent = null, 
        success, 
        failure_reason = null 
    }) {
        const [result] = await pool.query(
            `INSERT INTO LoginAttempts (
                idUsuario, nombreUsuarioIntentado, emailIntentado, ip_address, 
                user_agent, success, failure_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                idUsuario, nombreUsuarioIntentado, emailIntentado, ip_address, 
                user_agent, success, failure_reason
            ]
        );
        return result.insertId;
    }

    /**
     * Cuenta los intentos fallidos para un nombre de usuario o IP en un rango de tiempo.
     * Útil para implementar límites de tasa (rate limiting).
     * @param {string} identifier - Nombre de usuario o IP.
     * @param {string} field - 'nombreUsuarioIntentado' o 'ip_address'.
     * @param {number} minutes - Rango de tiempo en minutos.
     */
    static async countRecentFailures(identifier, field, minutes) {
        const query = `
            SELECT COUNT(*) AS count
            FROM LoginAttempts
            WHERE 
                ${field} = ? AND 
                success = 0 AND 
                attempted_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
        `;
        const [rows] = await pool.query(query, [identifier, minutes]);
        return rows[0].count;
    }
}

module.exports = LoginAttemptModel;