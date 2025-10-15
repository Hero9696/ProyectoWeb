// controllers/DepartamentoController.js

const DepartamentoModel = require('../models/departamentoModel');
const PaisModel = require('../models/paisModel');

/**
 * Controlador para la gestión de Departamentos.
 */
class DepartamentoController {

    /**
     * Obtiene todos los departamentos. (GET /api/departamentos)
     */
    static async getAllDepartamentos(req, res) {
        try {
            const departamentos = await DepartamentoModel.findAll();
            res.status(200).json(departamentos);
        } catch (error) {
            console.error('Error al obtener departamentos:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene un departamento por ID. (GET /api/departamentos/:id)
     */
    static async getDepartamentoById(req, res) {
        try {
            const { id } = req.params;
            const departamento = await DepartamentoModel.findById(id);

            if (!departamento) {
                return res.status(404).json({ message: 'Departamento no encontrado.' });
            }
            res.status(200).json(departamento);
        } catch (error) {
            console.error('Error al obtener departamento por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea un nuevo departamento. (POST /api/departamentos)
     */
    static async createDepartamento(req, res) {
        try {
            const { idPaisDepa, nombreDepartamento } = req.body;

            if (!idPaisDepa || !nombreDepartamento) {
                return res.status(400).json({ message: 'El ID del país y el nombre del departamento son obligatorios.' });
            }
            
            // Opcional: Validar que el país exista
            const paisExiste = await PaisModel.findById(idPaisDepa);
            if (!paisExiste) {
                return res.status(400).json({ message: 'El ID de país proporcionado no existe.' });
            }

            const id = await DepartamentoModel.create({ idPaisDepa, nombreDepartamento });
            res.status(201).json({ 
                message: 'Departamento creado con éxito.', 
                idDepartamento: id 
            });
        } catch (error) {
            console.error('Error al crear departamento:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'Error de integridad: El ID de país no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Actualiza un departamento. (PUT /api/departamentos/:id)
     */
    static async updateDepartamento(req, res) {
        try {
            const { id } = req.params;
            const { idPaisDepa, nombreDepartamento } = req.body;

            if (!idPaisDepa || !nombreDepartamento) {
                return res.status(400).json({ message: 'El ID del país y el nombre del departamento son obligatorios.' });
            }

            const affectedRows = await DepartamentoModel.update(id, { idPaisDepa, nombreDepartamento });

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Departamento no encontrado o datos idénticos.' });
            }
            res.status(200).json({ message: 'Departamento actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar departamento:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'Error de integridad: El ID de país no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Elimina un departamento. (DELETE /api/departamentos/:id)
     */
    static async deleteDepartamento(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await DepartamentoModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Departamento no encontrado.' });
            }
            res.status(200).json({ message: 'Departamento eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar departamento:', error.message);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar el departamento porque está asociado a Municipios o Lugares.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = DepartamentoController;