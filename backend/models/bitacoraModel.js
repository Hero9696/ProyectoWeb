// models/BitacoraModel.js

const pool = require('../config/dbconfig');

/**
 * Modelo para la tabla BitacoraActividad (Auditoría de acciones).
 * Dependencia: Usuarios (Puede ser NULL)
 */
class BitacoraModel {

    /**
     * Obtiene los últimos registros de la bitácora.
     * @param {number} limit - Límite de registros a devolver (por defecto 50).
     */
    static async findLatest(limit = 50) {
        const query = `
            SELECT 
                b.id, 
                b.accion, 
                b.tabla, 
                b.pk_afectada, 
                b.descripcion,
                b.ip_address, 
                b.creado_en,
                u.nombreUsuario AS usuario
            FROM BitacoraActividad b
            LEFT JOIN Usuarios u ON b.idUsuario = u.idUsuario
            ORDER BY b.creado_en DESC
            LIMIT ?
        `;
        // Nota: El parámetro LIMIT debe ser pasado como un array con un número.
        const [rows] = await pool.query(query, [limit]);
        return rows;
    }

    /**
     * Obtiene un registro de la bitácora por su ID, incluyendo los datos completos.
     */
    static async findById(id) {
        const query = `
            SELECT 
                b.*,
                u.nombreUsuario AS usuario
            FROM BitacoraActividad b
            LEFT JOIN Usuarios u ON b.idUsuario = u.idUsuario
            WHERE b.id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }

    /**
     * Registra una nueva actividad en la bitácora.
     * * @param {Object} data - Datos para la bitácora.
     * @param {number|null} data.idUsuario - ID del usuario que realiza la acción (puede ser NULL para LOGIN/LOGOUT fallidos).
     * @param {string} data.accion - Tipo de acción (Enum: 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', etc.).
     * @param {string} data.tabla - Nombre de la tabla afectada.
     * @param {string} data.pk_afectada - Clave primaria del registro afectado.
     * @param {string|null} [data.descripcion] - Descripción corta de la acción.
     * @param {Object|null} [data.datos_antes] - JSON con los datos antes de la operación.
     * @param {Object|null} [data.datos_despues] - JSON con los datos después de la operación.
     * @param {string|null} [data.ip_address] - Dirección IP del cliente.
     * @param {string|null} [data.user_agent] - User Agent del cliente.
     * @returns {Promise<number>} El ID del registro de bitácora insertado.
     */
    static async create(data) {
        const {
            idUsuario = null, accion, tabla, pk_afectada, descripcion = null,
            datos_antes = null, datos_despues = null, ip_address = null, user_agent = null
        } = data;

        // Convertir objetos JSON a strings para la base de datos
        const datosAntesJson = datos_antes ? JSON.stringify(datos_antes) : null;
        const datosDespuesJson = datos_despues ? JSON.stringify(datos_despues) : null;

        const [result] = await pool.query(
            `INSERT INTO BitacoraActividad (
                idUsuario, accion, tabla, pk_afectada, descripcion, datos_antes, datos_despues, 
                ip_address, user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idUsuario, accion, tabla, pk_afectada, descripcion, datosAntesJson, datosDespuesJson,
                ip_address, user_agent
            ]
        );
        return result.insertId;
    }

    // No se implementa UPDATE ni DELETE en la bitácora por razones de integridad de la auditoría.
}

module.exports = BitacoraModel;