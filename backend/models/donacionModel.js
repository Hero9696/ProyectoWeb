// models/DonacionModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla Donaciones.
 * Dependencias: Donantes, TiposDonaciones, Usuarios, TransaccionesCaja (Opcional)
 */
class DonacionModel {

    /**
     * Obtiene todas las donaciones con la información detallada.
     */
    static async findAll() {
        const query = `
            SELECT 
                d.idDonacion, 
                d.montoDonacion, 
                d.cantidadDona, 
                d.fechaDonacion, 
                d.descripcionDona,
                td.descripcionTipo AS tipoDonacion,
                CONCAT(dn.nombre1Donante, ' ', dn.apellido1Donante) AS nombreDonante,
                u.nombreUsuario AS usuarioIngreso,
                d.idTrxAsociada
            FROM Donaciones d
            JOIN TiposDonaciones td ON d.idTipoDona = td.idTipoDona
            JOIN Donantes dn ON d.idDonante = dn.idDonador
            JOIN Usuarios u ON d.idUsuarioIngreso = u.idUsuario
            ORDER BY d.fechaDonacion DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Obtiene una donación por su ID.
     */
    static async findById(id) {
        const query = `
            SELECT 
                d.*, 
                td.descripcionTipo AS tipoDonacion,
                dn.nombre1Donante, dn.apellido1Donante,
                u.nombreUsuario AS usuarioIngreso
            FROM Donaciones d
            JOIN TiposDonaciones td ON d.idTipoDona = td.idTipoDona
            JOIN Donantes dn ON d.idDonante = dn.idDonador
            JOIN Usuarios u ON d.idUsuarioIngreso = u.idUsuario
            WHERE d.idDonacion = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }

    /**
     * Crea una nueva donación.
     * Nota: En el controlador, esta acción debe ir acompañada de una inserción en TransaccionesCaja
     * si se trata de una donación en efectivo (idTrxAsociada no es NULL).
     */
    static async create(data) {
        const {
            idDonante, idTipoDona, idTrxAsociada = null, montoDonacion = null, cantidadDona = null,
            descripcionDona, idUsuarioIngreso
        } = data;

        const [result] = await pool.query(
            `INSERT INTO Donaciones (
                idDonante, idTipoDona, idTrxAsociada, montoDonacion, cantidadDona,
                descripcionDona, fechaDonacion, horaDonacion, idUsuarioIngreso
             ) VALUES (
                ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME(), ?
             )`,
            [
                idDonante, idTipoDona, idTrxAsociada, montoDonacion, cantidadDona,
                descripcionDona, idUsuarioIngreso
            ]
        );
        return result.insertId;
    }

    /**
     * Elimina una donación por su ID.
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Donaciones WHERE idDonacion = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = DonacionModel;