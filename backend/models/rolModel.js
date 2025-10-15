// models/RolModel.js

// Importamos el pool de conexiones
const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla Roles (Catálogo base).
 * Implementa las funciones CRUD.
 */
class RolModel {

    /**
     * Obtiene todos los roles.
     * @returns {Promise<Array>} Lista de roles.
     */
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM Roles');
        return rows;
    }

    /**
     * Obtiene un rol por su ID.
     * @param {number} id - El ID del rol.
     * @returns {Promise<Object|null>} El rol encontrado o null.
     */
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM Roles WHERE idRol = ?', [id]);
        return rows[0] || null;
    }

    /**
     * Crea un nuevo rol.
     * @param {Object} data - Los datos del nuevo rol.
     * @param {string} data.nombreRol - El nombre del rol.
     * @param {string} data.descripcionRol - La descripción del rol.
     * @returns {Promise<number>} El ID del rol insertado.
     */
    static async create({ nombreRol, descripcionRol }) {
        const [result] = await pool.query(
            'INSERT INTO Roles (nombreRol, descripcionRol) VALUES (?, ?)',
            [nombreRol, descripcionRol]
        );
        return result.insertId;
    }

    /**
     * Actualiza la información de un rol.
     * @param {number} id - El ID del rol a actualizar.
     * @param {Object} data - Los datos a actualizar.
     * @param {string} data.nombreRol - El nuevo nombre del rol.
     * @param {string} data.descripcionRol - La nueva descripción del rol.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    static async update(id, { nombreRol, descripcionRol }) {
        const [result] = await pool.query(
            'UPDATE Roles SET nombreRol = ?, descripcionRol = ? WHERE idRol = ?',
            [nombreRol, descripcionRol, id]
        );
        return result.affectedRows;
    }

    /**
     * Elimina un rol por su ID.
     * @param {number} id - El ID del rol a eliminar.
     * @returns {Promise<number>} El número de filas afectadas.
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Roles WHERE idRol = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = RolModel;