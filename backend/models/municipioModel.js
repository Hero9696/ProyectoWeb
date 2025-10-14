// models/MunicipioModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla Municipios.
 * Dependencias: Paises, Departamentos
 */
class MunicipioModel {

    /**
     * Obtiene todos los municipios, con los nombres del país y el departamento.
     */
    static async findAll() {
        const query = `
            SELECT 
                m.idMunicipio, 
                m.nombreMunicipio, 
                m.idDepartamentoMuni, 
                d.nombreDepartamento,
                m.idPaisMuni, 
                p.nombrePais
            FROM Municipios m
            JOIN Departamentos d ON m.idDepartamentoMuni = d.idDepartamento
            JOIN Paises p ON m.idPaisMuni = p.idPais
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Obtiene un municipio por su ID.
     */
    static async findById(id) {
        const query = `
            SELECT 
                m.idMunicipio, 
                m.nombreMunicipio, 
                m.idDepartamentoMuni, 
                d.nombreDepartamento,
                m.idPaisMuni, 
                p.nombrePais
            FROM Municipios m
            JOIN Departamentos d ON m.idDepartamentoMuni = d.idDepartamento
            JOIN Paises p ON m.idPaisMuni = p.idPais
            WHERE m.idMunicipio = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }
    
    /**
     * Obtiene todos los municipios de un departamento específico.
     */
    static async findByDepartamentoId(idDepartamento) {
        const [rows] = await pool.query(
            'SELECT * FROM Municipios WHERE idDepartamentoMuni = ?',
            [idDepartamento]
        );
        return rows;
    }

    /**
     * Crea un nuevo municipio.
     * @param {Object} data - Los datos del nuevo municipio.
     * @param {number} data.idDepartamentoMuni - ID del departamento.
     * @param {number} data.idPaisMuni - ID del país.
     * @param {string} data.nombreMunicipio - Nombre del municipio.
     * @returns {Promise<number>} El ID del municipio insertado.
     */
    static async create({ idDepartamentoMuni, idPaisMuni, nombreMunicipio }) {
        const [result] = await pool.query(
            'INSERT INTO Municipios (idDepartamentoMuni, idPaisMuni, nombreMunicipio) VALUES (?, ?, ?)',
            [idDepartamentoMuni, idPaisMuni, nombreMunicipio]
        );
        return result.insertId;
    }

    /**
     * Actualiza la información de un municipio.
     */
    static async update(id, { idDepartamentoMuni, idPaisMuni, nombreMunicipio }) {
        const [result] = await pool.query(
            'UPDATE Municipios SET idDepartamentoMuni = ?, idPaisMuni = ?, nombreMunicipio = ? WHERE idMunicipio = ?',
            [idDepartamentoMuni, idPaisMuni, nombreMunicipio, id]
        );
        return result.affectedRows;
    }

    /**
     * Elimina un municipio por su ID.
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Municipios WHERE idMunicipio = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = MunicipioModel;