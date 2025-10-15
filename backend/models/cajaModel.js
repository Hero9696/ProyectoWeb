// models/CajaModel.js

const pool = require('../config/dbconfig'); // <-- Corregida la importación

/**
 * Modelo para la tabla Caja (Monto total).
 * Dependencia: Usuarios
 */
class CajaModel {
    
    /**
     * Obtiene el registro único de la caja, incluyendo el usuario que lo actualizó.
     * @param {Object} dbInstance - El pool o una conexión (para transacciones).
     * @param {boolean} forUpdate - Si es TRUE, añade FOR UPDATE para bloquear la fila en una transacción.
     */
    static async find(dbInstance = pool, forUpdate = false) {
        // Cláusula de bloqueo: crucial para la atomicidad en la tabla Caja
        const lockClause = forUpdate ? ' FOR UPDATE' : ''; 
        
        const query = `
            SELECT 
                c.idCaja, 
                c.montoTotal, 
                DATE_FORMAT(c.fechaActualizacion, '%Y-%m-%d') as fechaActualizacion, 
                TIME_FORMAT(c.horaActualizacion, '%H:%i:%s') as horaActualizacion, 
                c.idUsuarioActualiza, 
                u.nombreUsuario AS usuarioActualiza
            FROM Caja c
            LEFT JOIN Usuarios u ON c.idUsuarioActualiza = u.idUsuario
            LIMIT 1
            ${lockClause}
        `;
        
        const [rows] = await dbInstance.query(query);
        return rows[0] || null;
    }
    
    /**
     * Inicializa o actualiza el registro de la caja.
     * NOTA: Este método está diseñado para ser llamado fuera de la transacción principal.
     * La lógica principal de UPDATE dentro de la transacción se realiza con un connection.query() directo en el Controller.
     * * @param {number} idUsuarioActualiza - ID del usuario que realiza la operación.
     * @param {number} montoTotal - El nuevo monto total de la caja.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    static async updateMonto(idCaja, montoTotal, idUsuarioActualiza) {
        const [result] = await pool.query(
            `INSERT INTO Caja (idCaja, montoTotal, fechaActualizacion, horaActualizacion, idUsuarioActualiza) 
             VALUES (?, ?, CURDATE(), CURTIME(), ?)
             ON DUPLICATE KEY UPDATE 
                montoTotal = VALUES(montoTotal),
                fechaActualizacion = CURDATE(),
                horaActualizacion = CURTIME(),
                idUsuarioActualiza = VALUES(idUsuarioActualiza)`,
            [idCaja, montoTotal, idUsuarioActualiza]
        );
        // affectedRows será 1 para INSERT, 2 para UPDATE.
        return result.affectedRows; 
    }
}

module.exports = CajaModel;