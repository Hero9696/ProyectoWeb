// backend/controllers/InventarioGeneralController.js
const InventarioGeneralModel = require('../models/InventarioGeneralModel');

class InventarioGeneralController {

  // GET /api/inventario-general
  static async getAllInventarioGeneral(req, res) {
    try {
      const registros = await InventarioGeneralModel.findAll();
      return res.status(200).json(registros);
    } catch (error) {
      console.error('[InventarioGeneral] Error al obtener inventario general:', error);
      return res
        .status(500)
        .json({ message: 'Error interno al obtener el inventario general.' });
    }
  }

  // Opcional: GET /api/inventario-general/ultimo
  static async getUltimoInventario(req, res) {
    try {
      const ultimo = await InventarioGeneralModel.findUltimo();
      if (!ultimo) {
        return res.status(404).json({ message: 'No hay registros de inventario general.' });
      }
      return res.status(200).json(ultimo);
    } catch (error) {
      console.error('[InventarioGeneral] Error al obtener último inventario:', error);
      return res
        .status(500)
        .json({ message: 'Error interno al obtener el último registro de inventario.' });
    }
  }
}

module.exports = InventarioGeneralController;
