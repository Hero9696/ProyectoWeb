// models/UsuarioModel.js

const pool = require('../config/dbconfig');
const bcrypt = require('bcryptjs'); // Necesitas instalar esta dependencia: npm install bcryptjs

/**
 * Modelo para la tabla Usuarios.
 * Dependencia: Roles
 */
class UsuarioModel {

    /**
     * Hashea la contraseña antes de insertarla o actualizarla.
     * @param {string} contrasena - La contraseña sin hashear.
     * @returns {Promise<string>} La contraseña hasheada.
     */
    static async hashPassword(contrasena) {
        // Genera un salt y hashea la contraseña
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(contrasena, salt);
    }

    /**
     * Compara una contraseña plana con una hasheada.
     * @param {string} contrasenaPlana - Contraseña ingresada por el usuario.
     * @param {string} contrasenaHasheada - Contraseña hasheada de la DB.
     * @returns {Promise<boolean>} True si coinciden, False en caso contrario.
     */
    static async comparePassword(contrasenaPlana, contrasenaHasheada) {
        return bcrypt.compare(contrasenaPlana, contrasenaHasheada);
    }
    
    // --- Métodos CRUD ---

    /**
     * Obtiene todos los usuarios, incluyendo el nombre del rol.
     */
    static async findAll() {
        const query = `
            SELECT 
                u.idUsuario, 
                u.nombreUsuario, 
                u.idRol, 
                r.nombreRol 
            FROM Usuarios u
            JOIN Roles r ON u.idRol = r.idRol
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Obtiene un usuario por su ID.
     */
    static async findById(id) {
        const query = `
            SELECT 
                u.idUsuario, 
                u.nombreUsuario, 
                u.idRol, 
                r.nombreRol
            FROM Usuarios u
            JOIN Roles r ON u.idRol = r.idRol
            WHERE u.idUsuario = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
    }

    /**
     * Obtiene un usuario por su nombre de usuario.
     */
    static async findByUsername(nombreUsuario) {
        const [rows] = await pool.query('SELECT * FROM Usuarios WHERE nombreUsuario = ?', [nombreUsuario]);
        return rows[0] || null;
    }

    /**
     * Crea un nuevo usuario.
     */
    static async create({ nombreUsuario, contrasena, idRol }) {
        const contrasenaHasheada = await this.hashPassword(contrasena);

        const [result] = await pool.query(
            'INSERT INTO Usuarios (nombreUsuario, contrasena, idRol) VALUES (?, ?, ?)',
            [nombreUsuario, contrasenaHasheada, idRol]
        );
        return result.insertId;
    }

    /**
     * Actualiza la información de un usuario. Permite actualizar el rol, y la contraseña (opcionalmente).
     * Nota: Este método no maneja la actualización de la contraseña si es un string vacío. 
     */
    static async update(id, { nombreUsuario, contrasena, idRol }) {
        let sql = 'UPDATE Usuarios SET nombreUsuario = ?, idRol = ?';
        const params = [nombreUsuario, idRol];

        if (contrasena) {
            const contrasenaHasheada = await this.hashPassword(contrasena);
            sql += ', contrasena = ?';
            params.push(contrasenaHasheada);
        }
        
        sql += ' WHERE idUsuario = ?';
        params.push(id);

        const [result] = await pool.query(sql, params);
        return result.affectedRows;
    }

    /**
     * Elimina un usuario por su ID.
     */
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM Usuarios WHERE idUsuario = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = UsuarioModel;