// controllers/BitacoraController.js

const BitacoraModel = require('../models/bitacoraModel');

/**
 * Controlador para la consulta de BitacoraActividad.
 * Nota: Solo implementamos la lectura; la inserción la realizan los otros controladores.
 */
class BitacoraController {

    /**
     * Obtiene los últimos registros de la bitácora. (GET /api/bitacora)
     * Permite un parámetro de query `limit`.
     */
    static async getLatest(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50; // Límite por defecto: 50
            
            if (limit < 1 || limit > 500) {
                 return res.status(400).json({ message: 'El límite debe ser un número entre 1 y 500.' });
            }
            
            const logs = await BitacoraModel.findLatest(limit);
            res.status(200).json(logs);
        } catch (error) {
            console.error('Error al obtener logs de bitácora:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene un registro de bitácora por ID, incluyendo el detalle de datos. (GET /api/bitacora/:id)
     */
    static async getLogById(req, res) {
        try {
            const { id } = req.params;
            const log = await BitacoraModel.findById(id);

            if (!log) {
                return res.status(404).json({ message: 'Registro de bitácora no encontrado.' });
            }
            
            // Parsear los campos JSON a objetos antes de enviarlos
            log.datos_antes = log.datos_antes ? JSON.parse(log.datos_antes) : null;
            log.datos_despues = log.datos_despues ? JSON.parse(log.datos_despues) : null;

            res.status(200).json(log);
        } catch (error) {
            console.error('Error al obtener registro de bitácora por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = BitacoraController;