import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
    const { nombre, email, contrasena, direccion } = req.body;

    try {
        const checkEmailSql = "SELECT * FROM usuario WHERE email = ?";
        const [results] = await db.query(checkEmailSql, [email]); 

        if (results.length > 0) {
            return res.status(400).json({ error: 'El email ya está en uso' });
        }

        const salt = await bcrypt.genSalt(10);
        const contrasenaHasheada = await bcrypt.hash(contrasena, salt);

        const insertSql = "INSERT INTO usuario (nombre, email, contrasena, direccion) VALUES (?, ?, ?, ?)";
        const [result] = await db.query(insertSql, [nombre, email, contrasenaHasheada, direccion]);

        res.status(201).json({ 
            id: result.insertId, 
            nombre, 
            email, 
            direccion 
        });

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
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' }); 
        }

        const usuario = results[0];

        const esMatch = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!esMatch) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        res.json({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            direccion: usuario.direccion
        });

    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        return res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
};


export const updateUser = async (req, res) => {
    const userId = parseInt(req.params.id); 
    const { nombre, email, direccion } = req.body;

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID de usuario inválido.' });
    }

    try {
        const sql = "UPDATE usuario SET nombre = ?, email = ?, direccion = ? WHERE id = ?";
        const [result] = await db.query(sql, [nombre, email, direccion, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ 
            id: userId, 
            nombre, 
            email, 
            direccion, 
            message: 'Usuario actualizado correctamente.' 
        });

    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar.' });
    }
};

export const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id); 

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID de usuario inválido.' });
    }

    try {
        const sql = "DELETE FROM usuario WHERE id = ?";
        const [result] = await db.query(sql, [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado correctamente.' });

    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        return res.status(500).json({ error: 'Error interno del servidor al eliminar.' });
    }
};

export const getOrderHistory = async (req, res) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID de usuario inválido.' });
    }

    try {
        const sql = `
            SELECT
                p.id AS pedido_id, 
                p.fecha, 
                p.total, 
                p.estado,
                dp.cantidad,
                dp.precio_unidad,
                pr.nombre AS producto_nombre,
                pr.imagen AS producto_imagen
            FROM pedido p
            JOIN detalle_pedido dp ON p.id = dp.id_pedido
            JOIN producto pr ON dp.id_producto = pr.id
            WHERE p.id_usuario = ?
            ORDER BY p.fecha DESC;
        `;
        
        const [results] = await db.query(sql, [userId]);
        
        const orders = results.reduce((acc, row) => {
            const existingOrder = acc.find(o => o.id === row.pedido_id);

            const detail = {
                cantidad: row.cantidad,
                precio_unidad: row.precio_unidad,
                producto_nombre: row.producto_nombre,
                producto_imagen: row.producto_imagen
            };

            if (existingOrder) {
                existingOrder.detalles.push(detail);
            } else {
                acc.push({
                    id: row.pedido_id,
                    fecha: row.fecha,
                    total: row.total,
                    estado: row.estado,
                    detalles: [detail]
                });
            }
            return acc;
        }, []);


        res.json(orders);

    } catch (err) {
        console.error('Error al obtener historial de pedidos:', err);
        return res.status(500).json({ error: 'Error al consultar el historial de pedidos.' });
    }
};