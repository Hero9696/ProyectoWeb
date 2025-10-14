// controllers/UsuarioController.js

const UsuarioModel = require('../models/usuarioModel');
// Asumo que tienes una función para la Bitácora, la usaremos aquí
const BitacoraModel = require('../models/bitacoraModel'); 

/**
 * Controlador para la gestión de Usuarios.
 * Este controlador es clave para la autenticación y el manejo de roles.
 */
class UsuarioController {

    /**
     * Obtiene todos los usuarios. (GET /api/usuarios)
     */
    static async getAllUsuarios(req, res) {
        try {
            const usuarios = await UsuarioModel.findAll();
            // Evitar exponer el hash de la contraseña si se usara el findByUsername()
            // En findAll(), el modelo ya evita la contraseña.
            res.status(200).json(usuarios);
        } catch (error) {
            console.error('Error al obtener usuarios:', error.message);
            res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
        }
    }

    /**
     * Obtiene un usuario por ID. (GET /api/usuarios/:id)
     */
    static async getUsuarioById(req, res) {
        try {
            const { id } = req.params;
            const usuario = await UsuarioModel.findById(id);

            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }
            res.status(200).json(usuario);
        } catch (error) {
            console.error('Error al obtener usuario por ID:', error.message);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Crea un nuevo usuario. (POST /api/usuarios)
     */
    static async createUsuario(req, res) {
        try {
            const { nombreUsuario, contrasena, idRol } = req.body;

            if (!nombreUsuario || !contrasena || !idRol) {
                return res.status(400).json({ message: 'El nombre de usuario, la contraseña y el ID de rol son obligatorios.' });
            }

            const id = await UsuarioModel.create({ nombreUsuario, contrasena, idRol });

            // REGISTRO EN BITÁCORA
            await BitacoraModel.create({
                idUsuario: id, // El usuario que se crea
                accion: 'INSERT',
                tabla: 'Usuarios',
                pk_afectada: id.toString(),
                descripcion: `Creación del usuario: ${nombreUsuario}`
            });

            res.status(201).json({ 
                message: 'Usuario creado con éxito.', 
                idUsuario: id 
            });
        } catch (error) {
            console.error('Error al crear usuario:', error.message);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
            }
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'El ID de rol proporcionado no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
        }
    }

    /**
     * Actualiza un usuario. (PUT /api/usuarios/:id)
     */
    static async updateUsuario(req, res) {
        try {
            const { id } = req.params;
            const { nombreUsuario, contrasena, idRol } = req.body;

            if (!nombreUsuario || !idRol) {
                return res.status(400).json({ message: 'El nombre de usuario y el ID de rol son obligatorios.' });
            }
            
            // Lógica: Solo se actualiza la contraseña si se provee un valor
            const affectedRows = await UsuarioModel.update(id, { nombreUsuario, contrasena, idRol });

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado o datos idénticos.' });
            }
            
            // REGISTRO EN BITÁCORA
            await BitacoraModel.create({
                idUsuario: id, 
                accion: 'UPDATE',
                tabla: 'Usuarios',
                pk_afectada: id.toString(),
                descripcion: `Actualización de datos del usuario: ${nombreUsuario}`
            });

            res.status(200).json({ message: 'Usuario actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar usuario:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: 'El ID de rol proporcionado no existe.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    /**
     * Elimina un usuario. (DELETE /api/usuarios/:id)
     */
    static async deleteUsuario(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await UsuarioModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }

            // REGISTRO EN BITÁCORA (El idUsuario se pone en NULL si se borra el usuario)
            await BitacoraModel.create({
                idUsuario: null, 
                accion: 'DELETE',
                tabla: 'Usuarios',
                pk_afectada: id,
                descripcion: `Usuario ID ${id} ha sido eliminado.`,
                // Se podría usar datos_antes para guardar el objeto del usuario antes de borrar
            });
            
            res.status(200).json({ message: 'Usuario eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error.message);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar el usuario porque está asociado a registros de auditoría o transacciones.' });
            }
            res.status(500).json({ message: 'Error interno del servidor al eliminar usuario.' });
        }
    }
}

module.exports = UsuarioController;