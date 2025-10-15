// controllers/VentaController.js

const VentaModel = require('../models/ventaModel');
const DetalleVentaModel = require('../models/detalleVentaModel');
const InventarioModel = require('../models/inventarioModel');
const CajaModel = require('../models/cajaModel');
const TransaccionCajaModel = require('../models/transaccionCajaModel');
const BitacoraModel = require('../models/bitacoraModel');
const pool = require('../config/dbconfig');

// Tipo de Transacción: ID 2 = Ingreso por Venta (ASUMIDO, ajustar si es necesario)
const TIPO_TRX_VENTA_INGRESO = 2; 

/**
 * Controlador para la gestión de Ventas.
 * **Contiene la lógica transaccional más importante.**
 */
class VentaController {

    /**
     * Obtiene todas las ventas. (GET /api/ventas)
     */
    static async getAllVentas(req, res) {
        try {
            const ventas = await VentaModel.findAll();
            res.status(200).json(ventas);
        } catch (error) {
            console.error('Error al obtener ventas:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Obtiene una venta con su detalle. (GET /api/ventas/:id)
     */
    static async getVentaWithDetails(req, res) {
        try {
            const { id } = req.params;
            const venta = await VentaModel.findById(id);

            if (!venta) {
                return res.status(404).json({ message: 'Venta no encontrada.' });
            }
            
            const detalles = await DetalleVentaModel.findByVentaId(id);
            
            res.status(200).json({
                ...venta,
                detalles
            });
        } catch (error) {
            console.error('Error al obtener venta con detalles:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea una nueva Venta (Cabecera, Detalle), actualiza Inventario y Caja. (POST /api/ventas)
     */
    static async createVenta(req, res) {
        const { idBeneficiarioVenta, TotalVenta, idUsuarioIngresa, detalles } = req.body;
        
        if (!idBeneficiarioVenta || !TotalVenta || !idUsuarioIngresa || !detalles || detalles.length === 0) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para la venta (beneficiario, total, usuario, detalles).' });
        }

        let connection;
        try {
            // 1. Iniciar Transacción
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // 2. Comprobar Inventario
            const inventario = await InventarioModel.findByBeneficiarioId(idBeneficiarioVenta);
            if (!inventario) {
                throw new Error('Inventario no inicializado para el beneficiario.');
            }
            
            // ** LÓGICA DE STOCKS/CANTIDADES AQUÍ ** // Esto es solo un ejemplo, la lógica real de tu Inventario es más compleja
            // y dependerá de qué representa 'cantidad' y 'montoTotal'.
            
            // Ejemplo de actualización de Inventario
            const nuevaCantidadVendida = inventario.cantidadVendida + 1; // Simplificado
            const nuevaCantidadActual = inventario.cantidadActual - 1; // Simplificado
            
            if (nuevaCantidadActual < 0) {
                throw new Error('Stock insuficiente para completar la venta.');
            }
            
            // 3. Crear Cabecera de Venta
            const idVenta = await VentaModel.create({ idBeneficiarioVenta, TotalVenta, idUsuarioIngresa }, connection);
            
            // 4. Crear Detalle de Venta (usando el método createMany)
            await DetalleVentaModel.createMany(detalles, idVenta, connection);

            // 5. Actualizar Inventario (Se debe usar una consulta UPDATE directa con el connection)
            await connection.query(
                `UPDATE Inventario SET 
                    cantidadVendida = ?, cantidadActual = ?, montoTotal = montoTotal + ?, 
                    fechaActualizacion = CURDATE(), horaActualizacion = CURTIME(), idUsuarioActualiza = ?
                 WHERE idBeneficiario = ?`,
                [nuevaCantidadVendida, nuevaCantidadActual, TotalVenta, idUsuarioIngresa, idBeneficiarioVenta]
            );
            
            // 6. Actualizar Caja y Registrar Transacción (Ingreso por Venta)
            const cajaActual = await CajaModel.find();
            const montoInicial = cajaActual ? parseFloat(cajaActual.montoTotal) : 0;
            const nuevoMonto = montoInicial + TotalVenta;

            await connection.query(
                `INSERT INTO Caja (idCaja, montoTotal, fechaActualizacion, horaActualizacion, idUsuarioActualiza) 
                 VALUES (1, ?, CURDATE(), CURTIME(), ?)
                 ON DUPLICATE KEY UPDATE 
                    montoTotal = VALUES(montoTotal), fechaActualizacion = CURDATE(), horaActualizacion = CURTIME(), idUsuarioActualiza = VALUES(idUsuarioActualiza)`,
                [nuevoMonto, idUsuarioIngresa]
            );

            await connection.query(
                `INSERT INTO TransaccionesCaja (idTipoTrx, montoTrx, nuevoMonto, fechaIngreso, horaIngreso, idUsuarioIngreso, idCajaTrx, descripcionTrx) 
                 VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, 1, ?)`,
                [TIPO_TRX_VENTA_INGRESO, TotalVenta, nuevoMonto, idUsuarioIngresa, `Venta ID ${idVenta} a Beneficiario ${idBeneficiarioVenta}`]
            );

            // 7. Registro en Bitácora
            await BitacoraModel.create({
                idUsuario: idUsuarioIngresa,
                accion: 'VENTA',
                tabla: 'Ventas',
                pk_afectada: idVenta.toString(),
                descripcion: `Venta de $${TotalVenta} a Beneficiario ID ${idBeneficiarioVenta}`
            });

            // 8. Commit de la Transacción
            await connection.commit();

            res.status(201).json({ 
                message: 'Venta registrada, inventario y caja actualizados con éxito.', 
                idVenta: idVenta 
            });

        } catch (error) {
            if (connection) {
                await connection.rollback(); // Rollback en caso de error
            }
            console.error('Error en la transacción de venta:', error.message);
            const status = error.message.includes('Stock insuficiente') ? 400 : 500;
            res.status(status).json({ message: error.message });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = VentaController;