// models/DetalleVentaModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla DetalleVentas (Líneas de la Venta).
 * Dependencia: Ventas
 */
class DetalleVentaModel {

    /**
     * Obtiene el detalle de una venta específica por el ID de la venta.
     * No hay JOINs adicionales ya que el detalle solo referencia a la venta.
     */
    static async findByVentaId(idVenta) {
        const query = `
            SELECT 
                idDetalleVenta, 
                cantidad, 
                valorUnidad, 
                subtotal
            FROM DetalleVentas 
            WHERE idVentaDetalle = ?
        `;
        const [rows] = await pool.query(query, [idVenta]);
        return rows;
    }

    /**
     * Obtiene un registro de detalle por su ID.
     */
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM DetalleVentas WHERE idDetalleVenta = ?', [id]);
        return rows[0] || null;
    }

    /**
     * Registra un nuevo detalle de venta.
     * NOTA IMPORTANTE: Esta función DEBE ser ejecutada dentro de la misma transacción 
     * de BD que la inserción en la tabla Ventas para garantizar la atomicidad.
     * * @param {Object} data - Datos del detalle.
     * @param {number} data.idVentaDetalle - ID de la venta padre.
     * @param {number} data.cantidad - Cantidad de producto vendido.
     * @param {number} data.valorUnidad - Precio unitario.
     * @param {number} data.subtotal - Subtotal (cantidad * valorUnidad).
     * @param {object} connection - Objeto de conexión de MySQL para la transacción.
     * @returns {Promise<number>} El ID del detalle insertado.
     */
    static async create({ idVentaDetalle, cantidad, valorUnidad, subtotal }, connection) {
        const [result] = await connection.query(
            `INSERT INTO DetalleVentas (
                idVentaDetalle, cantidad, valorUnidad, subtotal
            ) VALUES (?, ?, ?, ?)`,
            [idVentaDetalle, cantidad, valorUnidad, subtotal]
        );
        return result.insertId;
    }

    /**
     * Inserta múltiples detalles de venta a la vez (por ejemplo, al finalizar una venta).
     * @param {Array<Object>} detalles - Array de objetos de detalle.
     * @param {number} idVenta - ID de la venta padre.
     * @param {object} connection - Objeto de conexión de MySQL para la transacción.
     * @returns {Promise<object>} El resultado de la consulta.
     */
    static async createMany(detalles, idVenta, connection) {
        // Mapeamos los detalles a un array de arrays de valores
        const values = detalles.map(d => [
            idVenta, 
            d.cantidad, 
            d.valorUnidad, 
            d.subtotal
        ]);

        const sql = `
            INSERT INTO DetalleVentas (
                idVentaDetalle, cantidad, valorUnidad, subtotal
            ) VALUES ?
        `;
        
        // Usamos pool.query con el formato '?' para insertar múltiples filas
        const [result] = await connection.query(sql, [values]);
        return result;
    }
    
    // El detalle de una venta, como la venta misma, generalmente no se actualiza ni se elimina
    // para mantener la integridad del registro histórico.
}

module.exports = DetalleVentaModel;