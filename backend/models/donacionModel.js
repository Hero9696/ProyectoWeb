// models/donacionModel.js
const pool = require('../config/dbconfig');

/**
 * Donaciones SIN tipos.
 * Guarda: idDonador, montoDonado, fecha/hora (auto),
 * idUsuarioIngreso y idUsuarioActualizacion.
 */
class DonacionModel {
  // ==========================
  // LISTAR TODAS (con nombres)
  // ==========================
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        d.idDonacion,
        d.idDonador,
        d.montoDonado,
        d.fechaIngreso,
        d.horaIngreso,
        d.idUsuarioIngreso,
        d.fechaActualizacion,
        d.horaActualizacion,
        d.IdUsuarioActualizacion,

        -- nombre del donante
        CONCAT(da.nombre1Donante, ' ', da.apellido1Donante) AS nombreDonante,

        -- nombres de usuarios
        uIng.nombreUsuario AS usuarioIngresoNombre,
        uAct.nombreUsuario AS usuarioActualizaNombre
      FROM Donaciones d
      JOIN Donantes da
        ON d.idDonador = da.idDonador
      JOIN Usuarios uIng
        ON d.idUsuarioIngreso = uIng.idUsuario
      JOIN Usuarios uAct
        ON d.IdUsuarioActualizacion = uAct.idUsuario
      ORDER BY d.fechaIngreso DESC, d.horaIngreso DESC
    `);

    // LOG opcional para verificar que esto SÍ se está usando
    return rows;
  }

  // ==========================
  // OBTENER UNA POR ID
  // ==========================
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
      FROM Donaciones
      WHERE idDonacion = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  // ==========================
  // CREAR
  // ==========================
  static async create({
    idDonador,
    montoDonado,
    idUsuarioIngreso,
    fechaIngreso = null,
    horaIngreso = null
  }) {
    const sql = `
      INSERT INTO Donaciones
        (idDonador, montoDonado,
         fechaIngreso,  horaIngreso,  idUsuarioIngreso,
         fechaActualizacion, horaActualizacion, IdUsuarioActualizacion)
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
      user, // idUsuarioIngreso
      user  // IdUsuarioActualizacion
    ]);
    return r.insertId;
  }

  // ==========================
  // ELIMINAR
  // ==========================
  static async delete(id) {
    const [r] = await pool.query(
      'DELETE FROM Donaciones WHERE idDonacion = ?',
      [id]
    );
    return r.affectedRows;
  }
}

module.exports = DonacionModel;
