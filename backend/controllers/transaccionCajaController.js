// controllers/TransaccionCajaController.js

const TransaccionCajaModel = require('../models/transaccionCajaModel');

/**
 * Controlador para la consulta de TransaccionesCaja (reportes y auditoría).
 */
class TransaccionCajaController {

    /**
     * Obtiene todas las transacciones de caja. (GET /api/transacciones-caja)
     */
    static async getAllTransacciones(req, res) {
        try {
            const transacciones = await TransaccionCajaModel.findAll();
            res.status(200).json(transacciones);
        } catch (error) {
            console.error('Error al obtener transacciones de caja:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene una transacción por ID. (GET /api/transacciones-caja/:id)
     */
    static async getTransaccionById(req, res) {
        try {
            const { id } = req.params;
            const transaccion = await TransaccionCajaModel.findById(id);

            if (!transaccion) {
                return res.status(404).json({ message: 'Transacción no encontrada.' });
            }
            res.status(200).json(transaccion);
        } catch (error) {
            console.error('Error al obtener transacción por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    // Nota: La creación de transacciones manuales está en CajaController.createMovimiento.
    // Las transacciones generadas por Ventas y Donaciones se manejan en sus respectivos controladores.
}

module.exports = TransaccionCajaController;