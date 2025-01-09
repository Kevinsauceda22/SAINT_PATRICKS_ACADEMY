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
import { AuthContext } from '/context/AuthProvider'; // Asegúrate de que la ruta sea correcta


export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`) 
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    return null;
  }
};

const MySwal = withReactContent(Swal);

const CajasMatriculas = () => {
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalNuevaCajaVisible, setModalNuevaCajaVisible] = useState(false);
  const [valorMatricula, setValorMatricula] = useState(null); // Estado para almacenar el valor
  const [descuentos, setDescuentos] = useState([]); // Estado para almacenar los descuentos
  const [descripcionMatricula, setDescripcionMatricula] = useState(''); // Estado para la descripción
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
  const registrarEnBitacora = async (accion, descripcionAdicional = '') => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = decodeJWT(token);
  
      if (!decodedToken) {
        Swal.fire('Error', 'Token inválido o expirado. Por favor, inicie sesión nuevamente.', 'error');
        return;
      }
  
      const cod_usuario = decodedToken.cod_usuario;
      const nombre_usuario = decodedToken.nombre_usuario;
  
      if (!cod_usuario || !nombre_usuario) {
        Swal.fire('Error', 'El token no contiene información válida del usuario.', 'error');
        return;
      }
  
      const descripcion = `El usuario: ${nombre_usuario} realizó la acción: ${accion}. ${descripcionAdicional}`;
      console.log('Datos para bitácora:', { cod_usuario, cod_objeto: 106, accion, descripcion });
  
      await axios.post(
        'http://localhost:4000/api/bitacora/registro',
        { cod_usuario, cod_objeto: 106, accion, descripcion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Registro en bitácora exitoso');
    } catch (error) {
      console.error('Error al registrar en bitácora:', error.message);
      Swal.fire('Error', 'Hubo un problema al registrar en la bitácora.', 'error');
    }
  };
  
  const registrarPago = async (e) => {
    e.preventDefault();
  
    try {
      // Usar descripción ingresada o la obtenida de la API
      const descripcionFinal = pagoActual.descripcion || descripcionMatricula;
  
      // Validar que exista una descripción válida
      if (!descripcionFinal || !descripcionFinal.trim()) {
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
  
      // Validar que el concepto "Matricula" esté cargado antes de continuar
      if (!pagoActual.cod_concepto) {
        try {
          const response = await axios.get('http://localhost:4000/api/caja/concepto/matricula');
          if (response.status === 200 && response.data.cod_concepto) {
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
  
      // Validar descuento si aplica
      let descuentoAplicado = 0;
  
      if (pagoActual.aplicar_descuento && pagoActual.cod_descuento) {
        const porcentajeDescuento = parseFloat(pagoActual.valor_descuento);
  
        if (isNaN(porcentajeDescuento) || porcentajeDescuento <= 0 || porcentajeDescuento > 100) {
          MySwal.fire({
            icon: 'warning',
            title: 'Descuento inválido',
            text: 'El descuento debe ser un porcentaje válido entre 0% y 100%.',
            confirmButtonText: 'Entendido',
          });
          return;
        }
  
        // Calcular el descuento en base al porcentaje
        descuentoAplicado = (monto * porcentajeDescuento) / 100;
      }
  
      const montoFinal = monto - descuentoAplicado;
  
      if (montoFinal < 0) {
        MySwal.fire({
          icon: 'warning',
          title: 'Monto inválido',
          text: 'El monto final no puede ser negativo.',
          confirmButtonText: 'Entendido',
        });
        return;
      }
  
      // Preparar los datos para el envío
      const datosPago = {
        cod_caja: pagoActual.cod_caja,
        monto: montoFinal, // Monto ajustado con descuento aplicado
        descripcion: descripcionFinal, // Usar la descripción final
        cod_concepto: pagoActual.cod_concepto,
        cod_descuento: pagoActual.aplicar_descuento ? pagoActual.cod_descuento : null, // Código del descuento, si aplica
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
  
        // Registro en la bitácora
        await registrarEnBitacora(
          'INSERT',
          `Registró un pago de ${montoFinal.toFixed(2)} con concepto "${pagoActual.descripcion}" en la caja ${pagoActual.cod_caja}.`
        );
  
        // Construir datos de la caja para el reporte individual
        const cajaConDatos = {
          Cod_caja: pagoActual.cod_caja,
          Nombre_Padre: 'Nombre del Padre', // Sustituir con los datos reales si están disponibles
          Apellido_Padre: 'Apellido del Padre', // Sustituir con los datos reales si están disponibles
          Descripcion: pagoActual.descripcion,
          Monto: montoFinal,
          Estado_pago: 'Pagado',
          Fecha_pago: new Date(),
          Hora_registro: new Date(),
        };
  
        // Preguntar al usuario si desea generar el recibo
        MySwal.fire({
          title: '¿Deseas descargar el recibo?',
          text: 'El recibo se generará como un archivo PDF.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, generar',
          cancelButtonText: 'No',
        }).then((result) => {
          if (result.isConfirmed) {
            // Generar e imprimir el PDF del reporte individual
            generarReporteIndividual(cajaConDatos, dineroRecibido, vuelto);
          }
        });
  
        setModalVisible(false); // Cerrar el modal
        resetRegistrarPagoModal(); // Reiniciar el formulario
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
  
  
  
  // Obtener el concepto "Matricula"
  useEffect(() => {
    const fetchConceptoMatricula = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/caja/concepto/matricula');
        if (response.status === 200) {
          setPagoActual((prevState) => ({
            ...prevState,
            cod_concepto: response.data.cod_concepto,
          }));
        }
      } catch (error) {
        console.error('Error al obtener el concepto "Pago de matricula":', error);
      }
    };
  
    fetchConceptoMatricula();
  }, []);
  
  // Obtener los descuentos disponibles
  useEffect(() => {
    const fetchDescuentos = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/caja/descuentos');
        if (response.status === 200 && response.data.data) {
          setDescuentos(response.data.data);
          console.log('Descuentos obtenidos:', response.data.data);
        } else {
          console.error('La respuesta no contiene datos de descuentos:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener los descuentos:', error.message);
      }
    };
  
    fetchDescuentos();
  }, []);
  
  
  const crearNuevaCaja = async () => {
    console.log("Datos de la nueva caja:", nuevaCaja);
  
    // Validación de campos obligatorios
    if (!nuevaCaja.descripcion || !nuevaCaja.monto || !nuevaCaja.cod_concepto || !nuevaCaja.dni_padre) {
      await MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos son obligatorios.',
      });
      return;
    }
  
    // Validación de formato del DNI
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
    let descuentoAplicado = 0;
  
    if (nuevaCaja.aplicar_descuento && nuevaCaja.valor_descuento) {
      const porcentajeDescuento = parseFloat(nuevaCaja.valor_descuento);
  
      if (isNaN(porcentajeDescuento) || porcentajeDescuento <= 0 || porcentajeDescuento > 100) {
        await MySwal.fire({
          icon: 'error',
          title: 'Error en el descuento',
          text: 'El descuento debe ser un porcentaje válido entre 0% y 100%.',
        });
        return;
      }
  
      descuentoAplicado = (nuevaCaja.monto * porcentajeDescuento) / 100;
    }
  
    const montoFinal = nuevaCaja.monto - descuentoAplicado;
  
    if (montoFinal < 0) {
      await MySwal.fire({
        icon: 'error',
        title: 'Error en el monto',
        text: 'El monto final no puede ser negativo.',
      });
      return;
    }
  
    try {
      // Preparar los datos para enviar al servidor
      const datosCaja = {
        descripcion: nuevaCaja.descripcion,
        monto: montoFinal,
        cod_concepto: nuevaCaja.cod_concepto,
        dni_padre: nuevaCaja.dni_padre,
        estado_pago: 'Pendiente',
        aplicar_descuento: nuevaCaja.aplicar_descuento || false,
        cod_descuento: nuevaCaja.aplicar_descuento ? nuevaCaja.cod_descuento : null,
      };
  
      console.log("Datos enviados al servidor:", datosCaja);
  
      // Realizar la solicitud al servidor
      const response = await axios.post('http://localhost:4000/api/caja/oficial', datosCaja);
  
      if (response.status === 201 || response.status === 200) {
        console.log("Caja creada exitosamente");
  
        // Registro en la bitácora
        await registrarEnBitacora(
          'INSERT',
          `Caja creada. Descripción: "${nuevaCaja.descripcion}", Monto: ${montoFinal.toFixed(2)}, DNI del Padre: ${nuevaCaja.dni_padre}.`
        );
  
        // Construir datos para el PDF
        const cajaConDatos = {
          Cod_caja: response.data.cod_caja || 'No disponible',
          Nombre_Padre: nuevaCaja.Nombre_Padre || 'No disponible',
          Apellido_Padre: nuevaCaja.Apellido_Padre || 'No disponible',
          Descripcion: nuevaCaja.descripcion,
          Monto: montoFinal,
          Descuento: descuentoAplicado > 0 ? `L ${descuentoAplicado.toFixed(2)}` : 'No aplica',
          Estado_pago: 'Pendiente',
          Fecha_pago: new Date(),
          Hora_registro: new Date(),
        };
  
        // Mostrar la alerta de éxito
        await MySwal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'La nueva caja se ha creado exitosamente.',
        });
  
        // Preguntar si desea imprimir el recibo
        const imprimir = await MySwal.fire({
          title: '¿Desea imprimir el recibo?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, generar',
          cancelButtonText: 'No',
        });
  
        if (imprimir.isConfirmed) {
          // Llamar a la función para generar el PDF
          generarReporteIndividual(cajaConDatos, nuevaCaja.monto, descuentoAplicado);
        }
  
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
  const registrarEnBitacoracaja = async (accion, descripcionAdicional = '') => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = decodeJWT(token);
  
      if (!decodedToken) {
        Swal.fire('Error', 'Token inválido o expirado. Por favor, inicie sesión nuevamente.', 'error');
        return;
      }
  
      const cod_usuario = decodedToken.cod_usuario;
      const nombre_usuario = decodedToken.nombre_usuario;
  
      if (!cod_usuario || !nombre_usuario) {
        Swal.fire('Error', 'El token no contiene información válida del usuario.', 'error');
        return;
      }
  
      const descripcion = `El usuario: ${nombre_usuario} realizó la acción: ${accion}. ${descripcionAdicional}`;
  
      console.log('Datos para bitácora:', { cod_usuario, cod_objeto: 106, accion, descripcion });
  
      await axios.post(
        'http://localhost:4000/api/bitacora/registro',
        { cod_usuario, cod_objeto: 106, accion, descripcion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Registro en bitácora exitoso');
    } catch (error) {
      console.error('Error al registrar en bitácora:', error.message);
      Swal.fire('Error', 'Hubo un problema al registrar en la bitácora.', 'error');
    }
  };
    
  useEffect(() => {
    const cargarNombreAlumno = async () => {
      try {
        if (!pagoActual.cod_caja) {
          console.warn('No se proporcionó el código de la caja.');
          return;
        }
  
        const response = await axios.get(
          `http://localhost:4000/api/caja/nombre-alumno?cod_caja=${pagoActual.cod_caja}`
        );
  
        if (response.status === 200) {
          setNombreAlumno(response.data.nombre); // Guardar el nombre del alumno en el estado
        } else {
          console.error('Error al cargar el nombre del alumno:', response.data.message);
        }
      } catch (error) {
        console.error('Error al cargar el nombre del alumno:', error);
      }
    };
  
    cargarNombreAlumno();
  }, [pagoActual.cod_caja]);
  
  // Estado para guardar el nombre del alumno
  const [nombreAlumno, setNombreAlumno] = useState('');
  

  

  const paginatedData = pagosPendientes
  .filter((pago) => {
    const searchLower = searchTerm.toLowerCase();

    // Filtrar por nombre completo o por DNI
    return (
      `${pago.Nombre_Padre} ${pago.Apellido_Padre}`.toLowerCase().includes(searchLower) || 
      (pago.DNI_Padre && pago.DNI_Padre.toString().includes(searchTerm)) // Verificar si el DNI incluye el término
    );
  })
  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

