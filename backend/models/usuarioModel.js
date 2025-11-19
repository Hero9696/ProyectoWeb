// models/UsuarioModel.js

const pool   = require('../config/dbconfig');
const bcrypt = require('bcryptjs'); // npm install bcryptjs

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
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(contrasena, salt);
    }

    /**
     * Compara una contraseña plana con lo que hay en la BD.
     * Soporta:
     *  - contraseñas viejas en TEXTO PLANO
     *  - contraseñas nuevas en BCRYPT
     * @param {string} contrasenaPlana     - Contraseña que ingresa el usuario.
     * @param {string} contrasenaEnBase    - Valor guardado en la BD.
     * @returns {Promise<boolean>} True si coinciden, False en caso contrario.
     */
    static async comparePassword(contrasenaPlana, contrasenaEnBase) {
        if (!contrasenaEnBase) return false;

        // ¿Parece un hash bcrypt? (empieza con $2a$, $2b$ o $2y$)
        const esBcrypt = /^\$2[aby]\$/.test(contrasenaEnBase);

        if (esBcrypt) {
            // contraseña nueva encriptada
            return bcrypt.compare(contrasenaPlana, contrasenaEnBase);
        }

        // contraseña vieja guardada en texto plano
        return contrasenaPlana === contrasenaEnBase;
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
        const [rows] = await pool.query(
            'SELECT * FROM Usuarios WHERE nombreUsuario = ?',
            [nombreUsuario]
        );
        return rows[0] || null;
    }

    /**
     * Crea un nuevo usuario (siempre guarda la contraseña hasheada).
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
     * Actualiza la información de un usuario.
     * Si viene contraseña no vacía, se vuelve a hashear.
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
        const [result] = await pool.query(
            'DELETE FROM Usuarios WHERE idUsuario = ?',
            [id]
        );
        return result.affectedRows;
    }
}

module.exports = UsuarioModel;
