// controllers/InventarioController.js

const InventarioModel = require('../models/inventarioModel');

/**
 * Controlador para la gestión de Inventario.
 * Nota: Los métodos de actualización principales se harán a través de VentaController y DonacionController (no implementado).
 * Aquí solo incluimos el CRUD base para inicializar y consultar.
 */
class InventarioController {
    
    /**
     * Obtiene todos los registros de inventario. (GET /api/inventario)
     */
    static async getAllInventario(req, res) {
        try {
            const inventarios = await InventarioModel.findAll();
            res.status(200).json(inventarios);
        } catch (error) {
            console.error('Error al obtener inventario:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene el inventario por ID de beneficiario. (GET /api/inventario/beneficiario/:id)
     */
    static async getInventarioByBeneficiarioId(req, res) {
        try {
            const { id } = req.params;
            const inventario = await InventarioModel.findByBeneficiarioId(id);

            if (!inventario) {
                return res.status(404).json({ message: 'Inventario no encontrado para este beneficiario.' });
            }
            res.status(200).json(inventario);
        } catch (error) {
            console.error('Error al obtener inventario por ID de beneficiario:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Inicializa el inventario para un beneficiario. (POST /api/inventario)
     * Solo debe ser llamado una vez por beneficiario.
     */
    static async createInventario(req, res) {
        try {
            const data = req.body;

            // Validación mínima para inicialización
            if (!data.idBeneficiario || !data.idUsuarioIngreso) {
                 return res.status(400).json({ message: 'El ID de beneficiario y el usuario de ingreso son obligatorios.' });
            }
            
            // Prevenir duplicados (aunque la DB lo haría, es mejor validarlo aquí)
            const exists = await InventarioModel.findByBeneficiarioId(data.idBeneficiario);
            if (exists) {
                return res.status(409).json({ message: 'El inventario para este beneficiario ya fue inicializado.' });
            }

            // Establecer valores iniciales si no se proporcionan (deberían ser 0)
            data.cantidadInicial = data.cantidadInicial || 0;
            data.cantidadVendida = 0;
            data.cantidadConsumida = 0;
            data.cantidadActual = data.cantidadInicial;
            data.ultimaCantidadIngre = data.cantidadInicial;
            data.montoTotal = data.montoTotal || 0.00;


            const id = await InventarioModel.create(data);

            // Se puede omitir la bitácora aquí, ya que el InventarioController.js
            // no maneja la lógica de negocio principal de transacciones.
            // Si quieres registrar, usa BitacoraModel.create() aquí.

            res.status(201).json({ 
                message: 'Inventario inicializado con éxito.', 
                idInventario: id 
            });
        } catch (error) {
            console.error('Error al inicializar inventario:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

module.exports = InventarioController;