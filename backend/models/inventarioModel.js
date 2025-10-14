// models/InventarioModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla Inventario (Stock por Beneficiario).
 * Dependencias: Beneficiarios, Usuarios (2 veces)
 */
class InventarioModel {

    /**
     * Obtiene todos los registros de inventario con los nombres de los beneficiarios y usuarios.
     */
    static async findAll() {
        const query = `
            SELECT 
                i.*, 
                CONCAT(b.nombre1Beneficiario, ' ', b.apellido1Beneficiario) AS nombreBeneficiario,
                u_ing.nombreUsuario AS usuarioIngreso,
                u_act.nombreUsuario AS usuarioActualiza
            FROM Inventario i
            JOIN beneficiarios b ON i.idBeneficiario = b.idBeneficiario
            JOIN Usuarios u_ing ON i.idUsuarioIngreso = u_ing.idUsuario
            JOIN Usuarios u_act ON i.idUsuarioActualiza = u_act.idUsuario
            ORDER BY i.fechaActualizacion DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Obtiene el registro de inventario de un beneficiario específico.
     * Asumimos que hay un registro de inventario por beneficiario.
     */
    static async findByBeneficiarioId(idBeneficiario) {
        const [rows] = await pool.query(
            'SELECT * FROM Inventario WHERE idBeneficiario = ?', 
            [idBeneficiario]
        );
        return rows[0] || null;
    }

    /**
     * Crea un nuevo registro de inventario para un beneficiario (generalmente solo debe haber uno por beneficiario).
     */
    static async create(data) {
        const {
            idBeneficiario, cantidadInicial, cantidadVendida, cantidadConsumida,
            cantidadActual, ultimaCantidadIngre, montoTotal, idUsuarioIngreso
        } = data;

        const [result] = await pool.query(
            `INSERT INTO Inventario (
                idBeneficiario, cantidadInicial, cantidadVendida, cantidadConsumida,
                cantidadActual, ultimaCantidadIngre, montoTotal, 
                fechaIngreso, horaIngreso, idUsuarioIngreso,
                fechaActualizacion, horaActualizacion, idUsuarioActualiza
             ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, 
                CURDATE(), CURTIME(), ?, 
                CURDATE(), CURTIME(), ?
             )`,
            [
                idBeneficiario, cantidadInicial, cantidadVendida, cantidadConsumida,
                cantidadActual, ultimaCantidadIngre, montoTotal, 
                idUsuarioIngreso, // idUsuarioIngreso
                idUsuarioIngreso  // idUsuarioActualiza
            ]
        );
        return result.insertId;
    }

    /**
     * Actualiza el inventario de un beneficiario.
     * NOTA: Las actualizaciones reales (ventas/consumo/ingreso) deben manejar la lógica de cálculo
     * en el controlador o servicio para mantener la atomicidad.
     */
    static async update(idInventario, data) {
        const {
            cantidadVendida, cantidadConsumida, cantidadActual, 
            ultimaCantidadIngre, montoTotal, idUsuarioActualiza
        } = data;

        const [result] = await pool.query(
            `UPDATE Inventario SET 
                cantidadVendida = ?, cantidadConsumida = ?, cantidadActual = ?, 
                ultimaCantidadIngre = ?, montoTotal = ?, 
                fechaActualizacion = CURDATE(), horaActualizacion = CURTIME(), idUsuarioActualiza = ?
             WHERE idInventario = ?`,
            [
                cantidadVendida, cantidadConsumida, cantidadActual, 
                ultimaCantidadIngre, montoTotal, idUsuarioActualiza, idInventario
            ]
        );
        return result.affectedRows;
    }
}

module.exports = InventarioModel;