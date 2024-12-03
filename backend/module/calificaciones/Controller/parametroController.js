import conectarDB from '../../../config/db.js';
const pool = await conectarDB();
import jwt from 'jsonwebtoken';

export const mostrarParametros= async (req, res) => {
    try {
        const query = `CALL get_parametros();`;
        const [results] = await pool.query(query);

        if (results.length === 0 || results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron parametros' });
        }

        res.status(200).json(results[0]); // Accedemos al primer conjunto de resultados
    } catch (error) {
        console.error('Error al obtener las parametros:', error);
        res.status(500).json({ message: 'Error al obtener las parametros', error });
    }
};

export const registrarParametro = async (req, res) => {
    try {
        // Verifica que el token esté presente en el encabezado
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ mensaje: 'Token no proporcionado' });
        }

        // Decodifica el token para obtener el cod_usuario
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const codUsuario = decodedToken.cod_usuario;

        if (!codUsuario) {
            return res.status(400).json({ mensaje: 'El token no contiene cod_usuario' });
        }

        // Extrae los datos del cuerpo de la solicitud
        const { Parametro, Valor, Fecha_Creacion, Fecha_Modificacion } = req.body;

        // Verifica que los parámetros sean válidos
        if (!Parametro || !Valor || !Fecha_Creacion || !Fecha_Modificacion) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
        }

        // Llama al procedimiento almacenado con los parámetros y cod_usuario
        const query = 'CALL insert_parametro(?, ?, ?, ?, ?)';
        const [resultado] = await pool.query(query, [codUsuario, Parametro, Valor, Fecha_Creacion, Fecha_Modificacion]);

        // Retorna la respuesta con el resultado
        return res.status(201).json({
            mensaje: 'Parámetro creado correctamente',
            resultado: resultado
        });

    } catch (error) {
        console.error('Error al registrar parámetro:', error.message, error.stack);
        return res.status(500).json({ mensaje: 'Error al registrar parámetro' });
    }
};

export const actualizarParametro = async (req, res) => {
    try {
        const { Cod_parametro, Parametro, Valor, Fecha_Modificacion } = req.body;

        // Verificar que todos los parámetros sean proporcionados
        if (!Cod_parametro || !Parametro || !Valor || !Fecha_Modificacion) {
            return res.status(400).json({ message: 'Faltan parámetros necesarios' });
        }

        // Consulta para llamar al procedimiento almacenado
        const query = `
            CALL update_parametro(?, ?, ?, ?);
        `;

        // Ejecutar el procedimiento almacenado con los parámetros recibidos
        const [results] = await pool.query(query, [
            Cod_parametro, 
            Parametro, 
            Valor, 
            Fecha_Modificacion
        ]);

        // Si la actualización fue exitosa, se devuelve el mensaje adecuado
        res.status(200).json({ message: 'Parámetro actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar el parámetro:', error);
        res.status(500).json({ message: 'Error al actualizar el parámetro', error });
    }
};