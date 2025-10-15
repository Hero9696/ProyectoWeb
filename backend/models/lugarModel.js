// models/LugarModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla Lugares (Entidad Geográfica final).
 * Dependencias: Paises, Departamentos, Municipios
 */
class LugarModel {

    /**
     * Obtiene todos los lugares con la jerarquía completa.
     */
    static async findAll() {
        const query = `
            SELECT 
                l.idLugar, 
                l.nombreLugar,
                l.idPaisLugar, 
                p.nombrePais,
                l.idDepartamentoLugar, 
                d.nombreDepartamento,
                l.idMunicipioLugar, 
                m.nombreMunicipio
            FROM Lugares l
            JOIN Paises p ON l.idPaisLugar = p.idPais
            JOIN Departamentos d ON l.idDepartamentoLugar = d.idDepartamento
            JOIN Municipios m ON l.idMunicipioLugar = m.idMunicipio
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Obtiene un lugar por su ID.
     */
    static async findById(id) {
        const query = `
            SELECT 
                l.idLugar, 
                l.nombreLugar,
                l.idPaisLugar, 
                p.nombrePais,
                l.idDepartamentoLugar, 
                d.nombreDepartamento,
                l.idMunicipioLugar, 
                m.nombreMunicipio
            FROM Lugares l
            JOIN Paises p ON l.idPaisLugar = p.idPais
            JOIN Departamentos d ON l.idDepartamentoLugar = d.idDepartamento
            JOIN Municipios m ON l.idMunicipioLugar = m.idMunicipio
            WHERE l.idLugar = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }

    /**
     * Crea un nuevo lugar.
     * @param {Object} data - Los datos del nuevo lugar.
     * @returns {Promise<number>} El ID del lugar insertado.
     */
    static async create({ idPaisLugar, idDepartamentoLugar, idMunicipioLugar, nombreLugar }) {
        const [result] = await pool.query(
            'INSERT INTO Lugares (idPaisLugar, idDepartamentoLugar, idMunicipioLugar, nombreLugar) VALUES (?, ?, ?, ?)',
            [idPaisLugar, idDepartamentoLugar, idMunicipioLugar, nombreLugar]
        );
        return result.insertId;
    }

    /**
     * Actualiza la información de un lugar.
     */
    static async update(id, { idPaisLugar, idDepartamentoLugar, idMunicipioLugar, nombreLugar }) {
        const [result] = await pool.query(
            `UPDATE Lugares SET 
                idPaisLugar = ?, 
                idDepartamentoLugar = ?, 
                idMunicipioLugar = ?, 
                nombreLugar = ? 
             WHERE idLugar = ?`,
            [idPaisLugar, idDepartamentoLugar, idMunicipioLugar, nombreLugar, id]
        );
        return result.affectedRows;
    }

    /**
     * Elimina un lugar por su ID.
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Lugares WHERE idLugar = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = LugarModel;