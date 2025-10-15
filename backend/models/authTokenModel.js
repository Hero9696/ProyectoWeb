// models/AuthTokenModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla AuthTokens (Tokens de seguridad).
 * Dependencia: Usuarios
 */
class AuthTokenModel {

    /**
     * Obtiene un token (no revocado y no expirado) por su hash.
     * @param {string} tokenHash - El hash del token (debe ser el que está guardado en la DB).
     * @returns {Promise<Object|null>} El token encontrado.
     */
    static async findValidByHash(tokenHash) {
        const query = `
            SELECT * FROM AuthTokens 
            WHERE 
                token_hash = ? AND 
                is_revoked = 0 AND 
                expires_at > NOW()
        `;
        const [rows] = await pool.query(query, [tokenHash]);
        return rows[0] || null;
    }

    /**
     * Registra un nuevo token.
     * @param {Object} data - Datos del token.
     * @param {number} data.idUsuario - ID del usuario.
     * @param {string} data.token_hash - Hash del token generado.
     * @param {string} data.token_type - Tipo de token ('access', 'refresh', etc.).
     * @param {string} data.expires_at - Marca de tiempo de expiración (formato SQL: 'YYYY-MM-DD HH:MM:SS').
     * @param {string|null} [data.ip_address] - IP.
     * @param {string|null} [data.user_agent] - User Agent.
     * @returns {Promise<number>} El ID del token insertado.
     */
    static async create({ idUsuario, token_hash, token_type, expires_at, ip_address = null, user_agent = null }) {
        const [result] = await pool.query(
            `INSERT INTO AuthTokens (
                idUsuario, token_hash, token_type, expires_at, is_revoked, 
                ip_address, user_agent
            ) VALUES (?, ?, ?, ?, 0, ?, ?)`,
            [
                idUsuario, token_hash, token_type, expires_at, 
                ip_address, user_agent
            ]
        );
        return result.insertId;
    }

    /**
     * Revoca (invalida) un token por su ID.
     * @param {number} id - ID del token.
     * @returns {Promise<number>} Filas afectadas.
     */
    static async revokeById(id) {
        const [result] = await pool.query(
            `UPDATE AuthTokens 
             SET is_revoked = 1, revoked_at = NOW() 
             WHERE id = ?`,
            [id]
        );
        return result.affectedRows;
    }

    /**
     * Revoca todos los tokens de un tipo para un usuario (ej: todos los tokens de acceso).
     */
    static async revokeAllUserTokensByType(idUsuario, token_type) {
        const [result] = await pool.query(
            `UPDATE AuthTokens 
             SET is_revoked = 1, revoked_at = NOW() 
             WHERE idUsuario = ? AND token_type = ? AND is_revoked = 0`,
            [idUsuario, token_type]
        );
        return result.affectedRows;
    }
}

module.exports = AuthTokenModel;