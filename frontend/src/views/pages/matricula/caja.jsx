import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  CContainer,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CCol,
  CFormSelect,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilDollar, cilDescription, cilTags, cilWallet, cilFile } from '@coreui/icons';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from 'src/assets/brand/logo_saint_patrick.png';



const MySwal = withReactContent(Swal);

const CajasMatriculas = () => {
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalNuevaCajaVisible, setModalNuevaCajaVisible] = useState(false);
  const [valorMatricula, setValorMatricula] = useState(null); // Estado para almacenar el valor
  const [pagoActual, setPagoActual] = useState({
    cod_caja: '',
    monto: '',
    descripcion: '',
    cod_concepto: '',
    aplicar_descuento: false,
    valor_descuento: '',
    descripcion_descuento: '',
  });
  const [nuevaCaja, setNuevaCaja] = useState({
    descripcion: '',
    monto: '',
    cod_concepto: '',
    dni_padre: '',
  });
  const [conceptos, setConceptos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [dineroRecibido, setDineroRecibido] = useState('');
  const [errors, setErrors] = useState({}); // Para manejar mensajes de error
const [vuelto, setVuelto] = useState(0);

// Reiniciar el modal de "Registrar Pago"
const resetRegistrarPagoModal = () => {
  setPagoActual({
    cod_caja: '',
    monto: '',
    descripcion: '',
    cod_concepto: '',
    aplicar_descuento: false,
    valor_descuento: '',
    descripcion_descuento: '',
  });
  setDineroRecibido('');
  setVuelto(0);
};

// Reiniciar el modal de "Crear Nueva Caja"
const resetNuevaCajaModal = () => {
  setNuevaCaja({
    descripcion: '',
    monto: '',
    cod_concepto: '',
    dni_padre: '',
  });
};

// Validar inputs dinámicamente
const validateInput = (name, value) => {
  let errorMessage = '';

  // Validar máximo de 25 caracteres
  if (value.length > 25) {
    errorMessage = 'No puede exceder los 25 caracteres.';
  }

  // Validar tres letras iguales consecutivas
  if (/([a-zA-Z])\1\1/.test(value)) {
    errorMessage = 'No se permiten tres letras iguales consecutivas.';
  }

  // Actualizar errores
  setErrors((prev) => ({
    ...prev,
    [name]: errorMessage,
  }));

  return errorMessage === ''; // Devuelve true si no hay errores
};

// Manejar cambios en inputs
const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (validateInput(name, value)) {
    // Si no hay errores, actualizar el estado correspondiente
    if (modalVisible) {
      setPagoActual((prev) => ({ ...prev, [name]: value }));
    } else if (modalNuevaCajaVisible) {
      setNuevaCaja((prev) => ({ ...prev, [name]: value }));
    }
  }
};

