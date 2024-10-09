import express from 'express';
import dotenv from 'dotenv';
import conectarDB from './config/db.js'; 
import usuariosRoutes from './module/auth/usuario_routes.js'; 
import profesoresRoutes from './module/calificaciones/Routes/profesoresRoutes.js';
import tiposContratoRoutes from './module/calificaciones/Routes/tiposContratosRoutes.js';
import actividadesRoutes from './module/calificaciones/Routes/ActividadAcademica_Routes.js';
import gradosAcademicosRoutes from './module/calificaciones/Routes/gradosAcademicosRoutes.js';
import especialidadRoutes from './module/calificaciones/Routes/especialidadesRoutes.js';
import asignaturaRoutes from './module/calificaciones/Routes/asignaturasRoutes.js';
import parcialesRoutes from './module/calificaciones/Routes/parcialesRoutes.js';
import gradoRoutes from './module/calificaciones/Routes/gradosRoutes.js';
import ciclosRoutes from './module/calificaciones/Routes/ciclosRoutes.js';
import ponderacionRoutes from './module/calificaciones/Routes/ponderacionesRoutes.js';
import estadoasitenciaRoutes from './module/calificaciones/Routes/estadoAsistenciaRoutes.js';
import asisntenciaRoutes from './module/calificaciones/Routes/asistenciaRoutes.js';
import estadonotaRoutes from './module/calificaciones/Routes/estadoNotaRoutes.js';
import notaRoutes from './module/calificaciones/Routes/notaRoutes.js';
import historialAcademicoRoutes from './module/calificaciones/Routes/historialAcademico.js';
import matriculaRoutes from './module/matricula/Routes/matriculaRoutes.js'; 
import edificiosRoutes from './module/matricula/Routes/edificiosRoutes.js';
import aulasRoutes from './module/matricula/Routes/aulasRoutes.js';
import actividadesextraRoutes from './module/matricula/Routes/actividadesextraRoutes.js';
import solicitudRoutes from './module/matricula/Routes/solicitudRoutes.js';


dotenv.config(); 

const app = express();

const init = async () => {
    await conectarDB();
};

init();

app.use(express.json());

// Usar las rutas de usuarios para autenticación y creación de cuentas de usuario
app.use('/api/usuarios', usuariosRoutes); 
// Rutas para los profesores para poder agregar, modificar, eliminar y obtener profesores
app.use('/api/profesores', profesoresRoutes); 
// Rutas para tipos de contrato de los profesores 
app.use('/api/contratos', tiposContratoRoutes); 
//Rutas para actividades academicas para poder agregar, modificar, eliminar y obtener actividades academicas
app.use('/api/actividadesAcademicas', actividadesRoutes);
//Rutas para grados academicos de los profesores
app.use('/api/gradosAcademicos', gradosAcademicosRoutes);
//Rutas para especialidades de los profesores
app.use('/api/especialidades', especialidadRoutes);
//Rutas para asignaturas de los grados
app.use('/api/asignaturas', asignaturaRoutes);
//Rutas para parciales de las asignaturas
app.use('/api/parciales', parcialesRoutes);
//Rutas para grados de los estudiantes
app.use('/api/grados', gradoRoutes);
//Rutas para ciclos de los grados
app.use('/api/ciclos', ciclosRoutes);
//Rutas para ponderaciones de las notas
app.use('/api/ponderaciones', ponderacionRoutes);
//Rutas para estado de asistencia de los estudiantes
app.use('/api/estadoAsistencia', estadoasitenciaRoutes);
//Rutas para asistencia de los estudiantes
app.use('/api/asistencia', asisntenciaRoutes);
//Rutas para estado de notas de los estudiantes
app.use('/api/estadoNotas', estadonotaRoutes);
//Rutas para notas de los estudiantes
app.use('/api/notas', notaRoutes);
//Rutas para historial academico de los estudiantes
app.use('/api/historialAcademico', historialAcademicoRoutes);

//matricula
// Usar las rutas de matrícula
app.use('/api/matricula', matriculaRoutes);
// Rutas para el edificio
app.use('/api/edificio', edificiosRoutes);
// Rutas para las aulas
app.use('/api/aula', aulasRoutes);
// Rutas para las actividades extracurriculares
app.use('/api/actividadesExtracurriculares',actividadesextraRoutes)
// Usar las rutas de solicitud
app.use('/api/solicitud', solicitudRoutes);
const PORT = process.env.PORT || 4000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor backend en ejecución en el puerto ${PORT}`);
});
