import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  ShieldOff, 
  AlertCircle, 
  Search, 
  ChevronDown,
  UserPlus,
  BookOpen,
  Users,
  Briefcase,
  UserCog,
  Edit
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './UserManagement.css';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

//GestionUsuarios
const UserManagement = () => {
  const { canSelect, canUpdate, canDelete, canInsert, loading, error } = usePermission('GestionUsuarios');

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingg, setLoadingg] = useState(true);

  const [processingUsers, setProcessingUsers] = useState(new Set());
  const loggedInUserId = localStorage.getItem('userId');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const loggedInUserRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchUsers();
  }, []);

  const userTypes = [
    {
      id: 2,
      title: 'Administrador',
      description: 'Acceso completo al sistema',
      icon: UserCog,
      color: 'bg-blue-500'
    },
    {
      id: 4,
      title: 'SuperUsuario',
      description: 'Gestión de recursos y usuarios',
      icon: Briefcase,
      color: 'bg-green-500'
    },
    {
      id: 1,
      title: 'Padre',
      description: 'Acceso a información de estudiantes',
      icon: Users,
      color: 'bg-orange-500'
    },
    {
      id: 3,
      title: 'Docente',
      description: 'Gestión de clases y calificaciones',
      icon: BookOpen,
      color: 'bg-purple-500'
    }
  ];

  const handleAddUser = async (roleType) => {
    const roleMap = {
      1: 'Padre',
      2: 'Administrador',
      3: 'Docente',
      4: 'ROOT'
    };
    let roleText = roleMap[roleType] || '';
    
    // Definir los datos como constantes para los profesores
    const gradosAcademicos = [
        { Cod_grado_academico: 1, Descripcion: 'LICENCIATURA' },
        { Cod_grado_academico: 2, Descripcion: 'MAESTRÍA' },
        { Cod_grado_academico: 3, Descripcion: 'DOCTORADO' },
        { Cod_grado_academico: 4, Descripcion: 'POST-DOCTORADO' }
    ];

    const tiposContrato = [
        { Cod_tipo_contrato: 1, Descripcion: 'TIEMPO COMPLETO' },
        { Cod_tipo_contrato: 2, Descripcion: 'MEDIO TIEMPO' },
        { Cod_tipo_contrato: 3, Descripcion: 'POR HORA' }
    ];
    
    // Cargar departamentos y nacionalidades
    let departamentos = [];
    let nacionalidades = [];
    try {
      const token = localStorage.getItem('token');
      // Cargar departamentos
      const deptoResponse = await axios.get(
        'http://localhost:4000/api/departamentos/verTodoDepartamento',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (deptoResponse.data) {
        departamentos = deptoResponse.data
          .reduce((acc, current) => {
            const x = acc.find(item => item.cod_departamento === current.cod_departamento);
            if (!x) return acc.concat([current]);
            return acc;
          }, [])
          .sort((a, b) => a.nombre_departamento.localeCompare(b.nombre_departamento));
      }

      // Cargar nacionalidades
      const nacResponse = await axios.get(
        'http://localhost:4000/api/nacionalidad/verTodoNacionalidad',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (nacResponse.data) {
        nacionalidades = nacResponse.data.sort((a, b) => 
          a.pais_nacionalidad.localeCompare(b.pais_nacionalidad)
        );
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar los datos necesarios',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    
    // Preparar campos adicionales para docentes
    const camposDocente = roleType === 3 ? `
      <div class="modal-section">
        <div class="section-title">Información Académica</div>
        <div class="form-grid">
          <div class="form-group">
            <select id="Cod_grado_academico" class="swal2-select" required>
              <option value="">Grado Académico *</option>
              ${gradosAcademicos.map(grado => `
                <option value="${grado.Cod_grado_academico}">
                  ${grado.Descripcion}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <select id="Cod_tipo_contrato" class="swal2-select" required>
              <option value="">Tipo de Contrato *</option>
              ${tiposContrato.map(tipo => `
                <option value="${tipo.Cod_tipo_contrato}">
                  ${tipo.Descripcion}
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="modal-section">
        <div class="section-title">Horario y Experiencia</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Hora de Entrada *</label>
            <input type="time" id="Hora_entrada" class="swal2-input" required>
          </div>
          <div class="form-group">
            <label>Hora de Salida *</label>
            <input type="time" id="Hora_salida" class="swal2-input" required>
          </div>
        </div>
        <div class="form-group">
          <label>Fecha de Ingreso *</label>
          <input type="date" id="Fecha_ingreso" class="swal2-input" required value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label>Fecha Fin de Contrato</label>
          <input type="date" id="Fecha_fin_contrato" class="swal2-input">
        </div>
        <div class="form-group">
          <label>Años de Experiencia *</label>
          <input 
            type="number" 
            id="Años_experiencia" 
            class="swal2-input"
            placeholder="Ingrese los años de experiencia" 
            required 
            min="0" 
            max="99" 
            value="0"
            step="1"
            onchange="this.value = Math.round(this.value)"
            oninput="this.value = this.value.replace(/[^0-9]/g, '')"
          >
          <small class="helper-text">Ingrese los años de experiencia laboral (número entero entre 0 y 99)</small>
        </div>
      </div>
    ` : '';
  
    Swal.fire({
      title: `Agregar ${roleText}`,
      html: `
        <div class="modal-form-container">
          <div class="modal-section">
            <div class="section-title">Información Personal</div>
            <div class="form-grid">
              <div class="form-group">
                <input 
                  id="Nombre" 
                  class="swal2-input" 
                  placeholder="Primer nombre *" 
                  required
                  oninput="this.value = this.value.replace(/\\s/g, '').toUpperCase()">
              </div>
              <div class="form-group">
                <input 
                  id="Segundo_nombre" 
                  class="swal2-input" 
                  placeholder="Segundo nombre"
                  oninput="this.value = this.value.replace(/\\s/g, '').toUpperCase()">
              </div>
              <div class="form-group">
                <input 
                  id="Primer_apellido" 
                  class="swal2-input" 
                  placeholder="Primer apellido *" 
                  required
                  oninput="this.value = this.value.replace(/\\s/g, '').toUpperCase()">
              </div>
              <div class="form-group">
                <input 
                  id="Segundo_apellido" 
                  class="swal2-input" 
                  placeholder="Segundo apellido"
                  oninput="this.value = this.value.replace(/\\s/g, '').toUpperCase()">
              </div>
            </div>
          </div>
  
          <div class="modal-section">
            <div class="section-title">DNI</div>
            <div class="form-group">
              <input 
                id="dni_persona" 
                class="swal2-input" 
                placeholder="Número de documento *" 
                required 
                maxlength="13"
                oninput="this.value = this.value.replace(/[^0-9]/g, '')">
              <small class="helper-text">El DNI debe tener exactamente 13 dígitos</small>
            </div>
          </div>
  
          <div class="modal-section">
            <div class="section-title">Información Adicional</div>
            <div class="form-grid">
              <div class="form-group">
                <select id="Cod_nacionalidad" class="swal2-select" required onchange="handleNacionalidadChange(this.value)">
                  <option value="">Nacionalidad *</option>
                  ${nacionalidades.map(nac => `
                    <option value="${nac.Cod_nacionalidad}">
                      ${nac.pais_nacionalidad ? nac.pais_nacionalidad.toUpperCase() : 'PAÍS NO ESPECIFICADO'}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <select id="cod_genero" class="swal2-select" required>
                  <option value="">Género *</option>
                  <option value="1">MASCULINO</option>
                  <option value="2">FEMENINO</option>
                  <option value="3">OTRO</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <input 
                id="direccion_persona" 
                class="swal2-input" 
                placeholder="Dirección"
                oninput="this.value = this.value.toUpperCase()">
            </div>
            <div class="form-group">
              <label class="date-label">Fecha de nacimiento</label>
              <input type="date" id="fecha_nacimiento" class="swal2-input">
            </div>
          </div>
  
          <div class="modal-section">
            <div class="section-title">Ubicación</div>
            <div class="form-grid">
              <div class="form-group">
                <select id="cod_departamento" class="swal2-select" required onchange="handleDepartamentoChange(this.value)" disabled>
                  <option value="">Departamento *</option>
                  ${departamentos.map(depto => `
                    <option value="${depto.cod_departamento}">
                      ${depto.nombre_departamento ? depto.nombre_departamento.toUpperCase() : 'DEPARTAMENTO NO ESPECIFICADO'}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <select id="cod_municipio" class="swal2-select" required disabled>
                  <option value="">Municipio *</option>
                </select>
              </div>
            </div>
          </div>

          ${camposDocente}
  
          <div class="modal-section">
            <div class="section-title">Información de Cuenta</div>
            <div class="form-group">
              <input 
                id="correo_usuario" 
                class="swal2-input" 
                placeholder="Correo electrónico *" 
                required>
              <small class="helper-text">Se enviará un correo con las credenciales temporales</small>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Usuario',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-popup',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      },
      didOpen: () => {
        // Función para validar formato de hora
        window.isValidTimeFormat = (time) => {
          if (!time) return false;
          const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
          return regex.test(time);
        };
        
        // Función para manejar cambio de nacionalidad
        window.handleNacionalidadChange = (nacionalidadId) => {
          const deptoSelect = document.getElementById('cod_departamento');
          const municipioSelect = document.getElementById('cod_municipio');
          
          // Verificar si es hondureño (ID 69)
          const esHondureno = nacionalidadId === '69';
          
          if (esHondureno) {
            deptoSelect.disabled = false;
            // Restaurar opciones de departamentos
            deptoSelect.innerHTML = `
              <option value="">Departamento *</option>
              ${departamentos.map(depto => `
                <option value="${depto.cod_departamento}">
                  ${depto.nombre_departamento ? depto.nombre_departamento.toUpperCase() : 'DEPARTAMENTO NO ESPECIFICADO'}
                </option>
              `).join('')}
            `;
          } else {
            // Si no es hondureño, deshabilitar y limpiar departamentos y municipios
            deptoSelect.disabled = true;
            deptoSelect.value = '';
            municipioSelect.disabled = true;
            municipioSelect.innerHTML = '<option value="">Municipio *</option>';
            municipioSelect.value = '';
          }
        };

        // Función para manejar cambio de departamento
        window.handleDepartamentoChange = async (departamentoId) => {
          const municipioSelect = document.getElementById('cod_municipio');
          
          if (!departamentoId) {
            municipioSelect.innerHTML = '<option value="">Municipio *</option>';
            municipioSelect.disabled = true;
            return;
          }
  
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
              `http://localhost:4000/api/departamento/municipios/${departamentoId}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
  
            if (response.data) {
              municipioSelect.innerHTML = `
                <option value="">Municipio *</option>
                ${response.data.map(municipio => `
                  <option value="${municipio.cod_municipio}">
                    ${municipio.nombre_municipio ? municipio.nombre_municipio.toUpperCase() : 'MUNICIPIO NO ESPECIFICADO'}
                  </option>
                `).join('')}
              `;
              municipioSelect.disabled = false;
            }
          } catch (error) {
            console.error('Error al cargar municipios:', error);
            municipioSelect.innerHTML = '<option value="">Error al cargar municipios</option>';
            municipioSelect.disabled = true;
          }
        };
      },
      willClose: () => {
        delete window.handleNacionalidadChange;
        delete window.handleDepartamentoChange;
        delete window.isValidTimeFormat;
      },
      preConfirm: () => {
        // Validar longitud de DNI
        const dni = document.getElementById('dni_persona').value;
        if (dni.length !== 13) {
          Swal.showValidationMessage('El DNI debe tener exactamente 13 dígitos');
          return false;
        }

        const nacionalidadId = document.getElementById('Cod_nacionalidad').value;
        const esHondureno = nacionalidadId === '69';

        // Formatear las horas para incluir los segundos (HH:mm:ss) - Para docentes
        const formatHora = (hora) => {
          if (!hora) return null;
          return `${hora}:00`; // Añadir los segundos
        };

        // Recolectar datos de persona
        const personData = {
          dni_persona: dni,
          Nombre: document.getElementById('Nombre').value,
          Segundo_nombre: document.getElementById('Segundo_nombre').value,
          Primer_apellido: document.getElementById('Primer_apellido').value,
          Segundo_apellido: document.getElementById('Segundo_apellido').value,
          Cod_nacionalidad: nacionalidadId,
          direccion_persona: document.getElementById('direccion_persona').value,
          fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
          estado: '1',
          cod_tipo_persona: "1",
          cod_departamento: esHondureno ? document.getElementById('cod_departamento').value : null,
          cod_municipio: esHondureno ? document.getElementById('cod_municipio').value : null,
          cod_genero: document.getElementById('cod_genero').value
        };
    
        // Recolectar datos de usuario
        const userData = {
          correo_usuario: document.getElementById('correo_usuario').value,
          Cod_rol: roleType,
          Cod_estado_usuario: 1,
          datos_completados: 0,
          Primer_ingreso: null
        };
        
        // Si es docente, recolectar datos adicionales
        let profesorData = null;
        if (roleType === 3) {
          const horaEntrada = formatHora(document.getElementById('Hora_entrada').value);
          const horaSalida = formatHora(document.getElementById('Hora_salida').value);
          const añosExperiencia = document.getElementById('Años_experiencia').value;
          
          // Validar el campo de años de experiencia
          if (añosExperiencia === '' || añosExperiencia === null || isNaN(añosExperiencia)) {
            Swal.showValidationMessage('Los años de experiencia son requeridos');
            return false;
          }
          
          // Validar el rango de años de experiencia
          const añosExperienciaNum = parseInt(añosExperiencia);
          if (añosExperienciaNum < 0 || añosExperienciaNum > 99) {
            Swal.showValidationMessage('Los años de experiencia deben estar entre 0 y 99');
            return false;
          }
          
          profesorData = {
            Cod_grado_academico: parseInt(document.getElementById('Cod_grado_academico').value),
            Cod_tipo_contrato: parseInt(document.getElementById('Cod_tipo_contrato').value),
            Hora_entrada: horaEntrada,
            Hora_salida: horaSalida,
            Fecha_ingreso: document.getElementById('Fecha_ingreso').value,
            Fecha_fin_contrato: document.getElementById('Fecha_fin_contrato').value || null,
            Años_experiencia: añosExperienciaNum
          };
          
          if (!window.isValidTimeFormat(horaEntrada) || !window.isValidTimeFormat(horaSalida)) {
            Swal.showValidationMessage('El formato de hora no es válido');
            return false;
          }
          
          // Validar que la hora de salida sea posterior a la hora de entrada
          const entrada = new Date(`2000-01-01T${horaEntrada}`);
          const salida = new Date(`2000-01-01T${horaSalida}`);
          
          if (salida <= entrada) {
            Swal.showValidationMessage('La hora de salida debe ser posterior a la hora de entrada');
            return false;
          }
          
          // Validar que la fecha de fin de contrato sea posterior a la fecha de ingreso si existe
          if (profesorData.Fecha_fin_contrato) {
            const fechaIngreso = new Date(profesorData.Fecha_ingreso);
            const fechaFin = new Date(profesorData.Fecha_fin_contrato);
            if (fechaFin <= fechaIngreso) {
              Swal.showValidationMessage('La fecha de fin de contrato debe ser posterior a la fecha de ingreso');
              return false;
            }
          }
        }
        
        // Lista base de campos requeridos
        const requiredFields = [
          'dni_persona', 
          'Nombre', 
          'Primer_apellido', 
          'correo_usuario',
          'cod_genero', 
          'Cod_nacionalidad'
        ];
        
        // Agregar campos de ubicación solo si es hondureño
        if (esHondureno) {
          requiredFields.push('cod_departamento', 'cod_municipio');
        }
        
        // Agregar campos requeridos de profesor si aplica
        if (roleType === 3) {
          requiredFields.push(
            'Cod_grado_academico',
            'Cod_tipo_contrato',
            'Hora_entrada',
            'Hora_salida',
            'Fecha_ingreso',
            'Años_experiencia'
          );
        }
    
        const emptyFields = requiredFields.filter(field => !document.getElementById(field).value);
    
        if (emptyFields.length > 0) {
          Swal.showValidationMessage('Por favor complete todos los campos marcados con *');
          return false;
        }
    
        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.correo_usuario)) {
          Swal.showValidationMessage('Por favor ingrese un correo electrónico válido');
          return false;
        }
    
        return {
          personData,
          userData,
          profesorData
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        
        Swal.fire({
          title: 'Creando usuario...',
          html: 'Se enviará un correo con las credenciales temporales',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        axios.post('http://localhost:4000/api/usuarios/crear-usuario', 
          result.value,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        .then(response => {
          Swal.fire({
            title: '¡Usuario Creado!',
            text: `Se ha enviado un correo a ${result.value.userData.correo_usuario} con las credenciales de acceso`,
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          fetchUsers();
          setShowUserMenu(false);
        })
        .catch(error => {
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.mensaje || 'Error al crear el usuario',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
      }
    });
  };

  // Nueva función para editar el rol de un usuario
  const handleEditRole = async (userId, currentRole, userName) => {
    // Validaciones para evitar que se modifiquen roles críticos
    if (parseInt(loggedInUserId) === userId) {
      Swal.fire({
        title: 'Error',
        text: 'No puedes cambiar tu propio rol.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
  
    // No permitir que los usuarios regulares editen roles de administradores o managers
    if ((currentRole === '2' || currentRole === '4') && loggedInUserRole !== '2') {
      Swal.fire({
        title: 'Error',
        text: 'No tienes permisos para modificar roles de administradores o managers.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      setProcessingUsers(prev => new Set(prev).add(userId));
      
      // Lista predefinida de roles
      const rolesList = [
        { Cod_rol: 1, Nom_rol: 'Padre', Descripcion: 'P' },
        { Cod_rol: 2, Nom_rol: 'Administrador', Descripcion: 'A' },
        { Cod_rol: 3, Nom_rol: 'Docente', Descripcion: 'D' },
        { Cod_rol: 4, Nom_rol: 'Manager', Descripcion: 'M' },
        // Puedes agregar más roles aquí si lo necesitas
      ];
  
      // Diálogo para seleccionar el nuevo rol
      const { value: newRole } = await Swal.fire({
        title: `Cambiar rol de ${userName}`,
        html: `
          <div class="form-group">
            <label for="new-role">Selecciona el nuevo rol:</label>
            <select id="new-role" class="swal2-select">
              ${rolesList.map(role => {
                // Si el usuario no es admin, no mostrar opciones de admin/manager
               
                return `<option value="${role.Cod_rol}" ${currentRole == role.Cod_rol ? 'selected' : ''}>
                  ${role.Nom_rol}
                </option>`;
              }).join('')}
            </select>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          return document.getElementById('new-role').value;
        }
      });
  
      if (!newRole || newRole === currentRole) {
        setProcessingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        return;
      }
  
      const response = await axios.put(
        'http://localhost:4000/api/usuarios/cambiar-rol',
        {
          userId: userId,
          newRoleId: newRole
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data && response.status === 200) {
        setUsers(prevUsers => prevUsers.map(user => 
          user.cod_usuario === userId ? { ...user, Cod_rol: newRole } : user
        ));
        
        Swal.fire({
          title: 'Éxito',
          text: 'Rol actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error('Error detallado:', error.response?.data);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.mensaje || 'Error al cambiar el rol del usuario',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const fetchUsers = async () => {
    setLoadingg(true);
    const token = localStorage.getItem('token');
  
    if (!token) {
      Swal.fire({
        title: 'Error',
        text: 'No se ha encontrado el token. Por favor, inicia sesión nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      setLoadingg(false);
      return;
    }
  
    try {
      const response = await axios.get('http://localhost:4000/api/usuarios/usuarios-con-nombre', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const userData = Array.isArray(response.data) ? response.data : [];
      setUsers(userData);
  
      if (!userData.length) {
        Swal.fire({
          title: 'Aviso',
          text: 'No se encontraron usuarios',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.mensaje || 'Error al cargar usuarios',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      setErrorMessage(error.response?.data?.mensaje || 'Error al cargar usuarios');
    } finally {
      setLoadingg(false);
    }
  };

  const handleDeleteUser = (user) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar a ${user.nombre_usuario}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:4000/api/usuarios/eliminar-usuario/${user.cod_usuario}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          Swal.fire('¡Eliminado!', 'El usuario fue eliminado correctamente.', 'success');
          fetchUsers();
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          Swal.fire('Error', 'Hubo un problema al eliminar el usuario.', 'error');
        }
      }
    });
  };
  
  const handleEditUser = async (user) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:4000/api/usuarios/usuario-completo/${user.cod_usuario}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data && response.data.usuario) {
        const usuarioData = response.data.usuario;
  
        Swal.fire({
          title: 'Editar Usuario',
          html: `
            <input id="Nombre" class="swal2-input" placeholder="Primer nombre" value="${usuarioData.Nombre || ''}">
            <input id="Segundo_nombre" class="swal2-input" placeholder="Segundo nombre" value="${usuarioData.Segundo_nombre || ''}">
            <input id="Primer_apellido" class="swal2-input" placeholder="Primer apellido" value="${usuarioData.Primer_apellido || ''}">
            <input id="Segundo_apellido" class="swal2-input" placeholder="Segundo apellido" value="${usuarioData.Segundo_apellido || ''}">
            <input id="dni_persona" class="swal2-input" placeholder="DNI" value="${usuarioData.dni_persona || ''}">
            <input id="correo_usuario" class="swal2-input" placeholder="Correo" value="${usuarioData.correo_usuario || ''}">
          `,
          confirmButtonText: 'Guardar cambios',
          showCancelButton: true,
          preConfirm: async () => {
            const updatedData = {
              cod_usuario: user.cod_usuario,
              personData: {
                Nombre: document.getElementById('Nombre')?.value.trim().toUpperCase() || '',
                Segundo_nombre: document.getElementById('Segundo_nombre')?.value.trim().toUpperCase() || '',
                Primer_apellido: document.getElementById('Primer_apellido')?.value.trim().toUpperCase() || '',
                Segundo_apellido: document.getElementById('Segundo_apellido')?.value.trim().toUpperCase() || '',
                dni_persona: document.getElementById('dni_persona')?.value.trim() || '',
                // ❌ Ya no mandamos cod_tipo_persona, direccion_persona, cod_departamento, etc.
              },
              userData: {
                correo_usuario: document.getElementById('correo_usuario')?.value.trim() || '',
              }
            };
          
            // Ahora haces el PUT normal
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:4000/api/usuarios/editar-usuario/${user.cod_usuario}`, updatedData, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
          }
          
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('¡Actualizado!', 'El usuario ha sido actualizado correctamente.', 'success');
            fetchUsers(); // Recargar la tabla
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      Swal.fire('Error', 'No se pudo cargar el usuario.', 'error');
    }
  };
  
  
  
  
  

  const handleStatusChange = async (userId, newStatus) => {
    // Prevent the current user from modifying their own status
    if (parseInt(loggedInUserId) === userId) {
      Swal.fire({
        title: 'Error',
        text: 'No puedes cambiar tu propio estado de privilegios.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Prevent administrators from modifying the status of other administrators
    if (loggedInUserRole === '2' && newStatus !== '2' && users.find(user => user.cod_usuario === userId)?.Cod_rol === '2') {
      Swal.fire({
        title: 'Error',
        text: 'No puedes cambiar el estado de otros administradores.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Prevent managers from modifying the status of other managers
    if (loggedInUserRole === '4' && newStatus !== '2' && users.find(user => user.cod_usuario === userId)?.Cod_rol === '4') {
      Swal.fire({
        title: 'Error',
        text: 'No puedes cambiar el estado de otros managers.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (processingUsers.has(userId)) {
      return;
    }

    const statusTexts = {
      1: 'activar',
      2: 'desactivar',
      3: 'suspender',
    };

    const { value: confirm } = await Swal.fire({
      title: `¿Estás seguro de que deseas ${statusTexts[newStatus]} este usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, estoy seguro',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire({
        title: 'Error',
        text: 'No se encontró el token de autenticación',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    try {
      setProcessingUsers(prev => new Set(prev).add(userId));

      const response = await axios.put(
        'http://localhost:4000/api/usuarios/cambiar-estado',
        {
          userId: userId,
          Cod_estado_usuario: newStatus,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.status === 200) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.cod_usuario === userId
              ? { ...user, Cod_estado_usuario: newStatus }
              : user
          )
        );
        Swal.fire({
          title: 'Éxito',
          text: 'Estado actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error('Error detallado:', error.response?.data);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.mensaje || 'Error al cambiar el estado del usuario',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 1:
        return <Shield className="status-icon active" size={18} />;
      case 2:
        return <ShieldOff className="status-icon inactive" size={18} />;
      case 3:
        return <AlertCircle className="status-icon suspended" size={18} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return 'Activo';
      case 2:
        return 'Inactivo';
      case 3:
        return 'Suspendido';
      default:
        return 'Desconocido';
    }
  };

  const getRoleText = (Cod_rol) => {
    switch (Cod_rol) {
      case 1:
        return 'Padre';
      case 2:
        return 'Administrador';
      case 3:
        return 'Docente';
      case 4:
        return 'Manager';
      default:
        return 'Desconocido';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.nombre_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.correo_electronico?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = statusFilter === 'all' || user.Cod_estado_usuario === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar los permisos. Por favor, intente nuevamente.
      </div>
    );
  }

  if (!canSelect) {
    return <AccessDenied />;
  }

  return (
    <div className="user-management">
      <div className="header">
        <div className="header-top">
          <h1>Gestión de Usuarios</h1>
          <button 
            className="btn btn-primary add-user-main"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <UserPlus size={20} className="me-2" />
            Agregar Usuario
          </button>
        </div>
        {/* Menú de tipos de usuario horizontal */}
        {showUserMenu && (
          <div className="user-types-horizontal">
            {userTypes
              .filter(type => {
                if (!canInsert) {
                  return type.id !== 2 && type.id !== 4;
                }
                return true;
              })
              .map((type) => (
                <button 
                  key={type.id}
                  className="user-type-button-horizontal"
                  onClick={() => handleAddUser(type.id)}
                >
                  <div className={`icon-wrapper ${type.color}`}>
                    <type.icon size={24} className="text-white" />
                  </div>
                  <div className="user-type-info">
                    <h3>{type.title}</h3>
                    <p>{type.description}</p>
                  </div>
                </button>
              ))}
          </div>
        )}

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="1">Activos</option>
              <option value="2">Inactivos</option>
              <option value="3">Suspendidos</option>
            </select>
            <ChevronDown size={20} className="select-icon" />
          </div>
        </div>
      </div>

      <div className="table-container">
        {loadingg ? (
          <div className="loading-message">Cargando usuarios...</div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.cod_usuario}>
                    <td className="user-cell">
                      <div className="user-info">
                      <span className="user-name">{user.nombre_completo || 'Nombre no disponible'}</span>
                      <span className="user-email">{user.correo_electronico}</span>
                      </div>
                    </td>
                    <td>
                      <div className="role-display">
                        <span>{getRoleText(user.Cod_rol)}</span>
                        {canUpdate && (
                          <button 
                            className="btn-edit-role" 
                            onClick={() => handleEditRole(user.cod_usuario, user.Cod_rol, user.nombre_usuario)}
                            disabled={processingUsers.has(user.cod_usuario)}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.Cod_estado_usuario}`}>
                        {getStatusIcon(user.Cod_estado_usuario)}
                        {getStatusText(user.Cod_estado_usuario)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className={`btn btn-activate ${(user.Cod_estado_usuario === 1 || processingUsers.has(user.cod_usuario) || ((user.Cod_rol === '2' || user.Cod_rol === '4') && (loggedInUserRole !== '2'))) ? 'disabled' : ''}`}
                          onClick={() => handleStatusChange(user.cod_usuario, 1)}
                          disabled={user.Cod_estado_usuario === 1 || processingUsers.has(user.cod_usuario) || ((user.Cod_rol === '2' || user.Cod_rol === '4') && (loggedInUserRole !== '2'))}
                        >
                          Activar
                        </button>
                        <button
                          className={`btn btn-deactivate ${(user.Cod_estado_usuario === 2 || processingUsers.has(user.cod_usuario) || ((user.Cod_rol === '2' || user.Cod_rol === '4') && (loggedInUserRole !== '2'))) ? 'disabled' : ''}`}
                          onClick={() => handleStatusChange(user.cod_usuario, 2)}
                          disabled={user.Cod_estado_usuario === 2 || processingUsers.has(user.cod_usuario) || ((user.Cod_rol === '2' || user.Cod_rol === '4') && (loggedInUserRole !== '2'))}
                        >
                          Bloquear
                        </button>
                        <button
                          className={`btn btn-suspend ${(user.Cod_estado_usuario === 3 || processingUsers.has(user.cod_usuario) || ((user.Cod_rol === '2' || user.Cod_rol === '4') && (loggedInUserRole !== '2'))) ? 'disabled' : ''}`}
                          onClick={() => handleStatusChange(user.cod_usuario, 3)}
                          disabled={user.Cod_estado_usuario === 3 || processingUsers.has(user.cod_usuario) || ((user.Cod_rol === '2' || user.Cod_rol === '4') && (loggedInUserRole !== '2'))}
                        >
                          Suspender
                        </button>
                      </div>
                    </td>

                    <td>
  <div className="action-buttons">
    <button
      className="btn btn-edit"
      onClick={() => handleEditUser(user)}
      disabled={processingUsers.has(user.cod_usuario)}
    >
      Editar
    </button>
    <button
      className="btn btn-delete"
      onClick={() => handleDeleteUser(user)}
      disabled={processingUsers.has(user.cod_usuario)}
    >
      Eliminar
    </button>
  </div>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="no-results-message">
                No se encontraron usuarios que coincidan con tu búsqueda.
              </div>
            )}
          </>
        )}
      </div>

      {/* Añadir CSS en línea para los nuevos estilos - Puede moverse a un archivo CSS externo */}
      <style jsx>{`
        /* Estilos para el menú horizontal de tipos de usuario */
        .user-types-horizontal {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 15px;
          margin-bottom: 20px;
          width: 100%;
          overflow-x: auto;
          padding-bottom: 10px;
        }
        
        .user-type-button-horizontal {
          display: flex;
          align-items: center;
          background-color: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 200px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .user-type-button-horizontal:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .user-type-button-horizontal .icon-wrapper {
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
        
        .user-type-button-horizontal .user-type-info {
          display: flex;
          flex-direction: column;
        }
        
        .user-type-button-horizontal .user-type-info h3 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .user-type-button-horizontal .user-type-info p {
          margin: 0;
          font-size: 0.75rem;
          color: #666;
        }

        /* Estilos para la edición de rol */
        .role-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-edit-role {
          background: none;
          border: none;
          color: #4a5568;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .btn-edit-role:hover {
          background-color: #edf2f7;
          color: #2d3748;
        }

        .btn-edit-role:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;