// controllers/BeneficiarioController.js

const BeneficiarioModel = require('../models/beneficiarioModel'); // Corregido a mayúscula (Encargado)
const EncargadoModel = require('../models/encargadoModel');
const BitacoraModel = require('../models/bitacoraModel'); // Corregido a mayúscula (Encargado)

/**
 * Controlador para la gestión de Beneficiarios.
 */
class BeneficiarioController {

    // ... (getAllBeneficiarios y getBeneficiarioById se mantienen igual)
    static async getAllBeneficiarios(req, res) {
        try {
            const beneficiarios = await BeneficiarioModel.findAll();
            res.status(200).json(beneficiarios);
        } catch (error) {
            console.error('Error al obtener beneficiarios:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
    
    static async getBeneficiarioById(req, res) {
        try {
            const { id } = req.params;
            const beneficiario = await BeneficiarioModel.findById(id);

            if (!beneficiario) {
                return res.status(404).json({ message: 'Beneficiario no encontrado.' });
            }
            res.status(200).json(beneficiario);
        } catch (error) {
            console.error('Error al obtener beneficiario por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
    // ...

    /**
     * Crea un nuevo beneficiario. (POST /api/beneficiarios)
     */
    static async createBeneficiario(req, res) {
        try {
            const data = req.body;
            
            // VALIDACIÓN MÍNIMA y ESTRICTA DE TODOS los campos NOT NULL requeridos por la DB
            if (
                !data.nombre1Beneficiario || !data.nombre2Beneficiario || !data.nombre3Beneficiario ||
                !data.apellido1Beneficiario || !data.apellido2Beneficiario || !data.apellido3Beneficiario ||
                !data.idEncargadoBene || !data.idPaisBene || !data.idDepartamentoBene || 
                !data.idMunicipioBene || !data.idLugarBene || !data.estadoBeneficiario || 
                !data.idUsuarioIngreso
            ) {
                 return res.status(400).json({ 
                    message: 'Faltan campos obligatorios. Asegúrese de enviar todos los 3 nombres, 3 apellidos, ID de ubicación, Encargado, estadoBeneficiario ("A" o "I") y Usuario de ingreso.' 
                });
            }
            
            // Asignar un valor por defecto si no se recibe (opcional, pero útil)
            data.estadoBeneficiario = data.estadoBeneficiario.toUpperCase();
            
            // Opcional: Validación de existencia del Encargado (se mantiene la lógica)
            const encargado = await EncargadoModel.findById(data.idEncargadoBene);
            if (!encargado) {
                 return res.status(400).json({ message: 'El ID de Encargado proporcionado no existe.' });
            }

            const id = await BeneficiarioModel.create(data);

            await BitacoraModel.create({
                idUsuario: data.idUsuarioIngreso,
                accion: 'INSERT',
                tabla: 'beneficiarios',
                pk_afectada: id.toString(),
                descripcion: `Creación del Beneficiario ID: ${id}`
            });

            res.status(201).json({ 
                message: 'Beneficiario creado con éxito.', 
                idBeneficiario: id 
            });
        } catch (error) {
            console.error('Error al crear beneficiario:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_ROW_DOES_NOT_EXIST') {
                return res.status(400).json({ message: 'Error de integridad: Una de las claves foráneas (ubicación, encargado o usuario) no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Actualiza un beneficiario. (PUT /api/beneficiarios/:id)
     */
    static async updateBeneficiario(req, res) {
        // ... (Se debe corregir la validación de campos obligatorios también)
        try {
            const { id } = req.params;
            const data = req.body;

            // Validación de campos obligatorios para UPDATE (ajustar según el modelo)
            if (
                !data.nombre1Beneficiario || !data.apellido1Beneficiario || !data.idEncargadoBene || 
                !data.idPaisBene || !data.idDepartamentoBene || !data.idMunicipioBene || 
                !data.idLugarBene || !data.estadoBeneficiario || !data.idUsuarioActualiza
            ) {
                 return res.status(400).json({ message: 'Faltan campos obligatorios para la actualización.' });
            }
            
            data.estadoBeneficiario = data.estadoBeneficiario.toUpperCase();

            const affectedRows = await BeneficiarioModel.update(id, data);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Beneficiario no encontrado o datos idénticos.' });
            }
            
            await BitacoraModel.create({
                idUsuario: data.idUsuarioActualiza,
                accion: 'UPDATE',
                tabla: 'beneficiarios',
                pk_afectada: id.toString(),
                descripcion: `Actualización del Beneficiario ID: ${id}`
            });

            res.status(200).json({ message: 'Beneficiario actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar beneficiario:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
    // ... (deleteBeneficiario se mantiene igual)
}

module.exports = BeneficiarioController;