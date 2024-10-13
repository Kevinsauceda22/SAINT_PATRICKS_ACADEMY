import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MatriculaList = () => {
    const navigate = useNavigate();
    const [matriculas, setMatriculas] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Estados para los modales
    const [showModalAgregar, setShowModalAgregar] = useState(false);
    const [showModalDetalles, setShowModalDetalles] = useState(false);
    const [showModalDescuento, setShowModalDescuento] = useState(false);
    const [formData, setFormData] = useState({
        Cod_genealogia: '', // Asegúrate de que esta propiedad esté aquí
        tipo_estado: '',
        Fecha_inicio: '',
        Fecha_fin: '',
        anio_academico: '',
        tipo_matricula: '',
        Tipo_transaccion: '',
        Monto: '',
        Descripcion_caja: '',
        Cod_concepto: '',
        Codificacion_matricula: '',
        fecha_matricula: '',
    });
    
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = 4; // Total de secciones

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null); // Estado para matrícula seleccionada

    // Datos del descuento
    const [descuentoData, setDescuentoData] = useState({
        nombre_descuento: '',
        valor: '',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
        cod_matricula: null, // Se asignará cuando selecciones la matrícula
    });

    const obtenerMatriculas = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/matricula/matriculas', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            setMatriculas(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching matriculas:', error);
            setError('Hubo un problema al obtener las matrículas.');
            setLoading(false);
        }
    };

    const agregarMatricula = async (e) => {
        e.preventDefault();
    
        const requestData = {
            p_Cod_genealogia: Number(formData.Cod_genealogia), // Usar Cod_genealogia aquí
            p_tipo_estado: formData.tipo_estado.toLowerCase(),
            p_Fecha_inicio: formData.Fecha_inicio,
            p_Fecha_fin: formData.Fecha_fin,
            p_anio_academico: Number(formData.anio_academico),
            p_tipo_matricula: formData.tipo_matricula,
            p_Tipo_transaccion: formData.Tipo_transaccion,
            p_Monto: parseFloat(formData.Monto),
            p_Descripcion_caja: formData.Descripcion_caja,
            p_Cod_concepto: Number(formData.Cod_concepto),
            p_Codificacion_matricula: formData.Codificacion_matricula,
            p_fecha_matricula: formData.fecha_matricula,
        };
    
        try {
            const response = await fetch('http://localhost:4000/api/matricula/crearMatricula', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error HTTP: ${response.status}, Mensaje: ${errorData.message || 'Error desconocido'}`);
            }
    
            // Alerta de éxito
            Swal.fire({
                title: 'Éxito!',
                text: 'Matrícula creada exitosamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
    
            // Reiniciar el formulario
            setFormData({
                Cod_genealogia: '',
                tipo_estado: '',
                Fecha_inicio: '',
                Fecha_fin: '',
                anio_academico: '',
                tipo_matricula: '',
                Tipo_transaccion: '',
                Monto: '',
                Descripcion_caja: '',
                Cod_concepto: '',
                Codificacion_matricula: '',
                fecha_matricula: ''
            });
            setShowModalAgregar(false);
            obtenerMatriculas();
        } catch (error) {
            console.error('Error al crear la matrícula:', error);
            
            // Alerta de error
            Swal.fire({
                title: 'Error!',
                text: 'Hubo un problema al crear la matrícula.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
    
            setError('Hubo un problema al crear la matrícula.');
        }
    };

    const mostrarDetalles = (matricula) => {
        setMatriculaSeleccionada(matricula);
        setShowModalDetalles(true);
    };

    // Función para gestionar el descuento
    const gestionarDescuento = (cod_matricula) => {
        setDescuentoData((prev) => ({ ...prev, cod_matricula })); // Asigna el código de matrícula al descuento
        setShowModalDescuento(true); // Abre el modal de descuento
    };

    // Función para agregar un descuento
    const agregarDescuento = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:4000/api/matricula/descuentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(descuentoData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error HTTP: ${response.status}, Mensaje: ${errorData.message || 'Error desconocido'}`);
            }

            // Alerta de éxito
            Swal.fire({
                title: 'Éxito!',
                text: 'Descuento agregado exitosamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });

            // Reiniciar el formulario de descuento
            setDescuentoData({
                nombre_descuento: '',
                valor: '',
                fecha_inicio: '',
                fecha_fin: '',
                descripcion: '',
                cod_matricula: null,
            });

            setShowModalDescuento(false);
            obtenerMatriculas(); // Vuelve a obtener matrículas para reflejar el nuevo descuento
        } catch (error) {
            console.error('Error al agregar el descuento:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Hubo un problema al agregar el descuento.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const eliminarMatricula = async (Cod_matricula) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'Cancelar'
        });
    
        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:4000/api/matricula/matriculas/${Cod_matricula}`, {
                    method: 'DELETE',
                });
    
                if (response.ok) {
                    const data = await response.json(); // Asegúrate de leer la respuesta
                    console.log('Respuesta del servidor:', data);
                    
                    // Actualiza el estado local para reflejar la eliminación
                    setMatriculas(prevMatriculas => prevMatriculas.filter(matricula => matricula.Cod_matricula !== Cod_matricula));
    
                    Swal.fire('Eliminado!', 'La matrícula ha sido eliminada.', 'success');
                } else {
                    const errorData = await response.json();
                    Swal.fire('Error!', `Hubo un problema al eliminar la matrícula: ${errorData.message || 'Error desconocido'}`, 'error');
                }
            } catch (error) {
                console.error('Error al eliminar la matrícula:', error);
                Swal.fire('Error!', 'Hubo un problema al eliminar la matrícula.', 'error');
            }
        }
    };

    useEffect(() => {
        obtenerMatriculas();
    }, []);

    return (
<div className="container mt-4">
    <h1 className="mb-4">Matrículas</h1>
    <button className="btn btn-success btn-sm me-1" onClick={() => setShowModalAgregar(true)}>Agregar Matrícula</button>
    {matriculas.length > 0 ? (
        <table className="table table-striped table-hover">
            <thead className="table-dark">
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Código Inscripción</th>
                    <th scope="col">Año Académico</th>
                    <th scope="col">Monto</th>
                    <th scope="col">Tipo de Matrícula</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {matriculas.map((matricula, index) => (
                    <tr key={matricula.Cod_matricula}>
                        <th scope="row">{index + 1}</th>
                        <td>{matricula.Codificacion_matricula}</td>
                        <td>{matricula.anio_academico}</td>
                        <td>L.{matricula.Monto}</td> {/* L. antes del monto */}
                        <td>{matricula.tipo_matricula}</td>
                        <td>
                            {matricula.tipo_estado === 'Activa' ? (
                                <span className="badge bg-success">&#10003; Activa</span>
                            ) : matricula.tipo_estado === 'Pendiente' ? (
                                <span className="badge bg-warning">&#9888; Pendiente</span>
                            ) : matricula.tipo_estado === 'Cancelada' ? (
                                <span className="badge bg-secondary">&#10006; Cancelada</span>
                            ) : matricula.tipo_estado === 'Inactiva' ? (
                                <span className="bi bi-pause-circle">&#10006; Inactiva</span>
                            ) : null}
                        </td>
                        <td>
                            <button className="btn btn-success btn-sm me-1" onClick={() => mostrarDetalles(matricula)}>
                                <i className="fas fa-eye me-1"></i> 
                            </button>
                            <button className="btn btn-warning btn-sm me-1" onClick={() => editarMatricula(matricula.Cod_matricula)}>
                                <i className="fas fa-edit me-1"></i> 
                            </button>
                            <button className="btn btn-light btn-sm me-1" onClick={() => eliminarMatricula(matricula.Cod_matricula)}>
                                <i className="fas fa-trash-alt me-1"></i> 
                            </button>
                            <button className="btn btn-info btn-sm me-1" onClick={() => gestionarDescuento(matricula.Cod_matricula)}>
                                <i className="fas fa-dollar-sign me-1"></i> 
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    ) : (
        <div className="alert alert-warning" role="alert">No hay matrículas disponibles.</div>
    )}
{showModalAgregar && (
    <div className="modal show" style={{ display: 'block' }} aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px', margin: 'auto' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Agregar Matrícula</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModalAgregar(false)}></button>
                </div>
                <div className="modal-body" style={{ overflowX: 'hidden' }}>
                    <div style={{ display: 'flex', transform: `translateX(-${currentPage * 100}%)`, transition: 'transform 0.5s' }}>
                        {/* Información de Persona */}
                        <div style={{ minWidth: '100%', padding: '20px' }}>
                            <fieldset>
                                <legend>Información de Persona</legend>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Código Genealogía</label>
                                    <div className="col-sm-8">
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.p_Cod_genealogia} 
                                            onChange={(e) => setFormData({ ...formData, Cod_genealogia: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        {/* Información de Matrícula */}
                        <div style={{ minWidth: '100%', padding: '20px' }}>
                            <fieldset>
                                <legend>Información de Matrícula</legend>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Tipo Estado</label>
                                    <div className="col-sm-8">
                                        <select 
                                            className="form-select" 
                                            value={formData.tipo_estado} 
                                            onChange={(e) => setFormData({ ...formData, tipo_estado: e.target.value })} 
                                            required
                                        >
                                            <option value="">Selecciona el estado</option>
                                            <option value="Activa">Activa</option>
                                            <option value="Cancelada">Cancelada</option>
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Inactiva">Inactiva</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Fecha Matrícula</label>
                                    <div className="col-sm-8">
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={formData.fecha_matricula} 
                                            onChange={(e) => setFormData({ ...formData, fecha_matricula: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Año Académico</label>
                                    <div className="col-sm-8">
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.anio_academico} 
                                            onChange={(e) => setFormData({ ...formData, anio_academico: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Tipo Matrícula</label>
                                    <div className="col-sm-8">
                                        <select 
                                            className="form-select" 
                                            value={formData.tipo_matricula} 
                                            onChange={(e) => setFormData({ ...formData, tipo_matricula: e.target.value })} 
                                            required
                                        >
                                            <option value="">Selecciona el tipo</option>
                                            <option value="Estandar">Estandar</option>
                                            <option value="Extraordinaria">Extraordinaria</option>
                                            <option value="Beca">Beca</option>
                                            <option value="Otras">Otras</option>
                                        </select>
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        {/* Información Financiera */}
                        <div style={{ minWidth: '100%', padding: '20px' }}>
                            <fieldset>
                                <legend>Información Financiera</legend>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Tipo Transacción</label>
                                    <div className="col-sm-8">
                                        <select 
                                            className="form-select" 
                                            value={formData.Tipo_transaccion} 
                                            onChange={(e) => setFormData({ ...formData, Tipo_transaccion: e.target.value })} 
                                            required
                                        >
                                            <option value="">Selecciona el tipo</option>
                                            <option value="Ingreso">Ingreso</option>
                                            <option value="Egreso">Egreso</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Monto</label>
                                    <div className="col-sm-8">
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.Monto} 
                                            onChange={(e) => setFormData({ ...formData, Monto: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Descripción Caja</label>
                                    <div className="col-sm-8">
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.Descripcion_caja} 
                                            onChange={(e) => setFormData({ ...formData, Descripcion_caja: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Código Concepto</label>
                                    <div className="col-sm-8">
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.Cod_concepto} 
                                            onChange={(e) => setFormData({ ...formData, Cod_concepto: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </div>

                        {/* Información Adicional */}
                        <div style={{ minWidth: '100%', padding: '20px' }}>
                            <fieldset>
                                <legend>Información Adicional</legend>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Código Inscripción</label>
                                    <div className="col-sm-8">
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.Codificacion_matricula} 
                                            onChange={(e) => setFormData({ ...formData, Codificacion_matricula: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Fecha Inicio</label>
                                    <div className="col-sm-8">
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={formData.Fecha_inicio} 
                                            onChange={(e) => setFormData({ ...formData, Fecha_inicio: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-4 col-form-label">Fecha Fin</label>
                                    <div className="col-sm-8">
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            value={formData.Fecha_fin} 
                                            onChange={(e) => setFormData({ ...formData, Fecha_fin: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={handlePrev} disabled={currentPage === 0}>Anterior</button>
                    <button className="btn btn-primary" onClick={handleNext} disabled={currentPage === totalPages - 1}>Siguiente</button>
                    <button type="submit" className="btn btn-success" onClick={agregarMatricula}>Guardar</button>
                </div>
            </div>
        </div>
    </div>
)}

            {/* Modal para mostrar detalles de la matrícula */}
            {showModalDetalles && matriculaSeleccionada && (
    <div className="modal show" style={{ display: 'block' }} aria-modal="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Detalles de Matrícula</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModalDetalles(false)}></button>
                </div>
                <div className="modal-body">
                    <div className="card mb-3">
                        <div className="card-header">Información General</div>
                        <div className="card-body">
                            <p><strong>Código Matrícula:</strong> {matriculaSeleccionada.Cod_matricula}</p>
                            <p><strong>Código Inscripción:</strong> {matriculaSeleccionada.Codificacion_matricula}</p>
                            <p><strong>Año Académico:</strong> {matriculaSeleccionada.anio_academico}</p>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-header">Detalles Financieros</div>
                        <div className="card-body">
                            <p><strong>Monto:</strong> {matriculaSeleccionada.Monto}</p>
                            <p><strong>Tipo de Matrícula:</strong> {matriculaSeleccionada.tipo_matricula}</p>
                            <p><strong>Tipo de Estado:</strong> {matriculaSeleccionada.tipo_estado}</p>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-header">Fechas Importantes</div>
                        <div className="card-body">
                            <p><strong>Fecha Inicio:</strong> {matriculaSeleccionada.Fecha_inicio}</p>
                            <p><strong>Fecha Fin:</strong> {matriculaSeleccionada.Fecha_fin}</p>
                            <p><strong>Fecha Matrícula:</strong> {matriculaSeleccionada.fecha_matricula}</p>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-header">Detalles de Transacción</div>
                        <div className="card-body">
                            <p><strong>Tipo Transacción:</strong> {matriculaSeleccionada.Tipo_transaccion}</p>
                            <p><strong>Descripción Caja:</strong> {matriculaSeleccionada.descripcion_caja}</p>
                            <p><strong>Código Concepto:</strong> {matriculaSeleccionada.Cod_concepto}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)}
{/* Modal para agregar descuento */}
{showModalDescuento && (
    <div className="modal show" style={{ display: 'block' }} aria-modal="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Agregar Descuento</h5>
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowModalDescuento(false)}
                    ></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={agregarDescuento}>
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Nombre del Descuento</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={descuentoData.nombre_descuento}
                                        onChange={(e) => setDescuentoData({ ...descuentoData, nombre_descuento: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Valor</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={descuentoData.valor}
                                        onChange={(e) => setDescuentoData({ ...descuentoData, valor: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="row mb-3">
                                    <div className="col">
                                        <label className="form-label">Fecha de Inicio</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={descuentoData.fecha_inicio}
                                            onChange={(e) => setDescuentoData({ ...descuentoData, fecha_inicio: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col">
                                        <label className="form-label">Fecha de Fin</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={descuentoData.fecha_fin}
                                            onChange={(e) => setDescuentoData({ ...descuentoData, fecha_fin: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        value={descuentoData.descripcion}
                                        onChange={(e) => setDescuentoData({ ...descuentoData, descripcion: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between">
                            <button type="submit" className="btn btn-primary">Agregar Descuento</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModalDescuento(false)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </div>
        )}

        </div>
    );
};
export default MatriculaList;