// Bloquear copiar y pegar
const preventCopyPaste = (e) => {
  e.preventDefault();
};
  // Obtener datos iniciales
  useEffect(() => {
    obtenerCajasPendientes();
    cargarConceptos();
  }, []);

  const obtenerCajasPendientes = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/caja/todas-pendientes');
      if (response.status === 200) {
        setPagosPendientes(
          response.data.data.sort((a, b) => new Date(b.Fecha_pago) - new Date(a.Fecha_pago))
        );
      } else {
        MySwal.fire({
          icon: 'warning',
          title: 'Atención',
          text: response.data.message || 'No se encontraron cajas pendientes.',
        });
      }
    } catch (error) {
      console.error('Error al obtener las cajas pendientes:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al conectar con el servidor.',
      });
    }
  };
  
  const cargarConceptos = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/caja/conceptos');
      setConceptos(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener conceptos:', error);
    }
  };

  const registrarPago = async (e) => {
    e.preventDefault();
  
    try {
      // Validar campos obligatorios
      if (!pagoActual.descripcion || !pagoActual.descripcion.trim()) {
        MySwal.fire({
          icon: 'warning',
          title: 'Campo obligatorio',
          text: 'La descripción no puede estar vacía.',
          confirmButtonText: 'Entendido',
        });
        return;
      }
  
      const monto = parseFloat(pagoActual.monto || valorMatricula || 0);
  
      if (!monto || isNaN(monto) || monto <= 0) {
        MySwal.fire({
          icon: 'warning',
          title: 'Monto inválido',
          text: 'El monto debe ser un número mayor a 0.',
          confirmButtonText: 'Entendido',
        });
        return;
      }
  
      // Asegurar que el concepto "Matricula" esté cargado antes de continuar
      if (!pagoActual.cod_concepto) {
        try {
          const response = await axios.get('http://localhost:4000/api/caja/concepto/matricula');
          if (response.status === 200 && response.data.cod_concepto) {
            // Establecer el concepto "Matricula" en el estado
            pagoActual.cod_concepto = response.data.cod_concepto;
          } else {
            MySwal.fire({
              icon: 'error',
              title: 'Error al obtener concepto',
              text: 'No se pudo obtener el código del concepto "Matricula".',
              confirmButtonText: 'Revisar',
            });
            return;
          }
        } catch (error) {
          console.error('Error al obtener el concepto "Matricula":', error);
          MySwal.fire({
            icon: 'error',
            title: 'Error inesperado',
            text: 'Hubo un problema al obtener el código del concepto.',
            confirmButtonText: 'Entendido',
          });
          return;
        }
      }
  
      // Validaciones adicionales
      if (pagoActual.descripcion.length > 25) {
        MySwal.fire({
          icon: 'warning',
          title: 'Descripción inválida',
          text: 'La descripción no puede exceder los 25 caracteres.',
          confirmButtonText: 'Entendido',
        });
        return;
      }
  
      if (/[^A-Z0-9 ]/.test(pagoActual.descripcion)) {
        MySwal.fire({
          icon: 'warning',
          title: 'Descripción inválida',
          text: 'La descripción solo puede contener letras, números y espacios.',
          confirmButtonText: 'Entendido',
        });
        return;
      }
  
      if (pagoActual.aplicar_descuento && (isNaN(pagoActual.valor_descuento) || parseFloat(pagoActual.valor_descuento) <= 0)) {
        MySwal.fire({
          icon: 'warning',
          title: 'Descuento inválido',
          text: 'El valor del descuento debe ser un número válido mayor a 0.',
          confirmButtonText: 'Entendido',
        });
        return;
      }
  
      if (pagoActual.aplicar_descuento && parseFloat(pagoActual.valor_descuento) > monto) {
        MySwal.fire({
          icon: 'warning',
          title: 'Descuento inválido',
          text: 'El valor del descuento no puede ser mayor al monto.',
          confirmButtonText: 'Entendido',
        });
        return;
      }
  
      if (pagoActual.descripcion_descuento && pagoActual.descripcion_descuento.length > 25) {
        MySwal.fire({
          icon: 'warning',
          title: 'Descripción de descuento inválida',
          text: 'La descripción del descuento no puede exceder los 25 caracteres.',
          confirmButtonText: 'Entendido',
        });
        return;
      }
  
      if (pagoActual.descripcion_descuento && /[^A-Z0-9 ]/.test(pagoActual.descripcion_descuento)) {
        MySwal.fire({
          icon: 'warning',
          title: 'Descripción de descuento inválida',
          text: 'La descripción del descuento solo puede contener letras, números y espacios.',
          confirmButtonText: 'Entendido',
        });
        return;
      }
  
      // Preparar los datos para el envío
      const datosPago = {
        ...pagoActual,
        monto, // Asegura que el monto siempre tenga el valor correcto
        aplicar_descuento: pagoActual.aplicar_descuento || false,
        valor_descuento: pagoActual.aplicar_descuento
          ? parseFloat(pagoActual.valor_descuento)
          : null,
        descripcion_descuento: pagoActual.aplicar_descuento
          ? pagoActual.descripcion_descuento
          : null,
      };
  
      console.log('Datos enviados al servidor:', datosPago); // Depuración
  
      // Enviar los datos al servidor
      const response = await axios.post('http://localhost:4000/api/caja/pago', datosPago);
  
      if (response.status === 201 || response.status === 200) {
        MySwal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'El pago se ha registrado correctamente.',
          confirmButtonText: 'Aceptar',
        });
        setModalVisible(false); // Cerrar el modal
        obtenerCajasPendientes(); // Actualizar la lista de cajas
      }
    } catch (error) {
      console.error('Error al registrar el pago:', error);
  
      // Mostrar error específico si existe en la respuesta del servidor
      if (error.response && error.response.data && error.response.data.message) {
        MySwal.fire({
          icon: 'error',
          title: 'Error al registrar el pago',
          text: error.response.data.message,
          confirmButtonText: 'Revisar',
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error inesperado',
          text: 'Hubo un problema al procesar la solicitud. Por favor, intenta nuevamente más tarde.',
          confirmButtonText: 'Entendido',
        });
      }
    }
  };
  
  useEffect(() => {
    const fetchConceptoMatricula = async () => {
      try {
        const response = await axios.get(
          'http://localhost:4000/api/caja/concepto/matricula'
        );
        if (response.status === 200) {
          setPagoActual((prevState) => ({
            ...prevState,
            cod_concepto: response.data.cod_concepto,
          }));
        }
      } catch (error) {
        console.error('Error al obtener el concepto "Matricula":', error);
      }
    };
  
    fetchConceptoMatricula();
  }, []);
    
  
  
  const crearNuevaCaja = async () => {
    console.log("Datos de la nueva caja:", nuevaCaja);
  
    // Validación de campos obligatorios
    if (!nuevaCaja.descripcion || !nuevaCaja.monto || !nuevaCaja.cod_concepto || !nuevaCaja.dni_padre) {
      console.log("Validación fallida");
      await MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos son obligatorios.',
      });
      return;
    }
  
    // Validación de formato del DNI (solo números y longitud específica)
    const dniRegex = /^[0-9]{13}$/; // Asume que el DNI de Honduras tiene 13 dígitos
    if (!dniRegex.test(nuevaCaja.dni_padre)) {
      await MySwal.fire({
        icon: 'error',
        title: 'Error en el DNI',
        text: 'El DNI debe tener 13 dígitos y contener solo números.',
      });
      return;
    }
  
    // Validación de descripción
    if (nuevaCaja.descripcion.length > 25) {
      await MySwal.fire({
        icon: 'error',
        title: 'Error en la descripción',
        text: 'La descripción no puede exceder los 25 caracteres.',
      });
      return;
    }
  
    if (/([A-Z])\1\1/.test(nuevaCaja.descripcion)) {
      await MySwal.fire({
        icon: 'error',
        title: 'Error en la descripción',
        text: 'La descripción no puede contener tres letras iguales consecutivas.',
      });
      return;
    }
  
    if (/[^a-zA-Z0-9 ]/.test(nuevaCaja.descripcion)) {
      await MySwal.fire({
        icon: 'error',
        title: 'Error en la descripción',
        text: 'La descripción no puede contener símbolos o caracteres especiales.',
      });
      return;
    }
  
    // Validación de descuento (si aplica)
    if (nuevaCaja.aplicar_descuento) {
      if (nuevaCaja.valor_descuento > nuevaCaja.monto) {
        await MySwal.fire({
          icon: 'error',
          title: 'Error en el descuento',
          text: 'El valor del descuento no puede ser mayor al monto total.',
        });
        return;
      }
  
      if (nuevaCaja.descripcion_descuento && nuevaCaja.descripcion_descuento.length > 25) {
        await MySwal.fire({
          icon: 'error',
          title: 'Error en la descripción del descuento',
          text: 'La descripción del descuento no puede exceder los 25 caracteres.',
        });
        return;
      }
  
      if (/([A-Z])\1\1/.test(nuevaCaja.descripcion_descuento)) {
        await MySwal.fire({
          icon: 'error',
          title: 'Error en la descripción del descuento',
          text: 'La descripción del descuento no puede contener tres letras iguales consecutivas.',
        });
        return;
      }
  
      if (/[^a-zA-Z0-9 ]/.test(nuevaCaja.descripcion_descuento)) {
        await MySwal.fire({
          icon: 'error',
          title: 'Error en la descripción del descuento',
          text: 'La descripción del descuento no puede contener símbolos o caracteres especiales.',
        });
        return;
      }
    }
  
    try {
      // Preparar los datos para enviar al servidor, incluyendo los datos de descuento opcionales
      const datosCaja = {
        descripcion: nuevaCaja.descripcion,
        monto: parseFloat(nuevaCaja.monto),
        cod_concepto: nuevaCaja.cod_concepto,
        dni_padre: nuevaCaja.dni_padre,
        estado_pago: 'Pendiente',
        aplicar_descuento: nuevaCaja.aplicar_descuento || false,
        valor_descuento: nuevaCaja.aplicar_descuento ? parseFloat(nuevaCaja.valor_descuento) : null,
        descripcion_descuento: nuevaCaja.aplicar_descuento ? nuevaCaja.descripcion_descuento : null,
      };
  
      console.log("Datos enviados al servidor:", datosCaja);
  
      // Realizar la solicitud al servidor
      const response = await axios.post('http://localhost:4000/api/caja/oficial', datosCaja);
  
      // Manejo de la respuesta
      if (response.status === 201 || response.status === 200) {
        console.log("Caja creada exitosamente");
  
        // Mostrar la alerta de éxito
        await MySwal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'La nueva caja se ha creado exitosamente.',
        });
  
        // Reiniciar el modal y recargar datos
        resetNuevaCajaModal();
        setModalNuevaCajaVisible(false);
        obtenerCajasPendientes();
      } else {
        console.log("Error en el servidor:", response);
  
        // Manejo de error cuando el servidor no responde con 201 o 200
        await MySwal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'No se pudo crear la caja. Intente de nuevo.',
        });
      }
    } catch (error) {
      console.error("Error al crear la caja:", error);
  
      // Manejo de errores generales
      await MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al conectar con el servidor.',
      });
    }
  };

  const paginatedData = pagosPendientes
    .filter((pago) =>
      `${pago.Nombre_Padre} ${pago.Apellido_Padre}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(pagosPendientes.length / itemsPerPage);
  const handleDineroRecibido = (valor) => {
    const recibido = parseFloat(valor) || 0;
    setDineroRecibido(recibido);
  
    const montoBase = parseFloat(nuevaCaja.monto || 0);
    const descuento = nuevaCaja.aplicar_descuento
      ? parseFloat(nuevaCaja.valor_descuento || 0)
      : 0;
  
    const montoConDescuento = montoBase - descuento;
    const calculadoVuelto = recibido - montoConDescuento;
  
    setVuelto(calculadoVuelto > 0 ? calculadoVuelto : 0);
  };
  
  const exportToPDF = (allData) => {
    if (!Array.isArray(allData) || allData.length === 0) {
      Swal.fire('Error', 'No hay datos para generar el reporte.', 'error');
      return;
    }
  
    const doc = new jsPDF();
  
    // Configurar la imagen del logo
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
      // Configuración del encabezado
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text(
        "SAINT PATRICK'S ACADEMY",
        doc.internal.pageSize.width / 2,
        20,
        { align: 'center' }
      );
      doc.setFontSize(14);
      doc.text(
        'Reporte General de Cajas (Todos los registros)',
        doc.internal.pageSize.width / 2,
        30,
        { align: 'center' }
      );
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        'Casa Club del periodista, Colonia del Periodista',
        doc.internal.pageSize.width / 2,
        40,
        { align: 'center' }
      );
      doc.text(
        'Teléfono: (504) 2234-8871',
        doc.internal.pageSize.width / 2,
        45,
        { align: 'center' }
      );
      doc.text(
        'Correo: info@saintpatrickacademy.edu',
        doc.internal.pageSize.width / 2,
        50,
        { align: 'center' }
      );
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102);
      doc.text(
        'Detalles de Cajas (Todos los Registros)',
        doc.internal.pageSize.width / 2,
        65,
        { align: 'center' }
      );
  
      // Añadir tabla con los datos
      doc.autoTable({
        startY: 75,
        head: [['#', 'Nombre Padre', 'Descripción', 'Monto', 'Estado', 'Fecha de Registro']],
        body: allData.map((caja, index) => [
          index + 1,
          `${caja.Nombre_Padre || 'N/A'} ${caja.Apellido_Padre || 'N/A'}`,
          caja.Descripcion || 'N/A',
          `L ${parseFloat(caja.Monto || 0).toFixed(2)}`,
          caja.Estado_pago || 'Pendiente',
          caja.Fecha_pago ? new Date(caja.Fecha_pago).toLocaleDateString() : 'N/A',
        ]),
        styles: {
          fontSize: 10,
          textColor: [34, 34, 34], // Gris oscuro para texto
          cellPadding: 4,
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [0, 102, 51], // Verde oscuro para encabezados
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] }, // Azul claro alternado para filas
        margin: { left: 10, right: 10 },
      });
  
      // Pie de página
      doc.setFontSize(10);
      doc.setTextColor(100);
      const date = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);
  
      // Generar el blob y abrir en una nueva pestaña
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
      window.open(pdfURL); // Abrir el archivo en una nueva pestaña
    };
  
    img.onerror = () => {
      Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
  };
  
  
  const generarReporteIndividual = (caja, dineroRecibido, vuelto) => {
    const doc = new jsPDF();
  
    // Configuración del logo
    const img = new Image();
    const defaultLogo = './src/assets/brand/logo_saint_patrick.png';
    img.src = logo || defaultLogo;
  
    img.onload = () => {
      try {
        // Encabezado
        doc.addImage(img, 'PNG', 10, 10, 30, 30);
        doc.setFontSize(18);
        doc.setTextColor(0, 102, 51);
        doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, {
          align: 'center',
        });
        doc.setFontSize(14);
        doc.text('Reporte Individual de Caja', doc.internal.pageSize.width / 2, 30, {
          align: 'center',
        });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          'Casa Club del periodista, Colonia del Periodista',
          doc.internal.pageSize.width / 2,
          40,
          { align: 'center' }
        );
        doc.text(
          'Teléfono: (504) 2234-8871',
          doc.internal.pageSize.width / 2,
          45,
          { align: 'center' }
        );
        doc.text(
          'Correo: info@saintpatrickacademy.edu',
          doc.internal.pageSize.width / 2,
          50,
          { align: 'center' }
        );
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 51);
        doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
        // Detalles individuales en tabla
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102);
        doc.text('Detalles de la Caja', doc.internal.pageSize.width / 2, 65, {
          align: 'center',
        });
  
        doc.autoTable({
          startY: 75,
          head: [['Campo', 'Valor']],
          body: [
            ['Nombre del Padre', `${caja.Nombre_Padre || 'N/A'} ${caja.Apellido_Padre || 'N/A'}`],
            ['Descripción', caja.Descripcion || 'N/A'],
            ['Monto', `L ${parseFloat(caja.Monto || 0).toFixed(2)}`],
            ['Estado de Pago', caja.Estado_pago || 'Pendiente'],
            [
              'Fecha de Registro',
              caja.Fecha_pago ? new Date(caja.Fecha_pago).toLocaleDateString() : 'N/A',
            ],
            [
              'Hora de Registro',
              caja.Hora_registro ? new Date(caja.Hora_registro).toLocaleTimeString() : 'N/A',
            ],
            
          ],
          styles: {
            fontSize: 10,
            textColor: [34, 34, 34],
            cellPadding: 4,
            valign: 'middle',
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [0, 102, 51], // Verde oscuro para encabezados
            textColor: [255, 255, 255],
            fontSize: 10,
          },
          alternateRowStyles: { fillColor: [240, 248, 255] }, // Azul claro alternado para filas
          margin: { left: 10, right: 10 },
        });
  
        // Pie de página
        doc.setFontSize(10);
        doc.setTextColor(100);
        const date = new Date().toLocaleDateString();
        doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);
  
        // Generar y abrir PDF
        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);
        window.open(pdfURL);
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        Swal.fire('Error', 'Hubo un problema al generar el PDF.', 'error');
      }
    };
  
    img.onerror = () => {
      Swal.fire(
        'Error',
        'No se pudo cargar el logo. Verifique la ruta o formato.',
        'error'
      );
    };
  };
  
   // Cargar valor de "Matricula"
   useEffect(() => {
    const cargarValorMatricula = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/caja/parametro/Matricula');
        if (response.status === 200) {
          setValorMatricula(response.data.valor);
        }
      } catch (error) {
        console.error('Error al obtener el valor de Matricula:', error);
      }
    };
    cargarValorMatricula();
  }, []);

  // Actualizar el monto con el valor de "Matricula"
  useEffect(() => {
    if (valorMatricula) {
      setPagoActual((prev) => ({
        ...prev,
        monto: valorMatricula, // Asigna el valor de Matricula al monto
      }));
    }
  }, [valorMatricula]);
  
  const calcularVuelto = (monto, descuento, recibido) => {
    const montoConDescuento = monto - descuento;
    return recibido - montoConDescuento;
  };
  
  
  return (
    <CContainer>
    <div className="text-center mb-4">
      <h4 style={{ color: '#4A4A4A', fontWeight: 'bold' }}>Cajas </h4>
    </div>
  
    {/* Botón de "Nueva Caja" alineado a la derecha */}
    <CRow className="justify-content-end mb-3">
  {/* Botón Nueva */}
  <CCol xs="auto">
    <CButton
      onClick={() => setModalNuevaCajaVisible(true)}
      style={{
        backgroundColor: '#4B6251', // Verde oscuro
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        fontWeight: 'bold',
      }}
    >
      <CIcon icon={cilPlus} className="me-1" />
      Nueva
    </CButton>
  </CCol>

 {/* Botón Reporte */}
<CCol xs="auto">
  <CButton
    onClick={() => {
      const filteredData = pagosPendientes.filter((pago) =>
        `${pago.Nombre_Padre} ${pago.Apellido_Padre}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) // Filtra según el término de búsqueda
      );
      exportToPDF(filteredData); // Exporta solo los datos filtrados
    }}
    style={{
      backgroundColor: '#6C8E58', // Verde oscuro
      color: 'white', // Texto en blanco
      border: 'none',
      borderRadius: '5px',
      padding: '0.5rem 1rem',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      cursor: 'pointer', // Cursor clickeable
    }}
    title="Exportar reporte filtrado según la búsqueda actual" // Tooltip
  >
    <CIcon icon={cilFile} className="me-1" />
    Exportar PDF
  </CButton>

  </CCol>
