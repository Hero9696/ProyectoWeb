// controllers/EncargadoController.js

const EncargadoModel = require('../models/EncargadoModel');
const LugarModel = require('../models/lugarModel');
const BitacoraModel = require('../models/bitacoraModel');

/**
 * Controlador para la gestión de Encargados.
 */
class EncargadoController {
    
    /**
     * Obtiene todos los encargados. (GET /api/encargados)
     */
    static async getAllEncargados(req, res) {
        try {
            const encargados = await EncargadoModel.findAll();
            res.status(200).json(encargados);
        } catch (error) {
            console.error('Error al obtener encargados:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene un encargado por ID. (GET /api/encargados/:id)
     */
    static async getEncargadoById(req, res) {
        try {
            const { id } = req.params;
            const encargado = await EncargadoModel.findById(id);

            if (!encargado) {
                return res.status(404).json({ message: 'Encargado no encontrado.' });
            }
            res.status(200).json(encargado);
        } catch (error) {
            console.error('Error al obtener encargado por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea un nuevo encargado. (POST /api/encargados)
     */
    static async createEncargado(req, res) {
        try {
            const data = req.body;
            
            // Validación mínima
            if (!data.IdentificacionEncarga || !data.nombre1Encargado || !data.apellido1Encargado || !data.idUsuarioIngreso) {
                 return res.status(400).json({ message: 'Campos principales (Identificación, nombres, apellidos, usuario de ingreso) son obligatorios.' });
            }

            // Opcional: Validación de existencia de Lugar
            const lugar = await LugarModel.findById(data.idLugarEncargado);
            if (!lugar) {
                 return res.status(400).json({ message: 'El ID de Lugar proporcionado no existe.' });
            }

            const id = await EncargadoModel.create(data);

            await BitacoraModel.create({
                idUsuario: data.idUsuarioIngreso,
                accion: 'INSERT',
                tabla: 'Encargados',
                pk_afectada: id.toString(),
                descripcion: `Creación del Encargado ID: ${id}`
            });

            res.status(201).json({ 
                message: 'Encargado creado con éxito.', 
                idEncargado: id 
            });
        } catch (error) {
            console.error('Error al crear encargado:', error.message);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'La identificación del encargado ya existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Actualiza un encargado. (PUT /api/encargados/:id)
     */
    static async updateEncargado(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            // Validación mínima
            if (!data.idUsuarioActualiza) {
                 return res.status(400).json({ message: 'El ID de usuario que actualiza es obligatorio.' });
            }

            const affectedRows = await EncargadoModel.update(id, data);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Encargado no encontrado o datos idénticos.' });
            }
            
            await BitacoraModel.create({
                idUsuario: data.idUsuarioActualiza,
                accion: 'UPDATE',
                tabla: 'Encargados',
                pk_afectada: id.toString(),
                descripcion: `Actualización del Encargado ID: ${id}`
            });

            res.status(200).json({ message: 'Encargado actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar encargado:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
    
    /**
     * Elimina un encargado. (DELETE /api/encargados/:id)
     */
    static async deleteEncargado(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await EncargadoModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Encargado no encontrado.' });
            }
            
            await BitacoraModel.create({
                idUsuario: null,
                accion: 'DELETE',
                tabla: 'Encargados',
                pk_afectada: id,
                descripcion: `Encargado ID ${id} eliminado.`
            });
            
            res.status(200).json({ message: 'Encargado eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar encargado:', error.message);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar el encargado porque tiene Beneficiarios asociados.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = EncargadoController;