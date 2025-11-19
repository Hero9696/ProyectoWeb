// backend/controllers/comprasController.js
const ComprasModel = require('../models/compraModel');

class ComprasController {

  // ============================
  // GET /api/compras  (consulta) 
  // ============================
static async getAllCompras(req, res) {
    try {
      // ⚠️ AQUÍ LEEMOS LOS FILTROS DEL QUERY STRING
      const { desde, hasta, idCaja } = req.query;

      const compras = await ComprasModel.findAll({
        desde,
        hasta,
        idCaja
      });

      return res.status(200).json(compras);
    } catch (error) {
      console.error('[Compras] Error al obtener compras:', error);
      return res
        .status(500)
        .json({ message: 'Error interno al obtener las compras.' });
    }
  }


  // ============================
  // POST /api/compras  (ya lo tenías)
  // ============================
  static async createCompra(req, res) {
    try {
      const {
        idCajaCompra,
        cantidadCompra,
        totalCompra,
        fechaCompra = null,
        horaCompra  = null,
      } = req.body || {};

      // Usuario logueado (viene del front, pero si no, usa 1)
      const idUsuarioIngresa = Number(req.body?.idUsuarioIngresa) || 1;

      // Validaciones mínimas (ya NO exigimos fecha/hora)
      if (!idCajaCompra || !cantidadCompra || !totalCompra) {
        return res.status(400).json({
          message: 'idCajaCompra, cantidadCompra y totalCompra son obligatorios.',
        });
      }

      const idCompra = await ComprasModel.create({
        idCajaCompra: Number(idCajaCompra),
        cantidadCompra: Number(cantidadCompra),
        totalCompra: Number(totalCompra),
        fechaCompra,         // opcionales
        horaCompra,          // opcionales
        idUsuarioIngresa,    // usuario logueado
      });

      return res.status(201).json({
        message: 'Compra registrada correctamente.',
        idCompra,
      });

    } catch (error) {
      console.error('[Compras] Error al crear compra:', error);
      return res
        .status(500)
        .json({ message: 'Error interno al registrar la compra.' });
    }
  }
}

module.exports = ComprasController;