</CRow>
    {/* Búsqueda y Selector de Paginación */}
    <CRow className="justify-content-between align-items-center mb-3">
      <CCol xs={4} md={3}>
        <CFormInput
          placeholder="Buscar por nombre del padre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '0.9rem',
          }}
        />
      </CCol>
      <CCol xs="auto">
        <CFormSelect
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(parseInt(e.target.value));
            setCurrentPage(1); // Reiniciar a la primera página al cambiar la cantidad de elementos
          }}
          style={{
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '0.9rem',
            color: '#4A4A4A',
          }}
        >
          <option value={5}>Mostrar 5 registros</option>
          <option value={10}>Mostrar 10 registros</option>
          <option value={20}>Mostrar 20 registros</option>
        </CFormSelect>
      </CCol>
    </CRow>
  
    {/* Tabla de Datos */}
    <CTable hover bordered className="shadow-sm" style={{ borderRadius: '10px' }}>
  <CTableHead style={{ backgroundColor: '#0056b3', color: 'white' }}>
    <CTableRow>
      <CTableHeaderCell>Nombre del Padre</CTableHeaderCell>
      <CTableHeaderCell>Monto</CTableHeaderCell>
      <CTableHeaderCell>Descripción</CTableHeaderCell>
      <CTableHeaderCell>Hora</CTableHeaderCell>
      <CTableHeaderCell>Fecha</CTableHeaderCell>
      <CTableHeaderCell>Acciones</CTableHeaderCell>
    </CTableRow>
  </CTableHead>
  <CTableBody>
    {paginatedData.map((caja) => (
      <CTableRow key={caja.Cod_caja}>
        {/* Nombre del Padre */}
        <CTableDataCell>
          {`${caja.Nombre_Padre?.toUpperCase() || ''} ${caja.Apellido_Padre?.toUpperCase() || ''}`}
        </CTableDataCell>
        
        {/* Monto */}
        <CTableDataCell>
          {caja.Monto ? `L ${parseFloat(caja.Monto).toFixed(2)}` : 'PENDIENTE'}
        </CTableDataCell>
        
        {/* Descripción */}
        <CTableDataCell>{caja.Descripcion ? caja.Descripcion.toUpperCase() : 'SIN DESCRIPCIÓN'}</CTableDataCell>
        
        {/* Hora */}
        <CTableDataCell>
          {caja.Hora_registro
            ? new Date(caja.Hora_registro).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : 'SIN HORA'}
        </CTableDataCell>
        
        {/* Fecha */}
        <CTableDataCell>
          {caja.Fecha_pago
            ? new Date(caja.Fecha_pago).toLocaleDateString().toUpperCase()
            : 'SIN FECHA'}
        </CTableDataCell>
        
        {/* Acciones */}
        <CTableDataCell>
          {/* Mostrar botón "Registrar" solo si Monto es null */}
          {caja.Monto === null && (
            <CButton
              onClick={() => {
                setPagoActual({
                  cod_caja: caja.Cod_caja,
                  monto: '',
                  descripcion: '',
                  cod_concepto: '',
                  aplicar_descuento: false,
                  valor_descuento: '',
                  descripcion_descuento: '',
                });
                setModalVisible(true);
              }}
              style={{
                backgroundColor: '#4B6251', // Verde oscuro
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
              }}
            >
              <CIcon icon={cilWallet} className="me-1" />
              
            </CButton>
          )}

          {/* Botón para generar reporte individual */}
          <CButton
  onClick={() => generarReporteIndividual(caja, dineroRecibido, vuelto)}
  style={{
    backgroundColor: '#008080', // Cambia el color si es necesario
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    marginLeft: '5px',
  }}
>
  <CIcon icon={cilFile} className="me-1" />
  
</CButton>


        </CTableDataCell>
      </CTableRow>
    ))}
  </CTableBody>
