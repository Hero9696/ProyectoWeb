// controllers/donacionController.js
const DonacionModel = require('../models/donacionModel');

class DonacionController {
  // GET /api/donaciones
  static async getAllDonaciones(_req, res) {
    try {
      const rows = await DonacionModel.findAll();
      res.json(rows);
    } catch (e) {
      console.error('Error al obtener donaciones:', e);
      res.status(500).json({ message: 'Error interno del servidor.', debug: e.message || e });
    }
  }

  // GET /api/donaciones/:id
  static async getDonacionById(req, res) {
    try {
      const row = await DonacionModel.findById(req.params.id);
      if (!row) return res.status(404).json({ message: 'Donación no encontrada' });
      res.json(row);
    } catch (e) {
      console.error('Error al obtener donación:', e);
      res.status(500).json({ message: 'Error interno del servidor.', debug: e.message || e });
    }
  }

  // POST /api/donaciones
  static async createDonacion(req, res) {
    try {
      const {
        idDonador,
        montoDonado,
        fechaIngreso = null,
        horaIngreso = null,
        idUsuarioIngreso = 1
      } = req.body || {};

      if (!idDonador || !(Number(montoDonado) > 0)) {
        return res.status(400).json({ message: 'idDonador y montoDonado son requeridos y válidos.' });
      }

      const id = await DonacionModel.create({
        idDonador: Number(idDonador),
        montoDonado: Number(montoDonado),
        fechaIngreso,
        horaIngreso,
        idUsuarioIngreso: Number(idUsuarioIngreso) || 1
      });

      res.status(201).json({ idDonacion: id });
    } catch (e) {
      console.error('Error al crear donación:', e);
      res.status(500).json({ message: 'Error interno del servidor.', debug: e.message || e });
    }
  }

  // DELETE /api/donaciones/:id
  static async deleteDonacion(req, res) {
    try {
      const n = await DonacionModel.delete(req.params.id);
      if (!n) return res.status(404).json({ message: 'Donación no encontrada' });
      res.json({ ok: true });
    } catch (e) {
      console.error('Error al eliminar donación:', e);
      res.status(500).json({ message: 'Error interno del servidor.', debug: e.message || e });
    }
  }
}

module.exports = DonacionController;
