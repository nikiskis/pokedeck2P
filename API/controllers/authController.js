import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
    const { nombre, email, contrasena, direccion, pregunta1, respuesta1, pregunta2, respuesta2 } = req.body;
    try {
        const checkEmailSql = "SELECT * FROM usuario WHERE email = ?";
        const [results] = await db.query(checkEmailSql, [email]); 
        if (results.length > 0) return res.status(400).json({ error: 'El email ya está en uso' });

        const salt = await bcrypt.genSalt(10);
        const contrasenaHasheada = await bcrypt.hash(contrasena, salt);
        const respuesta1Hasheada = await bcrypt.hash(String(respuesta1).toLowerCase(), salt);
        const respuesta2Hasheada = await bcrypt.hash(String(respuesta2).toLowerCase(), salt);

        const insertSql = "INSERT INTO usuario (nombre, email, contrasena, direccion, pregunta1, respuesta1, pregunta2, respuesta2) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const [result] = await db.query(insertSql, [nombre, email, contrasenaHasheada, direccion, pregunta1, respuesta1Hasheada, pregunta2, respuesta2Hasheada]);

        res.status(201).json({ id: result.insertId, nombre, email, direccion, administrador: 0 }); 
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al registrar.' });
    }
};

export const login = async (req, res) => {
    const { email, contrasena } = req.body;
    try {
        const sql = "SELECT * FROM usuario WHERE email = ?";
        const [results] = await db.query(sql, [email]);
        if (results.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' }); 
        
        const usuario = results[0];
        const esMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!esMatch) return res.status(401).json({ error: 'Credenciales incorrectas' });

        res.json({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            direccion: usuario.direccion,
            administrador: usuario.administrador, 
            pregunta1: usuario.pregunta1,
            pregunta2: usuario.pregunta2
        });
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        return res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
};

export const updateUser = async (req, res) => {
    const userId = parseInt(req.params.id); 
    const { nombre, email, direccion, pregunta1, respuesta1, pregunta2, respuesta2 } = req.body;

    if (isNaN(userId)) return res.status(400).json({ error: 'ID de usuario inválido.' });

    try {
        const getSql = "SELECT * FROM usuario WHERE id = ?";
        const [currentRows] = await db.query(getSql, [userId]);
        if (currentRows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        const currentUser = currentRows[0];

        let finalRespuesta1 = currentUser.respuesta1;
        let finalRespuesta2 = currentUser.respuesta2;
        const salt = await bcrypt.genSalt(10);

        if (respuesta1 && respuesta1.trim() !== "") {
            finalRespuesta1 = await bcrypt.hash(String(respuesta1).toLowerCase(), salt);
        }
        if (respuesta2 && respuesta2.trim() !== "") {
            finalRespuesta2 = await bcrypt.hash(String(respuesta2).toLowerCase(), salt);
        }

        const sql = `UPDATE usuario SET nombre = ?, email = ?, direccion = ?, pregunta1 = ?, respuesta1 = ?, pregunta2 = ?, respuesta2 = ? WHERE id = ?`;
        await db.query(sql, [nombre, email, direccion, pregunta1, finalRespuesta1, pregunta2, finalRespuesta2, userId]);

        res.json({ 
            id: userId, 
            nombre, 
            email, 
            direccion,
            administrador: currentUser.administrador, 
            pregunta1, 
            pregunta2, 
            message: 'Perfil actualizado correctamente.' 
        });

    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar.' });
    }
};

export const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id); 
    if (isNaN(userId)) return res.status(400).json({ error: 'ID de usuario inválido.' });
    try {
        const sql = "DELETE FROM usuario WHERE id = ?";
        const [result] = await db.query(sql, [userId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado correctamente.' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        return res.status(500).json({ error: 'Error interno.' });
    }
};

export const getOrderHistory = async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: 'ID de usuario inválido.' });
    try {
        const sql = `SELECT p.id AS pedido_id, p.fecha, p.total, p.estado, dp.cantidad, dp.precio_unidad, pr.nombre AS producto_nombre, pr.imagen AS producto_imagen FROM pedido p JOIN detalle_pedido dp ON p.id = dp.id_pedido JOIN producto pr ON dp.id_producto = pr.id WHERE p.id_usuario = ? ORDER BY p.fecha DESC;`;
        const [results] = await db.query(sql, [userId]);
        const orders = results.reduce((acc, row) => {
            const existingOrder = acc.find(o => o.id === row.pedido_id);
            const detail = { cantidad: row.cantidad, precio_unidad: row.precio_unidad, producto_nombre: row.producto_nombre, producto_imagen: row.producto_imagen };
            if (existingOrder) existingOrder.detalles.push(detail); 
            else acc.push({ id: row.pedido_id, fecha: row.fecha, total: row.total, estado: row.estado, detalles: [detail] });
            return acc;
        }, []);
        res.json(orders);
    } catch (err) {
        console.error('Error al obtener historial:', err);
        return res.status(500).json({ error: 'Error al consultar historial.' });
    }
};

export const getSecurityQuestions = async (req, res) => {
    const { email } = req.body;
    try {
        const sql = "SELECT pregunta1, pregunta2 FROM usuario WHERE email = ?";
        const [results] = await db.query(sql, [email]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener preguntas:', err);
        return res.status(500).json({ error: 'Error del servidor.' });
    }
};

export const resetPassword = async (req, res) => {
    const { email, respuesta1, respuesta2, nuevaContrasena } = req.body;
    try {
        const sql = "SELECT * FROM usuario WHERE email = ?";
        const [results] = await db.query(sql, [email]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const usuario = results[0];

        const match1 = await bcrypt.compare(String(respuesta1).toLowerCase(), usuario.respuesta1);
        const match2 = await bcrypt.compare(String(respuesta2).toLowerCase(), usuario.respuesta2);

        if (!match1 || !match2) {
            return res.status(400).json({ error: 'Las respuestas de seguridad son incorrectas.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashNueva = await bcrypt.hash(nuevaContrasena, salt);

        const updateSql = "UPDATE usuario SET contrasena = ? WHERE id = ?";
        await db.query(updateSql, [hashNueva, usuario.id]);

        res.json({ message: 'Contraseña actualizada correctamente.' });

    } catch (err) {
        console.error('Error al restablecer contraseña:', err);
        return res.status(500).json({ error: 'Error del servidor.' });
    }
};