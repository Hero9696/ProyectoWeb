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
    static async findAll(filtros = {}) {
        const { q = '', estado = '' } = filtros;

        let sql = `
            SELECT 
                b.idBeneficiario,
                b.nombre1Beneficiario,
                b.nombre2Beneficiario,
                b.nombre3Beneficiario,
                b.apellido1Beneficiario,
                b.apellido2Beneficiario,
                b.apellido3Beneficiario,
                
                -- IDs de ubicación y encargado (la vista los necesita)
                b.idPaisBene,
                b.idDepartamentoBene,
                b.idMunicipioBene,
                b.idLugarBene,
                b.idEncargadoBene,

                -- Estado e info de fechas
                b.estadoBeneficiario,
                b.fechaIngresoBene,
                b.horaIngresoBene,
                b.fechaActualizacion,
                b.horaActualizacion,

                b.idUsuarioIngreso,
                b.idUsuarioActualiza,

                -- Campos “bonitos” para mostrar
                CONCAT(b.nombre1Beneficiario, ' ', b.nombre2Beneficiario, ' ', b.nombre3Beneficiario, ' ',
                       b.apellido1Beneficiario, ' ', b.apellido2Beneficiario, ' ', b.apellido3Beneficiario
                ) AS nombreCompleto,

                CONCAT(e.nombre1Encargado, ' ', e.apellido1Encargado) AS nombreEncargado,
                l.nombreLugar AS nombreLugar
            FROM beneficiarios b
            JOIN Encargados  e ON b.idEncargadoBene  = e.idEncargado
            JOIN Lugares     l ON b.idLugarBene      = l.idLugar
            -- si quisieras más adelante puedes hacer JOIN a País, Depto, Muni también aquí
            WHERE 1 = 1
        `;

        const params = [];

        // 🔍 Filtro por nombre / apellido (q)
        if (q) {
            sql += `
              AND (
                    b.nombre1Beneficiario    LIKE ?
                OR  b.nombre2Beneficiario    LIKE ?
                OR  b.nombre3Beneficiario    LIKE ?
                OR  b.apellido1Beneficiario  LIKE ?
                OR  b.apellido2Beneficiario  LIKE ?
                OR  b.apellido3Beneficiario  LIKE ?
              )
            `;
            const like = `%${q}%`;
            params.push(like, like, like, like, like, like);
        }

        // 🔍 Filtro por estado (A / I)
        if (estado === 'A' || estado === 'I') {
            sql += ` AND b.estadoBeneficiario = ? `;
            params.push(estado);
        }

        sql += ' ORDER BY b.apellido1Beneficiario, b.nombre1Beneficiario';

        const [rows] = await pool.query(sql, params);
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
                l.nombreLugar as nombreLugar,
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