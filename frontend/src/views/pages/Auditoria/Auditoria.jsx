import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CFormSelect,
  CButton,
  CSpinner
} from '@coreui/react';
import { Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png';

const ReporteActividades = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    usuario: '',
    accion: '',
    objeto: ''
  });
  const [usuarios, setUsuarios] = useState([]);
  const [objetos, setObjetos] = useState([]);

  useEffect(() => {
    cargarDatos();
    cargarUsuarios();
    cargarObjetos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get('http://localhost:4000/api/bitacora/reporte', config);
      setActividades(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const cargarObjetos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/bitacora/objetos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setObjetos(response.data);
    } catch (error) {
      console.error('Error al cargar objetos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filtrarActividades = () => {
    return actividades.filter(actividad => {
      const fecha = new Date(actividad.Fecha).toISOString().split('T')[0];
      const cumpleFechaInicio = !filtros.fechaInicio || fecha >= filtros.fechaInicio;
      const cumpleFechaFin = !filtros.fechaFin || fecha <= filtros.fechaFin;
      const cumpleUsuario = !filtros.usuario || actividad.Cod_usuario.toString() === filtros.usuario;
      const cumpleAccion = !filtros.accion || actividad.Accion === filtros.accion;
      const cumpleObjeto = !filtros.objeto || actividad.Cod_objeto.toString() === filtros.objeto;

      return cumpleFechaInicio && cumpleFechaFin && cumpleUsuario && cumpleAccion && cumpleObjeto;
    });
  };

  const exportarExcel = () => {
    const actividadesFiltradas = filtrarActividades();
    const worksheet = XLSX.utils.json_to_sheet(actividadesFiltradas.map(a => ({
      'Fecha': new Date(a.Fecha).toLocaleString(),
      'Usuario': a.NombreUsuario,
      'Acción': a.Accion,
      'Objeto': a.NombreObjeto,
      'Descripción': a.Descripcion
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Actividades");
    XLSX.writeFile(workbook, "Reporte_Actividades.xlsx");
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const img = new Image();
    img.src = logo;
    
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Función para marca de agua
      const addWatermark = () => {
        const fontSize = 50;
        const text = 'CONFIDENCIAL';
        
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.15 }));
        doc.setTextColor(220, 53, 69);
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'bold')

        for (let i = 0; i < pageHeight; i += fontSize * 2) {
          for (let j = 0; j < pageWidth; j += fontSize * 4) {
            doc.text(text, j, i, {
              angle: -45,
              renderingMode: 'fill'
            });
          }
        }
        
        doc.restoreGraphicsState();
      }

      // Header con logo y diseño profesional
      doc.addImage(img, 'PNG', 10, 5, 25, 25);
      
      doc.setTextColor(22, 160, 133);
      doc.setFontSize(22);
      doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(18);
      doc.text('REPORTE DE ACTIVIDADES DEL SISTEMA', pageWidth / 2, 25, { align: 'center' });
      
      // Información de contacto
      doc.setFontSize(10);
      doc.setTextColor(68, 68, 68);
      doc.text([
        'Casa Club del periodista, Colonia del Periodista',
        'Teléfono: (504) 2234-8871',
        'Correo: info@saintpatrickacademy.edu'
      ], pageWidth / 2, 33, { align: 'center', lineHeightFactor: 1.5 });

      // Añadir marca de agua
      addWatermark();

      // Preparar filtros aplicados
      const filtrosAplicados = [];
      if (filtros.fechaInicio) filtrosAplicados.push(`Fecha Inicio: ${filtros.fechaInicio}`);
      if (filtros.fechaFin) filtrosAplicados.push(`Fecha Fin: ${filtros.fechaFin}`);
      if (filtros.usuario) {
        const usuarioNombre = usuarios.find(u => u.cod_usuario.toString() === filtros.usuario)?.Nombre_usuario;
        if (usuarioNombre) filtrosAplicados.push(`Usuario: ${usuarioNombre}`);
      }
      if (filtros.accion) filtrosAplicados.push(`Acción: ${filtros.accion}`);
      if (filtros.objeto) {
        const objetoNombre = objetos.find(o => o.Cod_objeto.toString() === filtros.objeto)?.Nom_objeto;
        if (objetoNombre) filtrosAplicados.push(`Objeto: ${objetoNombre}`);
      }

      // Preparar datos para la tabla
      const actividadesFiltradas = filtrarActividades();
      
      // Configuración de la tabla
      doc.autoTable({
        startY: 50,
        head: [['#', 'Fecha y Hora', 'Usuario', 'Acción', 'Objeto', 'Descripción']],
        body: actividadesFiltradas.map((actividad, index) => [
          index + 1,
          new Date(actividad.Fecha).toLocaleString(),
          actividad.NombreUsuario,
          actividad.Accion,
          actividad.NombreObjeto,
          actividad.Descripcion
        ]),
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255]
        },
        margin: { top: 15 },
        didDrawPage: function(data) {
          addWatermark();
          // Pie de página
          doc.setFontSize(8);
          doc.setTextColor(128);
          const date = new Date().toLocaleDateString('es-HN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          doc.text(`Generado el: ${date}`, 15, pageHeight - 10);
          doc.text(`Página ${data.pageCount}`, pageWidth - 20, pageHeight - 10);
          
          // Agregar filtros aplicados en el pie de página
          if (filtrosAplicados.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(68, 68, 68);
            doc.text('Filtros aplicados: ' + filtrosAplicados.join(' | '), pageWidth / 2, pageHeight - 10, { align: 'center' });
          }
        }
      });

      doc.save('Reporte_Actividades.pdf');
    };

    img.onerror = () => {
      console.error('No se pudo cargar el logo');
    };
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <h2 className="mb-0">Centro de Actividades</h2>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-4">
            <CCol md={3}>
              <div className="mb-3">
                <label className="form-label">Fecha Inicio</label>
                <CFormInput
                  type="date"
                  name="fechaInicio"
                  value={filtros.fechaInicio}
                  onChange={handleInputChange}
                />
              </div>
            </CCol>
            <CCol md={3}>
              <div className="mb-3">
                <label className="form-label">Fecha Fin</label>
                <CFormInput
                  type="date"
                  name="fechaFin"
                  value={filtros.fechaFin}
                  onChange={handleInputChange}
                />
              </div>
            </CCol>
            <CCol md={2}>
              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <CFormSelect
                  name="usuario"
                  value={filtros.usuario}
                  onChange={handleInputChange}
                >
                  <option value="">Todos</option>
                  {usuarios.map(usuario => (
                    <option key={usuario.cod_usuario} value={usuario.cod_usuario}>
                      {usuario.Nombre_usuario}
                    </option>
                  ))}
                </CFormSelect>
              </div>
            </CCol>
            <CCol md={2}>
              <div className="mb-3">
                <label className="form-label">Acción</label>
                <CFormSelect
                  name="accion"
                  value={filtros.accion}
                  onChange={handleInputChange}
                >
                  <option value="">Todas</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="INSERT">Insert</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                </CFormSelect>
              </div>
            </CCol>
            <CCol md={2}>
              <div className="mb-3">
                <label className="form-label">Objeto</label>
                <CFormSelect
                  name="objeto"
                  value={filtros.objeto}
                  onChange={handleInputChange}
                >
                  <option value="">Todos</option>
                  {objetos.map(objeto => (
                    <option key={objeto.Cod_objeto} value={objeto.Cod_objeto}>
                      {objeto.Nom_objeto}
                    </option>
                  ))}
                </CFormSelect>
              </div>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol className="d-flex justify-content-end gap-2">
              <CButton 
                color="primary" 
                onClick={generatePDF}
                className="d-flex align-items-center gap-2"
              >
                <FileText size={20} />
                Exportar a PDF
              </CButton>
              <CButton 
                color="success" 
                onClick={exportarExcel}
                className="d-flex align-items-center gap-2"
              >
                <Download size={20} />
                Exportar a Excel
              </CButton>
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center">
              <CSpinner color="primary" />
            </div>
          ) : (
            <CTable bordered hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Fecha</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Usuario</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Acción</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Objeto</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Descripción</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
  {filtrarActividades().map((actividad, index) => (
    <CTableRow key={index}>
      <CTableDataCell>
        {new Date(actividad.Fecha).toLocaleString()}
      </CTableDataCell>
      <CTableDataCell>
        {actividad.NombreUsuario}
      </CTableDataCell>
      <CTableDataCell>{actividad.Accion}</CTableDataCell>
      <CTableDataCell>
        {actividad.NombreObjeto}
      </CTableDataCell>
      <CTableDataCell>{actividad.Descripcion}</CTableDataCell>
    </CTableRow>
  ))}
</CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default ReporteActividades;