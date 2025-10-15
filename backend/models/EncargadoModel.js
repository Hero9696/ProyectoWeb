// models/EncargadoModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla Encargados.
 * Dependencias: Paises, Departamentos, Municipios, Lugares, Usuarios (2 veces)
 */
class EncargadoModel {

    /**
     * Obtiene todos los encargados con la información detallada.
     */
    static async findAll() {
        const query = `
            SELECT 
                e.idEncargado, 
                e.IdentificacionEncarga,
                CONCAT(e.nombre1Encargado, ' ', e.apellido1Encargado) AS nombreCompleto,
                e.telefonoEncargado, 
                e.correoEncargado,
                p.nombrePais AS pais,
                d.nombreDepartamento AS departamento,
                m.nombreMunicipio AS municipio,
                l.nombreLugar AS lugar,
                e.fechaIngresoEncarga, 
                u_ing.nombreUsuario AS usuarioIngreso,
                e.fechaActualizacion,
                u_act.nombreUsuario AS usuarioActualiza
            FROM Encargados e
            JOIN Paises p ON e.idPaisEncargado = p.idPais
            JOIN Departamentos d ON e.idDepartamentoEncargado = d.idDepartamento
            JOIN Municipios m ON e.idMuniEncarga = m.idMunicipio
            JOIN Lugares l ON e.idLugarEncargado = l.idLugar
            JOIN Usuarios u_ing ON e.idUsuarioIngreso = u_ing.idUsuario
            JOIN Usuarios u_act ON e.idUsuarioActualiza = u_act.idUsuario
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Obtiene un encargado por su ID.
     */
    static async findById(id) {
        const query = `
            SELECT 
                e.*, 
                p.nombrePais,
                d.nombreDepartamento,
                m.nombreMunicipio,
                l.nombreLugar,
                u_ing.nombreUsuario AS usuarioIngreso,
                u_act.nombreUsuario AS usuarioActualiza
            FROM Encargados e
            JOIN Paises p ON e.idPaisEncargado = p.idPais
            JOIN Departamentos d ON e.idDepartamentoEncargado = d.idDepartamento
            JOIN Municipios m ON e.idMuniEncarga = m.idMunicipio
            JOIN Lugares l ON e.idLugarEncargado = l.idLugar
            JOIN Usuarios u_ing ON e.idUsuarioIngreso = u_ing.idUsuario
            JOIN Usuarios u_act ON e.idUsuarioActualiza = u_act.idUsuario
            WHERE e.idEncargado = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }

    /**
     * Crea un nuevo encargado.
     */
    static async create(data) {
        // Desestructuramos los datos para la inserción
        const {
            IdentificacionEncarga, nombre1Encargado, nombre2Encargado, nombre3Encargado,
            apellido1Encargado, apellido2Encargado, apellido3Encargado,
            idPaisEncargado, idDepartamentoEncargado, idMuniEncarga, idLugarEncargado,
            telefonoEncargado, correoEncargado, idUsuarioIngreso
        } = data;

        const [result] = await pool.query(
            `INSERT INTO Encargados (
                IdentificacionEncarga, nombre1Encargado, nombre2Encargado, nombre3Encargado,
                apellido1Encargado, apellido2Encargado, apellido3Encargado,
                idPaisEncargado, idDepartamentoEncargado, idMuniEncarga, idLugarEncargado,
                telefonoEncargado, correoEncargado, 
                fechaIngresoEncarga, horaIngresoEncarga, idUsuarioIngreso,
                fechaActualizacion, horaActualizacion, idUsuarioActualiza
             ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                CURDATE(), CURTIME(), ?, 
                CURDATE(), CURTIME(), ?
             )`,
            [
                IdentificacionEncarga, nombre1Encargado, nombre2Encargado, nombre3Encargado,
                apellido1Encargado, apellido2Encargado, apellido3Encargado,
                idPaisEncargado, idDepartamentoEncargado, idMuniEncarga, idLugarEncargado,
                telefonoEncargado, correoEncargado, 
                idUsuarioIngreso, // idUsuarioIngreso
                idUsuarioIngreso  // idUsuarioActualiza (Inicialmente el mismo que el de ingreso)
            ]
        );
        return result.insertId;
    }

    /**
     * Actualiza la información de un encargado.
     * @param {number} id - ID del encargado a actualizar.
     * @param {Object} data - Datos a actualizar, incluyendo idUsuarioActualiza.
     */
    static async update(id, data) {
        const {
            IdentificacionEncarga, nombre1Encargado, nombre2Encargado, nombre3Encargado,
            apellido1Encargado, apellido2Encargado, apellido3Encargado,
            idPaisEncargado, idDepartamentoEncargado, idMuniEncarga, idLugarEncargado,
            telefonoEncargado, correoEncargado, idUsuarioActualiza // <-- Importante: el usuario que actualiza
        } = data;

        const [result] = await pool.query(
            `UPDATE Encargados SET 
                IdentificacionEncarga = ?, nombre1Encargado = ?, nombre2Encargado = ?, nombre3Encargado = ?,
                apellido1Encargado = ?, apellido2Encargado = ?, apellido3Encargado = ?,
                idPaisEncargado = ?, idDepartamentoEncargado = ?, idMuniEncarga = ?, idLugarEncargado = ?,
                telefonoEncargado = ?, correoEncargado = ?, 
                fechaActualizacion = CURDATE(), horaActualizacion = CURTIME(), idUsuarioActualiza = ?
             WHERE idEncargado = ?`,
            [
                IdentificacionEncarga, nombre1Encargado, nombre2Encargado, nombre3Encargado,
                apellido1Encargado, apellido2Encargado, apellido3Encargado,
                idPaisEncargado, idDepartamentoEncargado, idMuniEncarga, idLugarEncargado,
                telefonoEncargado, correoEncargado, idUsuarioActualiza, id
            ]
        );
        return result.affectedRows;
    }

    /**
     * Elimina un encargado por su ID.
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Encargados WHERE idEncargado = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = EncargadoModel;