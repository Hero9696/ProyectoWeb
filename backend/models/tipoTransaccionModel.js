// models/TipoTransaccionModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla TiposTransacciones (Catálogo de Caja).
 * Implementa las funciones CRUD.
 */
class TipoTransaccionModel {

    /**
     * Obtiene todos los tipos de transacciones.
     */
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM TiposTransacciones');
        return rows;
    }

    /**
     * Obtiene un tipo de transacción por su ID.
     */
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM TiposTransacciones WHERE idTipoTrx = ?', [id]);
        return rows[0] || null;
    }

    /**
     * Crea un nuevo tipo de transacción.
     * @param {Object} data - Los datos del nuevo tipo de transacción.
     * @param {string} data.codigoTrx - Código de 3 caracteres del tipo de transacción (p.e., 'ING', 'EGR').
     * @param {string} data.descripcionTrx - Descripción del tipo de transacción.
     * @returns {Promise<number>} El ID insertado.
     */
    static async create({ codigoTrx, descripcionTrx }) {
        const [result] = await pool.query(
            'INSERT INTO TiposTransacciones (codigoTrx, descripcionTrx) VALUES (?, ?)',
            [codigoTrx, descripcionTrx]
        );
        return result.insertId;
    }

    /**
     * Actualiza la información de un tipo de transacción.
     */
    static async update(id, { codigoTrx, descripcionTrx }) {
        const [result] = await pool.query(
            'UPDATE TiposTransacciones SET codigoTrx = ?, descripcionTrx = ? WHERE idTipoTrx = ?',
            [codigoTrx, descripcionTrx, id]
        );
        return result.affectedRows;
    }

    /**
     * Elimina un tipo de transacción por su ID.
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM TiposTransacciones WHERE idTipoTrx = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = TipoTransaccionModel;