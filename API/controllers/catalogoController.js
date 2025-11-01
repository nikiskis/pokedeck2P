import db from '../config/db.js';

export const obtenerProductos = async (req, res) => { 
    const sql = 'SELECT * FROM producto'; 
    
    try {
        const [results, fields] = await db.query(sql); 
        res.json(results);
    } catch (err) {
        console.error('Error al obtener productos: ', err);
        return res.status(500).json({ error: 'Error al obtener productos de MySQL.' });
    }
};