</CTable>

    {/* Paginación */}
    <CRow className="justify-content-center align-items-center mt-3">
  <CCol xs="auto">
    <CButton
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => prev - 1)}
      style={{
        backgroundColor: currentPage === 1 ? '#d6d6d6' : '#7a7a7a', // Gris claro si está deshabilitado, gris oscuro si habilitado
        color: currentPage === 1 ? '#a0a0a0' : '#ffffff', // Texto claro si está deshabilitado
        border: 'none', // Sin borde
        cursor: currentPage === 1 ? 'not-allowed' : 'pointer', // Cursor no permitido si está deshabilitado
        padding: '0.5rem 1.5rem', // Tamaño uniforme del botón
      }}
    >
      Anterior
    </CButton>
    <CButton
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => prev + 1)}
      className="ms-2"
      style={{
        backgroundColor: currentPage === totalPages ? '#d6d6d6' : '#7a7a7a', // Gris claro si está deshabilitado, gris oscuro si habilitado
        color: currentPage === totalPages ? '#a0a0a0' : '#ffffff', // Texto claro si está deshabilitado
        border: 'none', // Sin borde
        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', // Cursor no permitido si está deshabilitado
        padding: '0.5rem 1.5rem', // Tamaño uniforme del botón
      }}
    >
      Siguiente
    </CButton>
    <span
      className="ms-2"
      style={{
        color: '#7a7a7a', // Texto en gris oscuro
        fontSize: '1rem', // Tamaño de fuente
      }}
    >
      Página {currentPage} de {totalPages}
    </span>
  </CCol>
