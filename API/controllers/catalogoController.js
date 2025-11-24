import db from '../config/db.js';

export const obtenerProductos = async (req, res) => { 
    const sql = 'SELECT * FROM producto'; 
    try {
        const [results] = await db.query(sql); 
        res.json(results);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al obtener productos.' });
    }
};

export const actualizarStock = async (req, res) => {
    const id = parseInt(req.params.id);
    const { stock } = req.body;
    if (isNaN(id) || stock === undefined) return res.status(400).json({ error: 'Datos inválidos' });

    const sql = 'UPDATE producto SET stock = ? WHERE id = ?';
    try {
        const [result] = await db.query(sql, [stock, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ message: 'Stock actualizado correctamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error del servidor' });
    }
};

export const editarProductoCompleto = async (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, descripcion, precio, stock } = req.body;
    const file = req.file; 

    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    try {
        let sql;
        let params;

        if (file) {
            const imagenPath = `http://189.163.49.6:4000/images/${file.filename}`;
            sql = 'UPDATE producto SET nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ? WHERE id = ?';
            params = [nombre, descripcion, precio, stock, imagenPath, id];
        } else {
            sql = 'UPDATE producto SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?';
            params = [nombre, descripcion, precio, stock, id];
        }

        const [result] = await db.query(sql, params);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });

        res.json({ message: 'Producto actualizado correctamente' });

    } catch (err) {
        console.error('Error al editar producto completo:', err);
        return res.status(500).json({ error: 'Error del servidor al editar.' });
    }
};

export const crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    const file = req.file;

    if (!nombre || !precio || !file) {
        return res.status(400).json({ error: 'Nombre, precio e imagen son obligatorios.' });
    }

    try {
        const imagenPath = `http://189.163.49.6:4000/images/${file.filename}`;
        const sql = 'INSERT INTO producto (nombre, descripcion, precio, stock, imagen, activo) VALUES (?, ?, ?, ?, ?, 1)';
        const [result] = await db.query(sql, [nombre, descripcion || '', precio, stock || 0, imagenPath]);

        res.status(201).json({ id: result.insertId, message: 'Producto creado exitosamente' });

    } catch (err) {
        console.error('Error al crear producto:', err);
        return res.status(500).json({ error: 'Error al guardar el producto.' });
    }
};

export const eliminarProducto = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    try {
        const sql = "UPDATE producto SET activo = 0 WHERE id = ?";
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto desactivado correctamente' });
    } catch (err) {
        console.error('Error al desactivar producto:', err);
        return res.status(500).json({ error: 'Error al eliminar producto.' });
    }
};

export const activarProducto = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    try {
        const sql = "UPDATE producto SET activo = 1 WHERE id = ?";
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto reactivado correctamente' });
    } catch (err) {
        console.error('Error al reactivar producto:', err);
        return res.status(500).json({ error: 'Error al procesar la solicitud.' });
    }
};