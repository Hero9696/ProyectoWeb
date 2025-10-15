// controllers/LugarController.js

const LugarModel = require('../models/lugarModel');
const MunicipioModel = require('../models/municipioModel');

/**
 * Controlador para la gestión de Lugares (Entidades Geográficas finales).
 */
class LugarController {

    /**
     * Obtiene todos los lugares. (GET /api/lugares)
     */
    static async getAllLugares(req, res) {
        try {
            const lugares = await LugarModel.findAll();
            res.status(200).json(lugares);
        } catch (error) {
            console.error('Error al obtener lugares:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene un lugar por ID. (GET /api/lugares/:id)
     */
    static async getLugarById(req, res) {
        try {
            const { id } = req.params;
            const lugar = await LugarModel.findById(id);

            if (!lugar) {
                return res.status(404).json({ message: 'Lugar no encontrado.' });
            }
            res.status(200).json(lugar);
        } catch (error) {
            console.error('Error al obtener lugar por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea un nuevo lugar. (POST /api/lugares)
     */
    static async createLugar(req, res) {
        try {
            const { idPaisLugar, idDepartamentoLugar, idMunicipioLugar, nombreLugar } = req.body;

            if (!idPaisLugar || !idDepartamentoLugar || !idMunicipioLugar || !nombreLugar) {
                return res.status(400).json({ message: 'Todos los campos de ubicación y el nombre son obligatorios.' });
            }
            
            // Validación de Consistencia de Jerarquía: El municipio debe pertenecer al departamento y país
            const municipio = await MunicipioModel.findById(idMunicipioLugar);
            if (!municipio || municipio.idDepartamentoMuni !== idDepartamentoLugar || municipio.idPaisMuni !== idPaisLugar) {
                return res.status(400).json({ message: 'Inconsistencia de datos: La jerarquía de ubicación (País/Departamento/Municipio) es incorrecta.' });
            }

            const id = await LugarModel.create({ idPaisLugar, idDepartamentoLugar, idMunicipioLugar, nombreLugar });
            res.status(201).json({ 
                message: 'Lugar creado con éxito.', 
                idLugar: id 
            });
        } catch (error) {
            console.error('Error al crear lugar:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'Error de integridad: Una de las claves foráneas (País, Depa, Muni) no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Actualiza un lugar. (PUT /api/lugares/:id)
     */
    static async updateLugar(req, res) {
        try {
            const { id } = req.params;
            const { idPaisLugar, idDepartamentoLugar, idMunicipioLugar, nombreLugar } = req.body;

            if (!idPaisLugar || !idDepartamentoLugar || !idMunicipioLugar || !nombreLugar) {
                return res.status(400).json({ message: 'Todos los campos de ubicación y el nombre son obligatorios.' });
            }

            // Validación de Consistencia (mismo que en create)
            const municipio = await MunicipioModel.findById(idMunicipioLugar);
            if (!municipio || municipio.idDepartamentoMuni !== idDepartamentoLugar || municipio.idPaisMuni !== idPaisLugar) {
                return res.status(400).json({ message: 'Inconsistencia de datos: La jerarquía de ubicación (País/Departamento/Municipio) es incorrecta.' });
            }

            const affectedRows = await LugarModel.update(id, { idPaisLugar, idDepartamentoLugar, idMunicipioLugar, nombreLugar });

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Lugar no encontrado o datos idénticos.' });
            }
            res.status(200).json({ message: 'Lugar actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar lugar:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'Error de integridad: Una de las claves foráneas (País, Depa, Muni) no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Elimina un lugar. (DELETE /api/lugares/:id)
     */
    static async deleteLugar(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await LugarModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Lugar no encontrado.' });
            }
            res.status(200).json({ message: 'Lugar eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar lugar:', error.message);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar el lugar porque está asociado a Encargados o Beneficiarios.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = LugarController;