useEffect(() => {
  console.log('Datos de pagos pendientes:', pagosPendientes);
}, [pagosPendientes]);

const buscarCajasPorDni = async (dni) => {
  try {
    if (!dni || dni.trim() === '') {
      throw new Error('El campo DNI está vacío. Por favor, ingrese un DNI válido.');
    }

    // URL del endpoint que has configurado
    const url = `http://localhost:4000/api/caja/buscar-por-dni?dni=${dni}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al buscar cajas por DNI.');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      alert('No se encontraron resultados para el DNI ingresado.');
      return null; // Retorna null si no hay datos
    }

    console.log('Resultados de la búsqueda:', data);
    return data; // Devuelve los resultados de la búsqueda para gestionarlos en la UI
  } catch (error) {
    console.error('Error al realizar la búsqueda:', error.message);
    return null; // Devuelve null si ocurre un error
  }
};


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

        // Pie de página con fecha, hora y número de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const creationDateTime = new Date().toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            // Fecha y hora alineada a la izquierda
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(
                `Fecha y Hora de Generación: ${creationDateTime}`,
                10,
                doc.internal.pageSize.height - 10
            );

            // Número de página alineado a la derecha
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.width - 30,
                doc.internal.pageSize.height - 10,
                { align: 'right' }
            );
        }

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
          doc.text('Recibo de Caja', doc.internal.pageSize.width / 2, 30, {
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
          doc.text('Detalles del Recibo', doc.internal.pageSize.width / 2, 65, {
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

          // Pie de página con fecha, hora y número de página
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
              doc.setPage(i);
              const creationDateTime = new Date().toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
              });

              // Fecha y hora alineada a la izquierda
              doc.setFontSize(10);
              doc.setTextColor(100);
              doc.text(
                  `Fecha y Hora de Generación: ${creationDateTime}`,
                  10,
                  doc.internal.pageSize.height - 10
              );

              // Número de página alineado a la derecha
              doc.text(
                  `Página ${i} de ${pageCount}`,
                  doc.internal.pageSize.width - 30,
                  doc.internal.pageSize.height - 10,
                  { align: 'right' }
              );
          }

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

  
useEffect(() => {
  const cargarValorMatriculaPorCaja = async () => {
    try {
      const codCaja = pagoActual.cod_caja; // Obtén el código de la caja

      if (!codCaja) {
        console.warn('No se proporcionó el código de la caja.');
        return;
      }

      // Llama a la API para obtener el valor de matrícula basado en la caja
      const response = await axios.get(
        `http://localhost:4000/api/caja/parametro/Matricula?cod_caja=${codCaja}`
      );

      if (response.status === 200) {
        const { valor, parametro } = response.data;
        setValorMatricula(valor); // Actualiza el valor de matrícula
        setDescripcionMatricula(parametro); // Actualiza la descripción con el nombre del ciclo
      } else {
        console.error('Error al cargar el valor de matrícula:', response.data.message);
      }
    } catch (error) {
      console.error('Error al cargar el valor de matrícula por caja:', error);
    }
  };

  cargarValorMatriculaPorCaja();
}, [pagoActual.cod_caja]); // Recalcular si cambia la caja

