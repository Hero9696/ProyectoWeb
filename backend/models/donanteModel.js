// models/DonanteModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla Donantes.
 * Dependencias: Paises, Departamentos, Municipios, Usuarios (3 veces)
 */
class DonanteModel {

    /**
     * Obtiene todos los donantes con información detallada.
     */
    static async findAll() {
        const query = `
            SELECT 
                d.idDonador, 
                CONCAT(d.nombre1Donante, ' ', d.apellido1Donante) AS nombreCompleto,
                d.telefonoDonante, 
                p.nombrePais AS pais,
                dp.nombreDepartamento AS departamento,
                m.nombreMunicipio AS municipio,
                u_prop.nombreUsuario AS usuarioAsociado,
                u_ing.nombreUsuario AS usuarioIngreso
            FROM Donantes d
            JOIN Paises p ON d.idPaisDonante = p.idPais
            JOIN Departamentos dp ON d.idDepartamentoDona = dp.idDepartamento
            JOIN Municipios m ON d.idMunicipioDona = m.idMunicipio
            LEFT JOIN Usuarios u_prop ON d.idUsuarioDonante = u_prop.idUsuario -- LEFT JOIN por si el donante no es un usuario
            JOIN Usuarios u_ing ON d.idUsuarioIngreso = u_ing.idUsuario
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Obtiene un donante por su ID.
     */
    static async findById(id) {
        const query = `
            SELECT 
                d.*,
                p.nombrePais,
                dp.nombreDepartamento,
                m.nombreMunicipio,
                u_prop.nombreUsuario AS usuarioAsociado,
                u_ing.nombreUsuario AS usuarioIngreso,
                u_act.nombreUsuario AS usuarioActualiza
            FROM Donantes d
            JOIN Paises p ON d.idPaisDonante = p.idPais
            JOIN Departamentos dp ON d.idDepartamentoDona = dp.idDepartamento
            JOIN Municipios m ON d.idMunicipioDona = m.idMunicipio
            LEFT JOIN Usuarios u_prop ON d.idUsuarioDonante = u_prop.idUsuario
            JOIN Usuarios u_ing ON d.idUsuarioIngreso = u_ing.idUsuario
            JOIN Usuarios u_act ON d.idUsuarioActualiza = u_act.idUsuario
            WHERE d.idDonador = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }

    /**
     * Crea un nuevo donante.
     */
    static async create(data) {
        const {
            nombre1Donante, nombre2Donante, nombre3Donante,
            apellido1Donante, apellido2Donante, apellido3Donante,
            idPaisDonante, idDepartamentoDona, idMunicipioDona,
            telefonoDonante, idUsuarioDonante, idUsuarioIngreso
        } = data;

        const [result] = await pool.query(
            `INSERT INTO Donantes (
                nombre1Donante, nombre2Donante, nombre3Donante,
                apellido1Donante, apellido2Donante, apellido3Donante,
                idPaisDonante, idDepartamentoDona, idMunicipioDona,
                telefonoDonante, idUsuarioDonante, 
                fechaIngresoDona, horaIngresoDona, idUsuarioIngreso,
                fechaActualizacion, horaActualizacion, idUsuarioActualiza
             ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                CURDATE(), CURTIME(), ?, 
                CURDATE(), CURTIME(), ?
             )`,
            [
                nombre1Donante, nombre2Donante, nombre3Donante,
                apellido1Donante, apellido2Donante, apellido3Donante,
                idPaisDonante, idDepartamentoDona, idMunicipioDona,
                telefonoDonante, idUsuarioDonante, 
                idUsuarioIngreso, // idUsuarioIngreso
                idUsuarioIngreso  // idUsuarioActualiza (Inicialmente el mismo que el de ingreso)
            ]
        );
        return result.insertId;
    }

    /**
     * Actualiza la información de un donante.
     */
    static async update(id, data) {
        const {
            nombre1Donante, nombre2Donante, nombre3Donante,
            apellido1Donante, apellido2Donante, apellido3Donante,
            idPaisDonante, idDepartamentoDona, idMunicipioDona,
            telefonoDonante, idUsuarioDonante, idUsuarioActualiza
        } = data;

        const [result] = await pool.query(
            `UPDATE Donantes SET 
                nombre1Donante = ?, nombre2Donante = ?, nombre3Donante = ?,
                apellido1Donante = ?, apellido2Donante = ?, apellido3Donante = ?,
                idPaisDonante = ?, idDepartamentoDona = ?, idMunicipioDona = ?,
                telefonoDonante = ?, idUsuarioDonante = ?, 
                fechaActualizacion = CURDATE(), horaActualizacion = CURTIME(), idUsuarioActualiza = ?
             WHERE idDonador = ?`,
            [
                nombre1Donante, nombre2Donante, nombre3Donante,
                apellido1Donante, apellido2Donante, apellido3Donante,
                idPaisDonante, idDepartamentoDona, idMunicipioDona,
                telefonoDonante, idUsuarioDonante, idUsuarioActualiza, id
            ]
        );
        return result.affectedRows;
    }

    /**
     * Elimina un donante por su ID.
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Donantes WHERE idDonador = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = DonanteModel;