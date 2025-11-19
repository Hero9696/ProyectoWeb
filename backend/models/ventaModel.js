// models/ventaModel.js
const pool = require('../config/dbconfig');

class VentaModel {

  // ========== LISTAR TODAS LAS VENTAS ==========
  static async findAll() {
    const sql = `
      SELECT
        v.idVenta,
        v.idBeneficiarioVenta,
        v.TotalVenta,
        v.fechaVenta,
        v.horaVenta,
        v.idUsuarioIngresa,

        -- nombres "bonitos"
        CONCAT(b.nombre1Beneficiario, ' ', b.apellido1Beneficiario) AS nombreBeneficiario,
        u.nombreUsuario AS nombreUsuarioIngresa
      FROM Ventas v
      JOIN beneficiarios b ON b.idBeneficiario = v.idBeneficiarioVenta
      JOIN Usuarios u      ON u.idUsuario     = v.idUsuarioIngresa
      ORDER BY v.fechaVenta DESC, v.horaVenta DESC, v.idVenta DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  // ========== OBTENER UNA VENTA POR ID (PARA EL MODAL) ==========
  static async findById(id) {
    const sql = `
      SELECT
        v.idVenta,
        v.idBeneficiarioVenta,
        v.TotalVenta,
        v.fechaVenta,
        v.horaVenta,
        v.idUsuarioIngresa,

        CONCAT(b.nombre1Beneficiario, ' ', b.apellido1Beneficiario) AS nombreBeneficiario,
        u.nombreUsuario AS nombreUsuarioIngresa
      FROM Ventas v
      JOIN beneficiarios b ON b.idBeneficiario = v.idBeneficiarioVenta
      JOIN Usuarios u      ON u.idUsuario     = v.idUsuarioIngresa
      WHERE v.idVenta = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  // ========== CREAR VENTA (ya lo usas en createVenta) ==========
  static async create({ idBeneficiarioVenta, TotalVenta, idUsuarioIngresa }, connection = pool) {
    const [result] = await connection.query(
      `INSERT INTO Ventas (
          idBeneficiarioVenta, TotalVenta, fechaVenta, horaVenta, idUsuarioIngresa
       ) VALUES (?, ?, CURDATE(), CURTIME(), ?)`,
      [idBeneficiarioVenta, TotalVenta, idUsuarioIngresa]
    );
    return result.insertId;
  }
}

module.exports = VentaModel;
