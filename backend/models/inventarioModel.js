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
            b.idBeneficiario, 
            CONCAT(b.nombre1Beneficiario, ' ', b.apellido1Beneficiario) AS nombreBeneficiario,
            u_ing.nombreUsuario AS usuarioIngreso,
            u_act.nombreUsuario AS usuarioActualiza
        FROM Inventario i
        LEFT JOIN beneficiarios b 
            ON i.idBeneficiario = b.idBeneficiario
        LEFT JOIN Usuarios u_ing 
            ON i.idUsuarioIngreso = u_ing.idUsuario
        LEFT JOIN Usuarios u_act 
            ON i.idUsuarioActualiza = u_act.idUsuario
        ORDER BY i.fechaActualizacion DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
}


    /**
     * Obtiene el registro de inventario de un beneficiario específico.
     * Asumimos que hay un registro de inventario por beneficiario.
     */

  // Buscar inventario por beneficiario
  static async findByBeneficiario(idBeneficiario) {
    const [rows] = await pool.query(
      'SELECT * FROM Inventario WHERE idBeneficiario = ?',
      [idBeneficiario]
    );
    return rows[0] || null;
  }

  // Crear inventario inicial de beneficiario
  static async createInicial({ idBeneficiario, cantidad, idUsuario }) {
    const [result] = await pool.query(
      `INSERT INTO Inventario (
        idBeneficiario,
        cantidadInicial,
        cantidadVendida,
        cantidadConsumida,
        cantidadActual,
        ultimaCantidadIngre,
        montoTotal,
        fechaIngreso,
        horaIngreso,
        idUsuarioIngreso,
        fechaActualizacion,
        horaActualizacion,
        idUsuarioActualiza
      )
      VALUES (?, 0, 0, 0, ?, ?, 0, CURDATE(), CURTIME(), ?, CURDATE(), CURTIME(), ?)`,
      [idBeneficiario, cantidad, cantidad, idUsuario, idUsuario]
    );
    return result.insertId;
  }

  // Actualizar inventario al entregar pollitos
  static async actualizarEntrega({ idBeneficiario, cantidad, idUsuario }) {
    const [result] = await pool.query(
      `UPDATE Inventario
       SET cantidadActual = cantidadActual + ?,
           ultimaCantidadIngre = ?,
           fechaActualizacion = CURDATE(),
           horaActualizacion = CURTIME(),
           idUsuarioActualiza = ?
       WHERE idBeneficiario = ?`,
      [cantidad, cantidad, idUsuario, idBeneficiario]
    );
    return result.affectedRows;
  }

}

module.exports = InventarioModel;