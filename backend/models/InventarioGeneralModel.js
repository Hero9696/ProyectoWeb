// backend/models/InventarioGeneralModel.js
const pool = require("../config/dbconfig");

class InventarioGeneralModel {
  /**
   * Lista todos los registros de InventarioGeneral,
   * incluyendo el nombre de los usuarios que ingresan y actualizan.
   */
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT 
         ig.idInventarioGeneral,
         ig.cantidadActual,
         ig.ultimaCantidadIngre,
         DATE_FORMAT(ig.fechaIngreso, '%Y-%m-%d')   AS fechaIngreso,
         TIME_FORMAT(ig.horaIngreso, '%H:%i:%s')    AS horaIngreso,
         DATE_FORMAT(ig.fechaActualizacion, '%Y-%m-%d') AS fechaActualizacion,
         TIME_FORMAT(ig.horaActualizacion, '%H:%i:%s')  AS horaActualizacion,
         ig.idUsuarioIngreso,
         ig.idUsuarioActualiza,
         uIng.nombreUsuario  AS usuarioIngresoNombre,
         uAct.nombreUsuario  AS usuarioActualizaNombre
       FROM InventarioGeneral ig
       LEFT JOIN Usuarios uIng
         ON ig.idUsuarioIngreso = uIng.idUsuario
       LEFT JOIN Usuarios uAct
         ON ig.idUsuarioActualiza = uAct.idUsuario
       ORDER BY ig.fechaActualizacion DESC,
                ig.horaActualizacion DESC,
                ig.idInventarioGeneral DESC`
    );
    return rows;
  }

  /**
   * Opcional: último registro (más reciente).
   */
  static async findUltimo() {
    const [rows] = await pool.query(
      `SELECT 
         ig.idInventarioGeneral,
         ig.cantidadActual,
         ig.ultimaCantidadIngre,
         DATE_FORMAT(ig.fechaIngreso, '%Y-%m-%d')   AS fechaIngreso,
         TIME_FORMAT(ig.horaIngreso, '%H:%i:%s')    AS horaIngreso,
         DATE_FORMAT(ig.fechaActualizacion, '%Y-%m-%d') AS fechaActualizacion,
         TIME_FORMAT(ig.horaActualizacion, '%H:%i:%s')  AS horaActualizacion,
         ig.idUsuarioIngreso,
         ig.idUsuarioActualiza,
         uIng.nombreUsuario  AS usuarioIngresoNombre,
         uAct.nombreUsuario  AS usuarioActualizaNombre
       FROM InventarioGeneral ig
       LEFT JOIN Usuarios uIng
         ON ig.idUsuarioIngreso = uIng.idUsuario
       LEFT JOIN Usuarios uAct
         ON ig.idUsuarioActualiza = uAct.idUsuario
       ORDER BY ig.fechaActualizacion DESC,
                ig.horaActualizacion DESC,
                ig.idInventarioGeneral DESC
       LIMIT 1`
    );
    return rows[0] || null;
  }
  /**
   * Obtiene el ÚNICO registro de inventario general (asumiendo que solo hay uno o es el más reciente).
   */
  // backend/models/InventarioGeneralModel.js - Reemplaza 'getActual' con esta lógica:

  static async getActual() {
    const [rows] = await pool.query(`
      SELECT 
        ig.idInventarioGeneral,
        ig.cantidadActual,
        ig.ultimaCantidadIngre,
        DATE_FORMAT(ig.fechaIngreso, '%Y-%m-%d')         AS fechaIngreso,
        TIME_FORMAT(ig.horaIngreso, '%H:%i:%s')          AS horaIngreso,
        DATE_FORMAT(ig.fechaActualizacion, '%Y-%m-%d')   AS fechaActualizacion,
        TIME_FORMAT(ig.horaActualizacion, '%H:%i:%s')    AS horaActualizacion,
        ig.idUsuarioIngreso,
        ig.idUsuarioActualiza,
        uIng.nombreUsuario AS usuarioIngresoNombre,
        uAct.nombreUsuario AS usuarioActualizaNombre
      FROM InventarioGeneral ig
      LEFT JOIN Usuarios uIng
        ON ig.idUsuarioIngreso = uIng.idUsuario
      LEFT JOIN Usuarios uAct
        ON ig.idUsuarioActualiza = uAct.idUsuario
      ORDER BY ig.idInventarioGeneral DESC
      LIMIT 1
    `);
    return rows[0] || null;
  }

  // Bajar stock SIN tocar ultimaCantidadIngre
  static async bajarStock({ cantidad, idUsuario }, conn = null) {
    const db = conn || pool;
    const [result] = await db.query(
      `UPDATE InventarioGeneral
       SET cantidadActual = cantidadActual - ?,
           fechaActualizacion = CURDATE(),
           horaActualizacion = CURTIME(),
           idUsuarioActualiza = ?
       WHERE idInventarioGeneral = 1`,
      [cantidad, idUsuario]
    );
    return result.affectedRows;
  }
}

module.exports = InventarioGeneralModel;
