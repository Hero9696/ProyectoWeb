// controllers/PaisController.js

const PaisModel = require('../models/paisModel');

/**
 * Controlador para la gestión de Paises.
 */
class PaisController {

    /**
     * Obtiene todos los países. (GET /api/paises)
     */
    static async getAllPaises(req, res) {
        try {
            const paises = await PaisModel.findAll();
            res.status(200).json(paises);
        } catch (error) {
            console.error('Error al obtener países:', error.message);
            res.status(500).json({ message: 'Error interno del servidor al obtener países.' });
        }
    }

    /**
     * Obtiene un país por ID. (GET /api/paises/:id)
     */
    static async getPaisById(req, res) {
        try {
            const { id } = req.params;
            const pais = await PaisModel.findById(id);

            if (!pais) {
                return res.status(404).json({ message: 'País no encontrado.' });
            }
            res.status(200).json(pais);
        } catch (error) {
            console.error('Error al obtener país por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea un nuevo país. (POST /api/paises)
     */
    static async createPais(req, res) {
        try {
            const { nombrePais } = req.body;

            if (!nombrePais || typeof nombrePais !== 'string' || nombrePais.trim().length === 0) {
                return res.status(400).json({ message: 'El nombre del país es obligatorio y debe ser un texto.' });
            }

            const id = await PaisModel.create({ nombrePais: nombrePais.trim() });
            res.status(201).json({ 
                message: 'País creado con éxito.', 
                idPais: id 
            });
        } catch (error) {
            console.error('Error al crear país:', error.message);
            // Capturar error de duplicado (depende del motor, típicamente error code 1062)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El país ya existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor al crear país.' });
        }
    }

    /**
     * Actualiza un país. (PUT /api/paises/:id)
     */
    static async updatePais(req, res) {
        try {
            const { id } = req.params;
            const { nombrePais } = req.body;

            if (!nombrePais || typeof nombrePais !== 'string' || nombrePais.trim().length === 0) {
                return res.status(400).json({ message: 'El nombre del país es obligatorio.' });
            }

            const affectedRows = await PaisModel.update(id, { nombrePais: nombrePais.trim() });

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'País no encontrado o datos idénticos.' });
            }
            res.status(200).json({ message: 'País actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar país:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Elimina un país. (DELETE /api/paises/:id)
     */
    static async deletePais(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await PaisModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'País no encontrado.' });
            }
            res.status(200).json({ message: 'País eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar país:', error.message);
            // Capturar error de clave foránea (país es referenciado)
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar el país porque está siendo utilizado por otra tabla (ej: Departamentos).' });
            }
            res.status(500).json({ message: 'Error interno del servidor al eliminar país.' });
        }
    }
}

module.exports = PaisController;