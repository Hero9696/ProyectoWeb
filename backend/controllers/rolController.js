// controllers/RolController.js

const RolModel = require('../models/rolModel');

/**
 * Controlador para la gestión de Roles.
 */
class RolController {

    /**
     * Obtiene todos los roles. (GET /api/roles)
     */
    static async getAllRoles(req, res) {
        try {
            const roles = await RolModel.findAll();
            res.status(200).json(roles);
        } catch (error) {
            console.error('Error al obtener roles:', error.message);
            res.status(500).json({ message: 'Error interno del servidor al obtener roles.' });
        }
    }

    /**
     * Obtiene un rol por ID. (GET /api/roles/:id)
     */
    static async getRolById(req, res) {
        try {
            const { id } = req.params;
            const rol = await RolModel.findById(id);

            if (!rol) {
                return res.status(404).json({ message: 'Rol no encontrado.' });
            }
            res.status(200).json(rol);
        } catch (error) {
            console.error('Error al obtener rol por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea un nuevo rol. (POST /api/roles)
     */
    static async createRol(req, res) {
        try {
            const { nombreRol, descripcionRol } = req.body;

            if (!nombreRol || !descripcionRol) {
                return res.status(400).json({ message: 'El nombre y la descripción del rol son obligatorios.' });
            }

            const id = await RolModel.create({ nombreRol, descripcionRol });
            res.status(201).json({ 
                message: 'Rol creado con éxito.', 
                idRol: id 
            });
        } catch (error) {
            console.error('Error al crear rol:', error.message);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El nombre del rol ya existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor al crear rol.' });
        }
    }

    /**
     * Actualiza un rol. (PUT /api/roles/:id)
     */
    static async updateRol(req, res) {
        try {
            const { id } = req.params;
            const { nombreRol, descripcionRol } = req.body;

            if (!nombreRol || !descripcionRol) {
                return res.status(400).json({ message: 'El nombre y la descripción del rol son obligatorios.' });
            }

            const affectedRows = await RolModel.update(id, { nombreRol, descripcionRol });

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Rol no encontrado o datos idénticos.' });
            }
            res.status(200).json({ message: 'Rol actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar rol:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Elimina un rol. (DELETE /api/roles/:id)
     */
    static async deleteRol(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await RolModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Rol no encontrado.' });
            }
            res.status(200).json({ message: 'Rol eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar rol:', error.message);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar el rol porque está asociado a uno o más usuarios.' });
            }
            res.status(500).json({ message: 'Error interno del servidor al eliminar rol.' });
        }
    }
}

module.exports = RolController;