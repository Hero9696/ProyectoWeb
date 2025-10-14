// controllers/TipoTransaccionController.js

const TipoTransaccionModel = require('../models/tipoTransaccionModel');

/**
 * Controlador para la gestión de TiposTransacciones.
 */
class TipoTransaccionController {

    /**
     * Obtiene todos los tipos de transacciones. (GET /api/tipos-trx)
     */
    static async getAllTiposTrx(req, res) {
        try {
            const tipos = await TipoTransaccionModel.findAll();
            res.status(200).json(tipos);
        } catch (error) {
            console.error('Error al obtener tipos de transacción:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene un tipo de transacción por ID. (GET /api/tipos-trx/:id)
     */
    static async getTipoTrxById(req, res) {
        try {
            const { id } = req.params;
            const tipo = await TipoTransaccionModel.findById(id);

            if (!tipo) {
                return res.status(404).json({ message: 'Tipo de transacción no encontrado.' });
            }
            res.status(200).json(tipo);
        } catch (error) {
            console.error('Error al obtener tipo de transacción por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea un nuevo tipo de transacción. (POST /api/tipos-trx)
     */
    static async createTipoTrx(req, res) {
        try {
            const { codigoTrx, descripcionTrx } = req.body;

            if (!codigoTrx || !descripcionTrx) {
                return res.status(400).json({ message: 'El código y la descripción de la transacción son obligatorios.' });
            }

            const id = await TipoTransaccionModel.create({ 
                codigoTrx: codigoTrx.toUpperCase(), 
                descripcionTrx 
            });
            
            res.status(201).json({ 
                message: 'Tipo de transacción creado con éxito.', 
                idTipoTrx: id 
            });
        } catch (error) {
            console.error('Error al crear tipo de transacción:', error.message);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El código de la transacción ya existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Actualiza un tipo de transacción. (PUT /api/tipos-trx/:id)
     */
    static async updateTipoTrx(req, res) {
        try {
            const { id } = req.params;
            const { codigoTrx, descripcionTrx } = req.body;

            if (!codigoTrx || !descripcionTrx) {
                return res.status(400).json({ message: 'El código y la descripción son obligatorios.' });
            }

            const affectedRows = await TipoTransaccionModel.update(id, { 
                codigoTrx: codigoTrx.toUpperCase(), 
                descripcionTrx 
            });

            if (affectedRows === 0) {
                // Podría ser 404 (no encontrado) o 200 (encontrado pero no cambiado)
                return res.status(404).json({ message: 'Tipo de transacción no encontrado o datos idénticos.' });
            }
            res.status(200).json({ message: 'Tipo de transacción actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar tipo de transacción:', error.message);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El código de la transacción ya existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Elimina un tipo de transacción. (DELETE /api/tipos-trx/:id)
     */
    static async deleteTipoTrx(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await TipoTransaccionModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Tipo de transacción no encontrado.' });
            }
            res.status(200).json({ message: 'Tipo de transacción eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar tipo de transacción:', error.message);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar porque está asociado a Transacciones de Caja.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = TipoTransaccionController;