// Sincronizar la descripción en el estado de pagoActual
useEffect(() => {
  if (descripcionMatricula) {
    setPagoActual((prev) => ({
      ...prev,
      descripcion: descripcionMatricula, // Usar la descripción dinámica
    }));
  }
}, [descripcionMatricula]);

// Sincronizar descripción si cambia el valor
useEffect(() => {
  if (descripcionMatricula) {
    setPagoActual((prev) => ({
      ...prev,
      descripcion: 'Pago de matrícula', // Descripción fija
    }));
  }
}, [descripcionMatricula]);

// Sincronizar monto con el valor de matrícula
useEffect(() => {
  if (valorMatricula) {
    setPagoActual((prev) => ({
      ...prev,
      monto: valorMatricula, // Valor dinámico sincronizado según el ciclo
    }));
  }
}, [valorMatricula]);

// Calcular vuelto basado en monto, descuento y dinero recibido
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
{/* Búsqueda y Selector de Paginación */}
<CRow className="justify-content-between align-items-center mb-3">
  <CCol xs={4} md={3}>
    <CFormInput
      placeholder="Buscar por nombre o DNI del padre" // Refleja el filtro actualizado
      value={searchTerm}
      onChange={async (e) => {
        const inputValue = e.target.value;
        setSearchTerm(inputValue);

        // Realizar la búsqueda en el backend si hay un término ingresado
        if (inputValue.trim() !== '') {
          const results = await buscarCajasPorDni(inputValue); // Función fetch creada previamente
          if (results) {
            setPagosPendientes(results.data || []); // Actualiza el estado con los resultados
          }
        } else {
          // Si no hay término de búsqueda, carga todas las cajas pendientes
          obtenerCajasPendientes();
        }
      }}
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
<CModalHeader
  className="bg-light border-bottom py-3 px-4"
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  }}
>
  {/* Encabezado principal */}
  <div
    className="d-flex align-items-center justify-content-start"
    style={{
      gap: '10px',
      width: '100%',
    }}
  >
    <CIcon icon={cilWallet} style={{ fontSize: '2rem', color: '#4B6251' }} />
    <h4
      className="fw-bold mb-0"
      style={{
        color: '#4B6251',
        fontSize: '1.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      Pago de Matricula
    </h4>
  </div>

  {/* Subtítulo: Nombre del alumno */}
  {nombreAlumno && (
    <span
      style={{
        fontSize: '1.2rem',
        fontWeight: '500',
        color: '#6C757D', // Gris suave
        marginLeft: '2.5rem', // Alineado con el ícono
      }}
    >
      Matrícula del Alumno{' '}
      <strong style={{ color: '#4B6251', textTransform: 'uppercase' }}>
        {nombreAlumno}
      </strong>
    </span>
  )}
</CModalHeader>

  <CModalBody className="p-4">
    <CForm onSubmit={registrarPago}>
    <CInputGroup className="mb-3">
  <CInputGroupText className="bg-white border-0">
    <CIcon icon={cilDescription} className="text-muted" />
  </CInputGroupText>
  <CFormInput
    type="text"
    name="descripcion"
    placeholder="Descripción"
    value={descripcionMatricula || pagoActual.descripcion || ''} // Descripción dinámica
    readOnly
    className="form-control border-0 shadow-sm"
  />
</CInputGroup>

<CInputGroup className="mb-3">
  <CInputGroupText className="bg-white border-0">
    <CIcon icon={cilDollar} className="text-muted" />
  </CInputGroupText>
  <CFormInput
    type="number"
    name="monto"
    placeholder="Monto (Lempiras)"
    value={pagoActual.monto || valorMatricula || ''} // Monto dinámico
    readOnly
    className={`form-control border-0 shadow-sm`}
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
    value={pagoActual.cod_concepto || ''} // Siempre toma el valor de "Matricula"
    disabled // Hace el campo de solo lectura
    className="form-select border-0 shadow-sm"
    required
  >
    {/* Muestra "Matricula" como única opción */}
    <option value={pagoActual.cod_concepto}>Pago de matricula</option>
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

{/* Selección de porcentaje de descuento */}
{pagoActual.aplicar_descuento && (
  <CInputGroup className="mb-3">
    <CInputGroupText className="bg-white border-0">%</CInputGroupText>
    <CFormSelect
      name="cod_descuento"
      value={pagoActual.cod_descuento || ''} // Asegúrate de que el estado esté vinculado al código del descuento
      onChange={(e) => {
        const selectedCodDescuento = e.target.value;
        const descuentoSeleccionado = descuentos.find(
          (descuento) => descuento.Cod_descuento.toString() === selectedCodDescuento
        );

        if (descuentoSeleccionado) {
          const porcentaje = parseFloat(descuentoSeleccionado.Valor) * 100; // Convertir a porcentaje
          const montoBase = parseFloat(pagoActual.monto || 0);

          // Calcular el monto con el descuento aplicado
          const descuentoAplicado = montoBase * (porcentaje / 100);
          const montoFinal = montoBase - descuentoAplicado;

          // Actualizar el estado
          setPagoActual({
            ...pagoActual,
            cod_descuento: descuentoSeleccionado.Cod_descuento,
            valor_descuento: descuentoSeleccionado.Valor, // Mantén el valor original para el backend
            monto_final: montoFinal > 0 ? montoFinal : 0, // Asegúrate de que no sea negativo
          });
        }
      }}
      className="form-select border-0 shadow-sm"
      required
    >
      <option value="">Seleccionar descuento</option>
      {descuentos.map((descuento) => (
        <option key={descuento.Cod_descuento} value={descuento.Cod_descuento}>
          {descuento.Valor * 100}% - {descuento.Nombre_descuento}
        </option>
      ))}
    </CFormSelect>
  </CInputGroup>
)}

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
    id="aplicarDescuento"
    checked={pagoActual.aplicar_descuento}
    onChange={(e) => setPagoActual({ ...pagoActual, aplicar_descuento: e.target.checked })}
  />
  <label className="form-check-label text-muted" htmlFor="aplicarDescuento">
    Aplicar Descuento
  </label>
</div>

{/* Selección de porcentaje de descuento */}
{pagoActual.aplicar_descuento && (
  <CInputGroup className="mb-3">
    <CInputGroupText className="bg-white border-0">%</CInputGroupText>
    <CFormSelect
      name="cod_descuento"
      value={pagoActual.cod_descuento || ''} // Vincula al código del descuento seleccionado
      onChange={(e) => {
        const selectedCodDescuento = e.target.value;
        const descuentoSeleccionado = descuentos.find(
          (descuento) => descuento.Cod_descuento.toString() === selectedCodDescuento
        );

        if (descuentoSeleccionado) {
          const valorDescuento = parseFloat(descuentoSeleccionado.Valor); // Valor original (e.g., 0.1 para 10%)
          const montoBase = parseFloat(pagoActual.monto || 0);

          // Calcular el monto con el descuento aplicado
          const descuentoAplicado = montoBase * valorDescuento;
          const montoFinal = montoBase - descuentoAplicado;

          // Actualizar el estado
          setPagoActual({
            ...pagoActual,
            cod_descuento: descuentoSeleccionado.Cod_descuento,
            valor_descuento: descuentoSeleccionado.Valor, // Mantén el valor original para el backend
            monto_final: montoFinal > 0 ? montoFinal : 0, // Asegúrate de que no sea negativo
          });
        }
      }}
      className="form-select border-0 shadow-sm"
      required
    >
      <option value="">Seleccionar descuento</option>
      {descuentos.map((descuento) => (
        <option key={descuento.Cod_descuento} value={descuento.Cod_descuento}>
          {`${parseFloat(descuento.Valor) * 100}% - ${descuento.Nombre_descuento}`}
        </option>
      ))}
    </CFormSelect>
  </CInputGroup>
)}

    
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