</CRow>
<CModal
  visible={modalVisible}
  onClose={() => {
    resetRegistrarPagoModal();
    setModalVisible(false);
  }}
  backdrop="static"
  className="modal-md border-0 rounded shadow"
>
  <CModalHeader closeButton className="bg-light border-0">
    <CModalTitle className="fw-bold" style={{ color: '#4B6251' }}>
      <CIcon icon={cilWallet} className="me-2" /> Registrar Pago
    </CModalTitle>
  </CModalHeader>
  <CModalBody className="p-4">
    <CForm onSubmit={registrarPago}>
      {/* Campo de descripción */}
      <CInputGroup className="mb-3">
        <CInputGroupText className="bg-white border-0">
          <CIcon icon={cilDescription} className="text-muted" />
        </CInputGroupText>
        <CFormInput
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={pagoActual.descripcion}
          maxLength={25}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            if (/[^A-Z0-9 ]/.test(value)) {
              setErrors({ descripcion: 'No se permiten símbolos en la descripción.' });
            } else if (/([A-Z])\1\1/.test(value)) {
              setErrors({ descripcion: 'No se permiten tres letras iguales consecutivas.' });
            } else {
              setErrors({ descripcion: '' });
            }
            setPagoActual({ ...pagoActual, descripcion: value });
          }}
          onPaste={(e) => e.preventDefault()} // Bloquea pegar
          onCopy={(e) => e.preventDefault()} // Bloquea copiar
          className={`form-control border-0 shadow-sm ${errors.descripcion ? 'is-invalid' : ''}`}
          required
        />
      </CInputGroup>
      {errors.descripcion && <small className="text-danger">{errors.descripcion}</small>}

