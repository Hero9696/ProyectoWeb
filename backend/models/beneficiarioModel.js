// models/BeneficiarioModel.js

const pool = require('../config/dbconfig'); // Corregido a db.config

/**
 * Modelo para la tabla beneficiarios.
 * Dependencias: Paises, Departamentos, Municipios, Lugares, Encargados, Usuarios (2 veces)
 */
class BeneficiarioModel {

    /**
     * Obtiene todos los beneficiarios con la información detallada.
     */
    static async findAll() {
        const query = `
            SELECT 
                b.idBeneficiario,
                CONCAT(b.nombre1Beneficiario, ' ', b.apellido1Beneficiario) AS nombreCompleto,
                b.estadoBeneficiario, -- Agregado para visibilidad
                CONCAT(e.nombre1Encargado, ' ', e.apellido1Encargado) AS nombreEncargado,
                l.nombreLugar AS lugar,
                b.fechaIngresoBene, 
                u_ing.nombreUsuario AS usuarioIngreso
            FROM beneficiarios b
            JOIN Encargados e ON b.idEncargadoBene = e.idEncargado -- Corregido FK
            JOIN Lugares l ON b.idLugarBene = l.idLugar -- Corregido FK
            JOIN Usuarios u_ing ON b.idUsuarioIngreso = u_ing.idUsuario
            ORDER BY b.apellido1Beneficiario
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Obtiene un beneficiario por su ID, incluyendo toda la jerarquía de ubicación y auditores.
     */
    static async findById(id) {
        const query = `
            SELECT 
                b.*, 
                p.nombrePais,
                d.nombreDepartamento,
                m.nombreMunicipio,
                l.nombreLugar,
                CONCAT(e.nombre1Encargado, ' ', e.apellido1Encargado) AS nombreEncargado,
                u_ing.nombreUsuario AS usuarioIngreso,
                u_act.nombreUsuario AS usuarioActualiza
            FROM beneficiarios b
            JOIN Paises p ON b.idPaisBene = p.idPais                -- Corregido FK
            JOIN Departamentos d ON b.idDepartamentoBene = d.idDepartamento -- Corregido FK
            JOIN Municipios m ON b.idMunicipioBene = m.idMunicipio    -- Corregido FK
            JOIN Lugares l ON b.idLugarBene = l.idLugar              -- Corregido FK
            JOIN Encargados e ON b.idEncargadoBene = e.idEncargado      -- Corregido FK
            JOIN Usuarios u_ing ON b.idUsuarioIngreso = u_ing.idUsuario
            JOIN Usuarios u_act ON b.idUsuarioActualiza = u_act.idUsuario
            WHERE b.idBeneficiario = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }

    /**
     * Crea un nuevo beneficiario.
     */
    static async create(data) {
        const {
            nombre1Beneficiario, nombre2Beneficiario, nombre3Beneficiario,
            apellido1Beneficiario, apellido2Beneficiario, apellido3Beneficiario,
            idPaisBene, idDepartamentoBene, idMunicipioBene, idLugarBene, estadoBeneficiario,
            idEncargadoBene, idUsuarioIngreso
        } = data;

        const [result] = await pool.query(
            `INSERT INTO beneficiarios (
                nombre1Beneficiario, nombre2Beneficiario, nombre3Beneficiario,
                apellido1Beneficiario, apellido2Beneficiario, apellido3Beneficiario,
                idPaisBene, idDepartamentoBene, idMunicipioBene, idLugarBene, 
                idEncargadoBene, estadoBeneficiario,
                fechaIngresoBene, horaIngresoBene, idUsuarioIngreso,
                fechaActualizacion, horaActualizacion, idUsuarioActualiza
             ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                CURDATE(), CURTIME(), ?, 
                CURDATE(), CURTIME(), ?
             )`,
            [
                nombre1Beneficiario, nombre2Beneficiario, nombre3Beneficiario,
                apellido1Beneficiario, apellido2Beneficiario, apellido3Beneficiario,
                idPaisBene, idDepartamentoBene, idMunicipioBene, idLugarBene, 
                idEncargadoBene, estadoBeneficiario, // <-- estadoBeneficiario es obligatorio
                idUsuarioIngreso, // idUsuarioIngreso
                idUsuarioIngreso  // idUsuarioActualiza (Inicialmente el mismo que el de ingreso)
            ]
        );
        return result.insertId;
    }

    /**
     * Actualiza la información de un beneficiario.
     */
    static async update(id, data) {
        const {
            nombre1Beneficiario, nombre2Beneficiario, nombre3Beneficiario,
            apellido1Beneficiario, apellido2Beneficiario, apellido3Beneficiario,
            idPaisBene, idDepartamentoBene, idMunicipioBene, idLugarBene, estadoBeneficiario,
            idEncargadoBene, idUsuarioActualiza
        } = data;

        const [result] = await pool.query(
            `UPDATE beneficiarios SET 
                nombre1Beneficiario = ?, nombre2Beneficiario = ?, nombre3Beneficiario = ?,
                apellido1Beneficiario = ?, apellido2Beneficiario = ?, apellido3Beneficiario = ?,
                idPaisBene = ?, idDepartamentoBene = ?, idMunicipioBene = ?, idLugarBene = ?,
                idEncargadoBene = ?, estadoBeneficiario = ?,
                fechaActualizacion = CURDATE(), horaActualizacion = CURTIME(), idUsuarioActualiza = ?
             WHERE idBeneficiario = ?`,
            [
                nombre1Beneficiario, nombre2Beneficiario, nombre3Beneficiario,
                apellido1Beneficiario, apellido2Beneficiario, apellido3Beneficiario,
                idPaisBene, idDepartamentoBene, idMunicipioBene, idLugarBene,
                idEncargadoBene, estadoBeneficiario, idUsuarioActualiza, id
            ]
        );
        return result.affectedRows;
    }

    /**
     * Elimina un beneficiario por su ID.
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM beneficiarios WHERE idBeneficiario = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = BeneficiarioModel;