import conectarDB from '../../config/db.js';
const pool = await conectarDB(); // Asegúrate de que conectarDB retorne un pool de conexión
import cors from 'cors';

// Cambia 'db' a 'pool' en las funciones
export const getAllPersonas = async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM tbl_personas'); // Usa pool aquí
    res.json(result);
  } catch (error) {
    console.error('Error al obtener personas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getPersonaById = async (req, res) => {
  const { cod_persona } = req.params;

  try {
    const [result] = await pool.query('SELECT * FROM tbl_personas WHERE cod_persona = ?', [cod_persona]); // Usa pool aquí

    if (result.length === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error al obtener la persona:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const createPersona = async (req, res) => {
  const { dni_persona, nombre, primer_apellido, segundo_apellido, nacionalidad, direccion_persona, fecha_nacimiento } = req.body;

  try {
    const result = await pool.query('INSERT INTO tbl_personas (dni_persona, nombre, primer_apellido, segundo_apellido, nacionalidad, direccion_persona, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [dni_persona, nombre, primer_apellido, segundo_apellido, nacionalidad, direccion_persona, fecha_nacimiento]);

    res.status(201).json({ message: 'Persona creada', cod_persona: result.insertId });
  } catch (error) {
    console.error('Error al crear persona:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const updatePersona = async (req, res) => {
  const { cod_persona } = req.params;
  const { dni_persona, nombre, primer_apellido, segundo_apellido, nacionalidad, direccion_persona, fecha_nacimiento } = req.body;

  try {
    const result = await pool.query('UPDATE tbl_personas SET dni_persona = ?, nombre = ?, primer_apellido = ?, segundo_apellido = ?, nacionalidad = ?, direccion_persona = ?, fecha_nacimiento = ? WHERE cod_persona = ?', 
      [dni_persona, nombre, primer_apellido, segundo_apellido, nacionalidad, direccion_persona, fecha_nacimiento, cod_persona]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    res.json({ message: 'Persona actualizada' });
  } catch (error) {
    console.error('Error al actualizar persona:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const deletePersona = async (req, res) => {
  const { cod_persona } = req.params;

  try {
    const result = await pool.query('DELETE FROM tbl_personas WHERE cod_persona = ?', [cod_persona]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    res.json({ message: 'Persona eliminada' });
  } catch (error) {
    console.error('Error al eliminar persona:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Asegúrate de que este sea el export por defecto
export default {
  getAllPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
};