{/* Campo de monto */}
<CInputGroup className="mb-3">
  <CInputGroupText className="bg-white border-0">
    <CIcon icon={cilDollar} className="text-muted" />
  </CInputGroupText>
  <CFormInput
  type="number"
  name="monto"
  placeholder="Monto (Lempiras)"
  value={pagoActual.monto || valorMatricula || ''} // Toma el valor de Matricula como predeterminado
  onChange={(e) => {
    const value = e.target.value;

    // Validaciones
    if (/[^0-9.]/.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        monto: 'El monto solo puede contener números y puntos.',
      }));
    } else if (parseFloat(value) <= 0 || isNaN(parseFloat(value))) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        monto: 'El monto debe ser mayor a 0.',
      }));
    } else if (value.length > 25) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        monto: 'El monto no puede exceder los 25 caracteres.',
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        monto: '', // Limpia los errores
      }));
    }

    // Actualiza el estado con el valor ingresado
    setPagoActual((prevState) => ({
      ...prevState,
      monto: value, // Actualiza monto manualmente
    }));
  }}
  onPaste={(e) => e.preventDefault()} // Bloquea pegar
  onCopy={(e) => e.preventDefault()} // Bloquea copiar
  className={`form-control border-0 shadow-sm ${errors.monto ? 'is-invalid' : ''}`} // Resalta inválido si hay errores
  required
/>
{errors.monto && <small className="text-danger">{errors.monto}</small>} {/* Muestra error debajo */}

</CInputGroup>

      {/* Selección de concepto */}
<CInputGroup className="mb-3">
  <CInputGroupText className="bg-white border-0">
    <CIcon icon={cilTags} className="text-muted" />
  </CInputGroupText>
  <CFormSelect
    name="cod_concepto"
    value={pagoActual.cod_concepto || ''} // Siempre toma el valor de "Matricula"
    disabled // Hace el campo de solo lectura
    className="form-select border-0 shadow-sm"
    required
  >
    {/* Muestra "Matricula" como única opción */}
    <option value={pagoActual.cod_concepto}>Matricula</option>
  </CFormSelect>
