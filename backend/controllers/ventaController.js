// controllers/VentaController.js

const VentaModel = require('../models/ventaModel');
const DetalleVentaModel = require('../models/detalleVentaModel');
const BitacoraModel = require('../models/bitacoraModel');
const pool = require('../config/dbconfig');

/**
 * Controlador para la gestión de Ventas.
 * La actualización de Inventario, Caja y TransaccionesCaja
 * se hace vía TRIGGERS en la base de datos.
 */
class VentaController {

  /**
   * Obtiene todas las ventas. (GET /api/ventas)
   */
  static async getAllVentas(req, res) {
    try {
      const ventas = await VentaModel.findAll();
      res.status(200).json(ventas);
    } catch (error) {
      console.error('Error al obtener ventas:', error.message);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  /**
   * Obtiene una venta con su detalle. (GET /api/ventas/:id)
   */
  static async getVentaWithDetails(req, res) {
    try {
      const { id } = req.params;
      const venta = await VentaModel.findById(id);

      if (!venta) {
        return res.status(404).json({ message: 'Venta no encontrada.' });
      }

      const detalles = await DetalleVentaModel.findByVentaId(id);

      res.status(200).json({
        ...venta,
        detalles,
      });
    } catch (error) {
      console.error('Error al obtener venta con detalles:', error.message);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }

  /**
   * Crea una nueva Venta (cabecera + detalles).
   * Inventario, Caja y TransaccionesCaja se actualizan con TRIGGERS
   * definidos sobre DetalleVentas.
   * (POST /api/ventas)
   */
  static async createVenta(req, res) {
    const { idBeneficiarioVenta, TotalVenta, idUsuarioIngresa, detalles } = req.body;

    if (
      !idBeneficiarioVenta ||
      !TotalVenta ||
      !idUsuarioIngresa ||
      !detalles ||
      !Array.isArray(detalles) ||
      detalles.length === 0
    ) {
      return res.status(400).json({
        message:
          'Faltan campos obligatorios para la venta (beneficiario, total, usuario, detalles).',
      });
    }

    let connection;
    try {
      // 1. Iniciar transacción
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // 2. Crear cabecera de venta
      const idVenta = await VentaModel.create(
        { idBeneficiarioVenta, TotalVenta, idUsuarioIngresa },
        connection
      );

      // 3. Crear detalles de venta
      //    Aquí se disparan los TRIGGERS de DetalleVentas que actualizan:
      //    - Inventario
      //    - Caja
      //    - TransaccionesCaja
      await DetalleVentaModel.createMany(detalles, idVenta, connection);

      // 4. Registrar en bitácora
      await BitacoraModel.create({
        idUsuario: idUsuarioIngresa,
        accion: 'VENTA',
        tabla: 'Ventas',
        pk_afectada: idVenta.toString(),
        descripcion: `Venta de Q${TotalVenta} a Beneficiario ID ${idBeneficiarioVenta}`,
      });

      // 5. Confirmar transacción
      await connection.commit();

      res.status(201).json({
        message:
          'Venta registrada correctamente. Inventario y caja se actualizan vía triggers.',
        idVenta,
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error en la transacción de venta:', error.message);
      res
        .status(500)
        .json({ message: error.message || 'Error interno del servidor.' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
}

module.exports = VentaController;
