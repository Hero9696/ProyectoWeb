// models/PaisModel.js

// Importamos el pool de conexiones que creamos en el paso anterior
const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla Paises (Catálogo base).
 * Implementa las funciones CRUD (Crear, Leer, Actualizar, Borrar).
 */
class PaisModel {

    /**
     * Obtiene todos los países de la base de datos.
     * @returns {Promise<Array>} Lista de países.
     */
    static async findAll() {
        // En consultas de solo lectura (SELECT), usamos pool.query
        const [rows] = await pool.query('SELECT * FROM Paises');
        return rows;
    }

    /**
     * Obtiene un país por su ID.
     * @param {number} id - El ID del país.
     * @returns {Promise<Object|null>} El país encontrado o null si no existe.
     */
    static async findById(id) {
        // Usamos el placeholder '?' para sanitizar la entrada y prevenir inyección SQL
        const [rows] = await pool.query('SELECT * FROM Paises WHERE idPais = ?', [id]);
        return rows[0] || null; // Retorna el primer resultado o null
    }

    /**
     * Crea un nuevo país.
     * @param {Object} data - Los datos del nuevo país.
     * @param {string} data.nombrePais - El nombre del país.
     * @returns {Promise<number>} El ID del país insertado.
     */
    static async create({ nombrePais }) {
        const [result] = await pool.query(
            'INSERT INTO Paises (nombrePais) VALUES (?)',
            [nombrePais]
        );
        // 'insertId' contiene el ID auto-generado de la nueva fila
        return result.insertId;
    }

    /**
     * Actualiza la información de un país.
     * @param {number} id - El ID del país a actualizar.
     * @param {Object} data - Los datos a actualizar.
     * @param {string} data.nombrePais - El nuevo nombre del país.
     * @returns {Promise<number>} El número de filas afectadas (1 si fue exitoso, 0 si no se encontró).
     */
    static async update(id, { nombrePais }) {
        const [result] = await pool.query(
            'UPDATE Paises SET nombrePais = ? WHERE idPais = ?',
            [nombrePais, id]
        );
        // 'affectedRows' indica cuántas filas se modificaron
        return result.affectedRows;
    }

    /**
     * Elimina un país por su ID.
     * Nota: Si hay claves foráneas que dependen de este registro, la eliminación fallará (regla de integridad referencial).
     * @param {number} id - El ID del país a eliminar.
     * @returns {Promise<number>} El número de filas afectadas (1 si fue exitoso, 0 si no se encontró).
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Paises WHERE idPais = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = PaisModel;