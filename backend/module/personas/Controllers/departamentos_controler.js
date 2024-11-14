import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Controlador para obtener los departamentos y municipios
export const obtenerDepartamentosYMunicipios = async (req, res) => {
    try {
        // Obtener la conexión del pool
        const pool = await conectarDB();

        // Consulta SQL para obtener departamentos y municipios relacionados
        const [rows] = await pool.query(`
            SELECT d.cod_departamento, d.nombre_departamento, m.cod_municipio, m.nombre_municipio
            FROM tbl_departamento d
            LEFT JOIN tbl_municipio m ON d.cod_departamento = m.cod_departamento
        `);

        // Verificar si hay resultados
        if (rows.length > 0) {
            res.status(200).json(rows);  // Retornar los resultados
        } else {
            res.status(404).json({ message: 'No se encontraron departamentos o municipios' });
        }
    } catch (error) {
        console.error('Error al obtener departamentos y municipios:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Controlador para obtener los departamentos y municipios
export const departamento = async (req, res) => {
    try {
        // Obtener la conexión del pool
        const pool = await conectarDB();

        // Consulta SQL para obtener departamentos y municipios relacionados
        const [rows] = await pool.query(`
            SELECT cod_departamento, nombre_departamento FROM tbl_departamento 
        `);

        // Verificar si hay resultados
        if (rows.length > 0) {
            res.status(200).json(rows);  // Retornar los resultados
        } else {
            res.status(404).json({ message: 'No se encontraron departamentos' });
        }
    } catch (error) {
        console.error('Error al obtener departamentos', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
