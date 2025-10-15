// models/VentaModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla Ventas (Cabecera).
 * Dependencias: Beneficiarios, Usuarios
 */
class VentaModel {

    /**
     * Obtiene todas las ventas con el nombre del beneficiario y el usuario que las registró.
     */
    static async findAll() {
        const query = `
            SELECT 
                v.idVenta, 
                v.TotalVenta, 
                v.fechaVenta, 
                v.horaVenta,
                CONCAT(b.nombre1Beneficiario, ' ', b.apellido1Beneficiario) AS nombreBeneficiario,
                u.nombreUsuario AS usuarioIngresa
            FROM Ventas v
            JOIN beneficiarios b ON v.idBeneficiarioVenta = b.idBeneficiario
            JOIN Usuarios u ON v.idUsuarioIngresa = u.idUsuario
            ORDER BY v.fechaVenta DESC, v.horaVenta DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Obtiene una venta por su ID.
     */
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM Ventas WHERE idVenta = ?', [id]);
        return rows[0] || null;
    }

    /**
     * Registra una nueva venta.
     * NOTA IMPORTANTE: Esta función DEBE ser ejecutada dentro de una transacción de BD
     * para asegurar la atomicidad con DetalleVentas, Inventario y Caja.
     */
    static async create(data, connection) {
        const { idBeneficiarioVenta, TotalVenta, idUsuarioIngresa } = data;

        const sql = `
            INSERT INTO Ventas (
                idBeneficiarioVenta, TotalVenta, fechaVenta, horaVenta, idUsuarioIngresa
            ) VALUES (?, ?, CURDATE(), CURTIME(), ?)
        `;
        
        // Ejecutamos la consulta en la conexión proporcionada (no el pool)
        const [result] = await connection.query(sql, [idBeneficiarioVenta, TotalVenta, idUsuarioIngresa]);
        return result.insertId;
    }

    // No se implementa DELETE/UPDATE para Ventas, ya que se debería usar un proceso
    // de anulación (inversión de transacción) para mantener la integridad financiera.
}

module.exports = VentaModel;