</CInputGroup>

      {/* Checkbox para aplicar descuento */}
      <div className="form-check mb-4">
        <input
          type="checkbox"
          className="form-check-input shadow-sm"
          id="aplicarDescuento"
          checked={pagoActual.aplicar_descuento}
          onChange={(e) => setPagoActual({ ...pagoActual, aplicar_descuento: e.target.checked })}
        />
        <label className="form-check-label text-muted" htmlFor="aplicarDescuento">
          Aplicar Descuento
        </label>
      </div>

      {/* Campos adicionales para el descuento */}
      {pagoActual.aplicar_descuento && (
        <>
          {/* Valor del descuento */}
          <CInputGroup className="mb-3">
            <CInputGroupText className="bg-white border-0">L</CInputGroupText>
            <CFormInput
              type="number"
              name="valor_descuento"
              placeholder="Descuento en Lempiras"
              value={pagoActual.valor_descuento || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (/[^0-9.]/.test(value)) {
                  setErrors({ valor_descuento: 'El descuento solo puede contener números y puntos.' });
                } else if (parseFloat(value) > parseFloat(pagoActual.monto || 0)) {
                  setErrors({ valor_descuento: 'El descuento no puede ser mayor al monto.' });
                } else {
                  setErrors({ valor_descuento: '' });
                }
                setPagoActual({ ...pagoActual, valor_descuento: value });
              }}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              className={`form-control border-0 shadow-sm ${
                errors.valor_descuento ? 'is-invalid' : ''
              }`}
              required
            />
          </CInputGroup>
          {errors.valor_descuento && <small className="text-danger">{errors.valor_descuento}</small>}

          {/* Descripción del descuento */}
          <CInputGroup className="mb-3">
            <CInputGroupText className="bg-white border-0">Desc.</CInputGroupText>
            <CFormInput
              type="text"
              name="descripcion_descuento"
              placeholder="Descripción del descuento"
              value={pagoActual.descripcion_descuento || ''}
              maxLength={25}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                if (/[^A-Z0-9 ]/.test(value)) {
                  setErrors({ descripcion_descuento: 'No se permiten símbolos en la descripción.' });
                } else if (/([A-Z])\1\1/.test(value)) {
                  setErrors({
                    descripcion_descuento: 'No se permiten tres letras iguales consecutivas.',
                  });
                } else {
                  setErrors({ descripcion_descuento: '' });
                }
                setPagoActual({ ...pagoActual, descripcion_descuento: value });
              }}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              className={`form-control border-0 shadow-sm ${
                errors.descripcion_descuento ? 'is-invalid' : ''
              }`}
              required
            />
          </CInputGroup>
          {errors.descripcion_descuento && (
            <small className="text-danger">{errors.descripcion_descuento}</small>
          )}
        </>
      )}

      {/* Campo para dinero recibido */}
      <CInputGroup className="mb-3">
        <CInputGroupText className="bg-white border-0">
          <CIcon icon={cilDollar} className="text-muted" />
        </CInputGroupText>
        <CFormInput
          type="number"
          placeholder="Dinero recibido (Lempiras)"
          value={dineroRecibido}
          onChange={(e) => {
            const recibido = parseFloat(e.target.value) || 0;

            // Calcular el monto ajustado con descuento aplicado
            const montoBase = parseFloat(pagoActual.monto || 0);
            const descuento = pagoActual.aplicar_descuento
              ? parseFloat(pagoActual.valor_descuento || 0)
              : 0;
            const montoConDescuento = montoBase - descuento;

            // Actualizar estado de dinero recibido y vuelto
            setDineroRecibido(recibido);
            setVuelto(recibido - montoConDescuento); // Calcular el vuelto ajustado
          }}
          className="form-control border-0 shadow-sm"
          required
        />
      </CInputGroup>

      {/* Mostrar el vuelto calculado */}
      <CInputGroup className="mb-3">
        <CInputGroupText className="bg-white border-0">
          <CIcon icon={cilWallet} className="text-muted" />
        </CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Vuelto (Lempiras)"
          value={vuelto > 0 ? vuelto.toFixed(2) : '0.00'} // Mostrar el vuelto con 2 decimales
          className="form-control border-0 shadow-sm"
          readOnly
        />
      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter className="d-flex justify-content-end border-0">
    <CButton
      color="secondary"
      className="btn-light shadow-sm me-2"
      style={{ color: '#4B6251' }}
      onClick={() => {
        resetRegistrarPagoModal();
        setModalVisible(false);
      }}
    >
      Cancelar
    </CButton>
    <CButton
      className="shadow-sm"
      style={{
        backgroundColor: errors.descripcion ||
          errors.monto ||
          errors.valor_descuento ||
          errors.descripcion_descuento
          ? '#cccccc'
          : '#4B6251', // Deshabilitado en gris si hay errores
        borderColor: '#4B6251',
        color: errors.descripcion ||
          errors.monto ||
          errors.valor_descuento ||
          errors.descripcion_descuento
          ? '#666666'
          : 'white',
      }}
      onClick={registrarPago}
      disabled={
        errors.descripcion ||
        errors.monto ||
        errors.valor_descuento ||
        errors.descripcion_descuento
      }
    >
      Guardar
    </CButton>
  </CModalFooter>
</CModal>

<CModal
  visible={modalNuevaCajaVisible}
  onClose={() => {
    resetNuevaCajaModal(); // Reestablece los valores iniciales del estado nuevaCaja
    setDineroRecibido(0); // Reestablece el valor del dinero recibido
    setVuelto(0); // Reestablece el valor del vuelto
    setModalNuevaCajaVisible(false); // Cierra el modal
  }}
  backdrop="static"
  className="modal-md border-0 rounded shadow"
