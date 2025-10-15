// controllers/DonacionController.js

const DonacionModel = require('../models/donacionModel');
const CajaController = require('./cajaController'); // Reutilizamos la lógica de Caja
const pool = require('../config/dbconfig'); // Para la transacción atómica
const BitacoraModel = require('../models/bitacoraModel');

/**
 * Controlador para la gestión de Donaciones.
 */
class DonacionController {

    /**
     * Obtiene todas las donaciones. (GET /api/donaciones)
     */
    static async getAllDonaciones(req, res) {
        try {
            const donaciones = await DonacionModel.findAll();
            res.status(200).json(donaciones);
        } catch (error) {
            console.error('Error al obtener donaciones:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea una nueva donación. Si es en efectivo, actualiza la caja. (POST /api/donaciones)
     * **Requiere Transacción Atómica** si idTipoDona es para efectivo.
     */
    static async createDonacion(req, res) {
        const data = req.body;
        
        if (!data.idDonante || !data.idTipoDona || !data.idUsuarioIngreso) {
            return res.status(400).json({ message: 'Campos obligatorios faltantes.' });
        }
        
        const IS_CASH_DONATION = data.idTipoDona === 1; // Asumiendo que ID 1 es 'Efectivo/Cash'
        let connection;

        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            let idTrxAsociada = null;

            if (IS_CASH_DONATION) {
                if (typeof data.montoDonado !== 'number' || data.montoDonado <= 0) {
                    await connection.rollback();
                    return res.status(400).json({ message: 'Monto de donación en efectivo inválido.' });
                }

                // Lógica de Caja (Ingreso)
                const cajaActual = await CajaController.getCajaStatus(); // Necesitas refactorizar CajaController para obtener solo el monto o usar el Modelo
                const montoInicial = cajaActual ? parseFloat(cajaActual.montoTotal) : 0;
                const nuevoMonto = montoInicial + data.montoDonado;
                
                // 1. Actualizar Caja
                await connection.query(
                    `INSERT INTO Caja (idCaja, montoTotal, fechaActualizacion, horaActualizacion, idUsuarioActualiza) 
                     VALUES (1, ?, CURDATE(), CURTIME(), ?)
                     ON DUPLICATE KEY UPDATE 
                        montoTotal = VALUES(montoTotal), fechaActualizacion = CURDATE(), horaActualizacion = CURTIME(), idUsuarioActualiza = VALUES(idUsuarioActualiza)`,
                    [nuevoMonto, data.idUsuarioIngreso]
                );
                
                // 2. Registrar Transacción de Caja
                const [trxResult] = await connection.query(
                    `INSERT INTO TransaccionesCaja (idTipoTrx, montoTrx, nuevoMonto, fechaIngreso, horaIngreso, idUsuarioIngreso, idCajaTrx, descripcionTrx) 
                     VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, 1, ?)`,
                    [/* Tipo Ingreso */ 1, data.montoDonado, nuevoMonto, data.idUsuarioIngreso, `Donación de Donante ID ${data.idDonante}`]
                );
                idTrxAsociada = trxResult.insertId;
            }

            // 3. Crear Donación
            data.idTrxAsociada = idTrxAsociada;
            const idDonacion = await DonacionModel.create(data, connection); // Refactorizar DonacionModel para recibir la conexión

            await BitacoraModel.create({
                idUsuario: data.idUsuarioIngreso,
                accion: 'DONACION',
                tabla: 'Donaciones',
                pk_afectada: idDonacion.toString(),
                descripcion: `Nueva donación ID: ${idDonacion} (Tipo: ${data.idTipoDona})`
            });
            
            await connection.commit();

            res.status(201).json({ 
                message: 'Donación registrada con éxito.', 
                idDonacion, 
                idTransaccionCaja: idTrxAsociada
            });
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Error en la transacción de donación:', error.message);
            res.status(500).json({ message: 'Error interno del servidor al registrar donación.' });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = DonacionController;