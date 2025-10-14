// controllers/DonanteController.js

const DonanteModel = require('../models/donanteModel');
const BitacoraModel = require('../models/bitacoraModel');

/**
 * Controlador para la gestión de Donantes.
 */
class DonanteController {

    /**
     * Obtiene todos los donantes. (GET /api/donantes)
     */
    static async getAllDonantes(req, res) {
        try {
            const donantes = await DonanteModel.findAll();
            res.status(200).json(donantes);
        } catch (error) {
            console.error('Error al obtener donantes:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene un donante por ID. (GET /api/donantes/:id)
     */
    static async getDonanteById(req, res) {
        try {
            const { id } = req.params;
            const donante = await DonanteModel.findById(id);

            if (!donante) {
                return res.status(404).json({ message: 'Donante no encontrado.' });
            }
            res.status(200).json(donante);
        } catch (error) {
            console.error('Error al obtener donante por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea un nuevo donante. (POST /api/donantes)
     */
    static async createDonante(req, res) {
        try {
            const data = req.body;
            
            // Validación mínima
            if (!data.nombre1Donante || !data.apellido1Donante || !data.idUsuarioIngreso) {
                 return res.status(400).json({ message: 'El primer nombre, primer apellido y el usuario de ingreso son obligatorios.' });
            }
            
            // Asumiendo que las FK de ubicación son válidas o se validan en otro middleware/capa
            const id = await DonanteModel.create(data);

            await BitacoraModel.create({
                idUsuario: data.idUsuarioIngreso,
                accion: 'INSERT',
                tabla: 'Donantes',
                pk_afectada: id.toString(),
                descripcion: `Creación del Donante ID: ${id}`
            });

            res.status(201).json({ 
                message: 'Donante creado con éxito.', 
                idDonador: id 
            });
        } catch (error) {
            console.error('Error al crear donante:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'Error de integridad: Una de las claves foráneas (ubicación o usuario) no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Actualiza un donante. (PUT /api/donantes/:id)
     */
    static async updateDonante(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            // Validación mínima
            if (!data.idUsuarioActualiza) {
                 return res.status(400).json({ message: 'El ID de usuario que actualiza es obligatorio.' });
            }

            const affectedRows = await DonanteModel.update(id, data);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Donante no encontrado o datos idénticos.' });
            }
            
            await BitacoraModel.create({
                idUsuario: data.idUsuarioActualiza,
                accion: 'UPDATE',
                tabla: 'Donantes',
                pk_afectada: id.toString(),
                descripcion: `Actualización del Donante ID: ${id}`
            });

            res.status(200).json({ message: 'Donante actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar donante:', error.message);
             if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'Error de integridad: Una de las claves foráneas (ubicación o usuario) no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Elimina un donante. (DELETE /api/donantes/:id)
     */
    static async deleteDonante(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await DonanteModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Donante no encontrado.' });
            }
            
            await BitacoraModel.create({
                idUsuario: null,
                accion: 'DELETE',
                tabla: 'Donantes',
                pk_afectada: id,
                descripcion: `Donante ID ${id} eliminado.`
            });
            
            res.status(200).json({ message: 'Donante eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar donante:', error.message);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar el donante porque tiene Donaciones asociadas.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = DonanteController;