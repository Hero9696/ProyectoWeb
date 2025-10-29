// models/TransaccionCajaModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla TransaccionesCaja.
 * Dependencias: TiposTransacciones, Usuarios, Caja
 */
class TransaccionCajaModel {

    /**
     * Obtiene todas las transacciones, mostrando los nombres de las entidades relacionadas.
     */
    static async findAll() {
        const query = `
            SELECT 
                t.idTransaccion, 
                t.montoTrx, 
                t.nuevoMonto, 
                t.fechaIngreso, 
                t.horaIngreso, 
                t.descripcionTrx,
                tt.descripcionTrx AS tipoTransaccion,
                u.nombreUsuario AS usuarioIngreso
            FROM TransaccionesCaja t
            JOIN TiposTransacciones tt ON t.idTipoTrx = tt.idTipoTrx
            JOIN Usuarios u ON t.idUsuarioIngreso = u.idUsuario
            ORDER BY t.fechaIngreso DESC, t.horaIngreso DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Registra una nueva transacción en la caja.
     * Esta función debe usarse dentro de una transacción de MySQL para asegurar 
     * que la tabla 'Caja' también se actualice atómicamente.
     * @param {Object} data - Datos de la transacción.
     * @param {number} data.idTipoTrx - ID del tipo de transacción.
     * @param {number} data.montoTrx - Monto de la transacción (positivo si es ingreso, negativo si es egreso).
     * @param {number} data.nuevoMonto - El monto total de la caja DESPUÉS de esta transacción.
     * @param {number} data.idUsuarioIngreso - ID del usuario que registra la transacción.
     * @param {number} data.idCajaTrx - ID de la caja (generalmente 1).
     * @param {string} data.descripcionTrx - Descripción del movimiento.
     * @returns {Promise<number>} El ID de la transacción insertada.
     */
    static async create(data) {
        const {
            idTipoTrx, montoTrx, nuevoMonto, idUsuarioIngreso, idCajaTrx, descripcionTrx
        } = data;

        // Nota: En un controlador, se debería obtener una conexión y usarla para 
        // asegurar que la actualización de 'Caja' y la inserción de 'TransaccionesCaja' 
        // se hagan en una sola transacción atómica (COMMIT/ROLLBACK).
        const [result] = await pool.query(
            `INSERT INTO TransaccionesCaja (
                idTipoTrx, montoTrx, nuevoMonto, fechaIngreso, horaIngreso, 
                idUsuarioIngreso, idCajaTrx, descripcionTrx
            ) VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, ?, ?)`,
            [
                idTipoTrx, montoTrx, nuevoMonto, 
                idUsuarioIngreso, idCajaTrx, descripcionTrx
            ]
        );
        return result.insertId;
    }

    /**
     * Encuentra una transacción por su ID.
     */
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM TransaccionesCaja WHERE idTransaccion = ?', 
            [id]
        );
        return rows[0] || null;
    }
    
    // Las transacciones de caja generalmente no se actualizan ni se eliminan 
    // para mantener la integridad contable.

    /**
     * Obtiene las últimas N transacciones, mostrando los nombres de las entidades relacionadas.
     * @param {number} limit - El número máximo de transacciones a devolver.
     */
    static async findLatest(limit) {
        const query = `
            SELECT 
                t.idTransaccion, 
                t.montoTrx, 
                t.nuevoMonto, 
                DATE_FORMAT(t.fechaIngreso, '%d/%m/%Y') as fechaIngreso, 
                TIME_FORMAT(t.horaIngreso, '%H:%i') as horaIngreso, 
                t.descripcionTrx,
                tt.descripcionTrx AS tipoTransaccion,
                u.nombreUsuario AS usuarioIngreso
            FROM TransaccionesCaja t
            JOIN TiposTransacciones tt ON t.idTipoTrx = tt.idTipoTrx
            JOIN Usuarios u ON t.idUsuarioIngreso = u.idUsuario
            ORDER BY t.fechaIngreso DESC, t.horaIngreso DESC
            LIMIT ?
        `;
        const [rows] = await pool.query(query, [limit]);
        return rows;
    }
}

module.exports = TransaccionCajaModel;