// controllers/MunicipioController.js

const MunicipioModel = require('../models/municipioModel');
const DepartamentoModel = require('../models/departamentoModel');

/**
 * Controlador para la gestión de Municipios.
 */
class MunicipioController {

    /**
     * Obtiene todos los municipios. (GET /api/municipios)
     */
    static async getAllMunicipios(req, res) {
        try {
            const municipios = await MunicipioModel.findAll();
            res.status(200).json(municipios);
        } catch (error) {
            console.error('Error al obtener municipios:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene un municipio por ID. (GET /api/municipios/:id)
     */
    static async getMunicipioById(req, res) {
        try {
            const { id } = req.params;
            const municipio = await MunicipioModel.findById(id);

            if (!municipio) {
                return res.status(404).json({ message: 'Municipio no encontrado.' });
            }
            res.status(200).json(municipio);
        } catch (error) {
            console.error('Error al obtener municipio por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea un nuevo municipio. (POST /api/municipios)
     */
    static async createMunicipio(req, res) {
        try {
            const { idDepartamentoMuni, idPaisMuni, nombreMunicipio } = req.body;

            if (!idDepartamentoMuni || !idPaisMuni || !nombreMunicipio) {
                return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
            }
            
            // Opcional: Validación extra, verificar consistencia (idPaisMuni debe coincidir con el país del idDepartamentoMuni)
            // Esto se hace en el controlador ya que es lógica de negocio/validación compleja.
            const departamento = await DepartamentoModel.findById(idDepartamentoMuni);
            if (!departamento || departamento.idPaisDepa !== idPaisMuni) {
                return res.status(400).json({ message: 'Inconsistencia de datos: El departamento no pertenece al país especificado.' });
            }

            const id = await MunicipioModel.create({ idDepartamentoMuni, idPaisMuni, nombreMunicipio });
            res.status(201).json({ 
                message: 'Municipio creado con éxito.', 
                idMunicipio: id 
            });
        } catch (error) {
            console.error('Error al crear municipio:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'Error de integridad: El ID de país o departamento no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Actualiza un municipio. (PUT /api/municipios/:id)
     */
    static async updateMunicipio(req, res) {
        try {
            const { id } = req.params;
            const { idDepartamentoMuni, idPaisMuni, nombreMunicipio } = req.body;

            if (!idDepartamentoMuni || !idPaisMuni || !nombreMunicipio) {
                return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
            }

            const affectedRows = await MunicipioModel.update(id, { idDepartamentoMuni, idPaisMuni, nombreMunicipio });

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Municipio no encontrado o datos idénticos.' });
            }
            res.status(200).json({ message: 'Municipio actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar municipio:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'Error de integridad: El ID de país o departamento no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Elimina un municipio. (DELETE /api/municipios/:id)
     */
    static async deleteMunicipio(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await MunicipioModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Municipio no encontrado.' });
            }
            res.status(200).json({ message: 'Municipio eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar municipio:', error.message);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar el municipio porque está asociado a Lugares, Encargados, Donantes o Beneficiarios.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = MunicipioController;