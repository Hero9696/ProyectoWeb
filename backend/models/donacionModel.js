// models/donacionModel.js
const pool = require('../config/dbconfig');

/**
 * Donaciones SIN tipos.
 * Guarda: idDonador, montoDonado, fecha/hora (auto), idUsuarioIngreso y idUsuarioActualizacion.
 */
class DonacionModel {
  static async findAll() {
    const sql = `
      SELECT
        idDonacion,
        idDonador,
        montoDonado,
        fechaIngreso,
        horaIngreso,
        idUsuarioIngreso,
        fechaActualizacion,
        horaActualizacion,
        IdUsuarioActualizacion
      FROM donaciones
      ORDER BY fechaIngreso DESC, horaIngreso DESC, idDonacion DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  static async findById(id) {
    const sql = `
      SELECT
        idDonacion,
        idDonador,
        montoDonado,
        fechaIngreso,
        horaIngreso,
        idUsuarioIngreso,
        fechaActualizacion,
        horaActualizacion,
        IdUsuarioActualizacion
      FROM donaciones
      WHERE idDonacion = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  static async create({ idDonador, montoDonado, idUsuarioIngreso, fechaIngreso = null, horaIngreso = null }) {
    // Guardamos también fecha/hora de actualización e idUsuarioActualizacion
    const sql = `
      INSERT INTO donaciones
        (idDonador, montoDonado,
         fechaIngreso,  horaIngreso,  idUsuarioIngreso,
         fechaActualizacion, horaActualizacion, idUsuarioActualizacion)
      VALUES
        (?, ?,
         COALESCE(?, CURDATE()), COALESCE(?, CURTIME()), ?,
         CURDATE(), CURTIME(), ?)
    `;
    const user = Number(idUsuarioIngreso) || 1;
    const [r] = await pool.query(sql, [
      Number(idDonador),
      Number(montoDonado),
      fechaIngreso,
      horaIngreso,
      user,
      user
    ]);
    return r.insertId;
  }

  static async delete(id) {
    const [r] = await pool.query('DELETE FROM donaciones WHERE idDonacion = ?', [id]);
    return r.affectedRows;
  }
}

module.exports = DonacionModel;