>
  <CModalHeader closeButton className="bg-light border-0">
    <CModalTitle className="fw-bold" style={{ color: '#4B6251' }}>
      <CIcon icon={cilWallet} className="me-2" /> Crear Nueva Caja
    </CModalTitle>
  </CModalHeader>
  <CModalBody className="p-4">
    <CForm onSubmit={crearNuevaCaja}>
      {/* Campo de DNI del padre */}
      <CInputGroup className="mb-3">
        <CInputGroupText className="bg-white border-0">DNI</CInputGroupText>
        <CFormInput
          type="text"
          name="dni_padre"
          placeholder="DNI del padre"
          value={nuevaCaja.dni_padre}
          maxLength={13}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // Elimina caracteres no numéricos
            setNuevaCaja({ ...nuevaCaja, dni_padre: value });
          }}
          onPaste={(e) => e.preventDefault()} // Bloquea pegar
          onCopy={(e) => e.preventDefault()} // Bloquea copiar
          className={`form-control border-0 shadow-sm ${
            nuevaCaja.dni_padre.length !== 13 ? 'is-invalid' : ''
          }`}
          required
        />
      </CInputGroup>
      {nuevaCaja.dni_padre.length !== 13 && (
        <small className="text-danger">El DNI debe tener exactamente 13 dígitos.</small>
      )}

      {/* Campo de descripción */}
      <CInputGroup className="mb-3">
        <CInputGroupText className="bg-white border-0">
          <CIcon icon={cilDescription} className="text-muted" />
        </CInputGroupText>
        <CFormInput
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={nuevaCaja.descripcion}
          maxLength={25}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            if (/[^A-Z0-9 ]/.test(value)) {
              setErrors({ descripcion: 'No se permiten símbolos.' });
            } else if (/([A-Z])\1\1/.test(value)) {
              setErrors({ descripcion: 'No se permiten tres letras iguales consecutivas.' });
            } else {
              setErrors({ descripcion: '' });
              setNuevaCaja({ ...nuevaCaja, descripcion: value });
            }
          }}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          className={`form-control border-0 shadow-sm ${errors.descripcion ? 'is-invalid' : ''}`}
          required
        />
      </CInputGroup>
      {errors.descripcion && <small className="text-danger">{errors.descripcion}</small>}

      {/* Campo de monto */}
      <CInputGroup className="mb-3">
        <CInputGroupText className="bg-white border-0">
          <CIcon icon={cilDollar} className="text-muted" />
        </CInputGroupText>
        <CFormInput
          type="number"
          name="monto"
          placeholder="Monto (Lempiras)"
          value={nuevaCaja.monto}
          onChange={(e) => {
            const value = e.target.value.slice(0, 25);
            setNuevaCaja({ ...nuevaCaja, monto: parseFloat(value) || 0 });
          }}
          className="form-control border-0 shadow-sm"
          required
        />
      </CInputGroup>

      {/* Selección de concepto */}
      <CInputGroup className="mb-3">
        <CInputGroupText className="bg-white border-0">
          <CIcon icon={cilTags} className="text-muted" />
        </CInputGroupText>
        <CFormSelect
          name="cod_concepto"
          value={nuevaCaja.cod_concepto}
          onChange={(e) => setNuevaCaja({ ...nuevaCaja, cod_concepto: e.target.value.toUpperCase() })}
          className="form-select border-0 shadow-sm"
          required
        >
          <option value="">Seleccione un concepto</option>
          {conceptos.map((concepto) => (
            <option key={concepto.Cod_concepto} value={concepto.Cod_concepto}>
              {concepto.Concepto.toUpperCase()}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>

      {/* Checkbox para aplicar descuento */}
      <div className="form-check mb-4">
        <input
          type="checkbox"
          className="form-check-input shadow-sm"
          id="aplicarDescuentoNuevaCaja"
          checked={nuevaCaja.aplicar_descuento}
          onChange={(e) => {
            const aplicar = e.target.checked;
            setNuevaCaja({
              ...nuevaCaja,
              aplicar_descuento: aplicar,
              valor_descuento: aplicar ? nuevaCaja.valor_descuento || 0 : null,
              descripcion_descuento: aplicar ? nuevaCaja.descripcion_descuento || '' : null,
            });
          }}
        />
        <label className="form-check-label text-muted" htmlFor="aplicarDescuentoNuevaCaja">
          Aplicar Descuento
        </label>
      </div>

      {/* Campos adicionales para el descuento */}
      {nuevaCaja.aplicar_descuento && (
        <>
          {/* Valor del descuento */}
          <CInputGroup className="mb-3">
            <CInputGroupText className="bg-white border-0">L</CInputGroupText>
            <CFormInput
              type="number"
              name="valor_descuento"
              placeholder="Descuento en Lempiras"
              value={nuevaCaja.valor_descuento || ''}
              onChange={(e) =>
                setNuevaCaja({
                  ...nuevaCaja,
                  valor_descuento: parseFloat(e.target.value) || 0,
                })
              }
              className="form-control border-0 shadow-sm"
              required
            />
          </CInputGroup>

          {/* Descripción del descuento */}
          <CInputGroup className="mb-3">
            <CInputGroupText className="bg-white border-0">Desc.</CInputGroupText>
            <CFormInput
              type="text"
              name="descripcion_descuento"
              placeholder="Descripción del descuento"
              value={nuevaCaja.descripcion_descuento || ''}
              onChange={(e) =>
                setNuevaCaja({
                  ...nuevaCaja,
                  descripcion_descuento: e.target.value.toUpperCase(),
                })
              }
              className="form-control border-0 shadow-sm"
              required
            />
          </CInputGroup>
        </>
      )}

      {/* Campo para dinero recibido */}
      <CInputGroup className="mb-3">
        <CInputGroupText className="bg-white border-0">
          <CIcon icon={cilDollar} className="text-muted" />
        </CInputGroupText>
        <CFormInput
          type="number"
          placeholder="Dinero recibido (Lempiras)"
          value={dineroRecibido}
          onChange={(e) => handleDineroRecibido(e.target.value)}
          className="form-control border-0 shadow-sm"
          required
        />
      </CInputGroup>

      {/* Mostrar el vuelto calculado */}
      <CInputGroup className="mb-3">
        <CInputGroupText className="bg-white border-0">
          <CIcon icon={cilWallet} className="text-muted" />
        </CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Vuelto (Lempiras)"
          value={vuelto > 0 ? vuelto.toFixed(2) : '0.00'}
          className="form-control border-0 shadow-sm"
          readOnly
        />
      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter className="d-flex justify-content-end border-0">
    <CButton
      color="secondary"
      className="btn-light shadow-sm me-2"
      style={{ color: '#4B6251' }}
      onClick={() => {
        resetNuevaCajaModal();
        setDineroRecibido(0);
        setVuelto(0);
        setModalNuevaCajaVisible(false);
      }}
    >
      Cancelar
    </CButton>
    <CButton
      className="shadow-sm"
      style={{ backgroundColor: '#4B6251', borderColor: '#4B6251', color: 'white' }}
      onClick={crearNuevaCaja}
    >
      Guardar
    </CButton>
  </CModalFooter>
</CModal>
    </CContainer>
  );
};

export default CajasMatriculas;
