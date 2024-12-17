import{r as m,j as e}from"./index-SVRFFNc9.js";import{S as $}from"./sweetalert2.esm.all-D3pEHXw3.js";import{w as F}from"./sweetalert2-react-content.es-QMl1rtTe.js";import{C as H}from"./index.esm-DWwMdKxH.js";import{u as q}from"./usePermission-BCWksQX7.js";import V from"./AccessDenied-yaDW3Jao.js";import{c as J}from"./cil-search-CDkY_4k-.js";const ae=({pathName:A})=>{const{canSelect:j,canUpdate:X,canDelete:Y,canInsert:K,loading:Q,error:W}=q("rolesandpermissions"),[E,_]=m.useState(!0),[f,b]=m.useState([]),[k,P]=m.useState(!0);m.useState("");const[g,y]=m.useState(""),[c,p]=m.useState("general"),d=F($),x={1:"Padre",2:"Administrador",3:"Docente",4:"Manager"},S=[{id:"12",name:"Dashboard",description:"Página del tablero de control"},{id:"46",name:"Dashboard Padres",description:"Dashboard para padres"},{id:"47",name:"Lista Asistencia",description:"ListaAsistencia"},{id:"84",name:"Asistencia Profesor",description:"ListaAsistenciaProfesor"},{id:"85",name:"Notas Profesor",description:"ListaNotasProfesor"},{id:"87",name:"Notas",description:"ListaNotas"},{id:"88",name:"Grados-Asignaturas",description:"ListaGradosAsignaturas"},{id:"89",name:"Ponderaciones-Ciclos",description:"ListaPonderacionesCiclos"},{id:"48",name:"Lista Profesores",description:"Lista Profesores"},{id:"73",name:"Lista Historial",description:"Lista Historial"},{id:"74",name:"Actividades",description:"actividades"},{id:"77",name:"Matricula",description:"Matricula"},{id:"79",name:"Actividades Academicas Vista Admin",description:"ListaActividadesAca"},{id:"90",name:"Solicitudes Administrador",description:"Solicitud_admin"},{id:"91",name:"Solicitudes Padre",description:"Solicitudes_Padre"},{id:"93",name:"ListaSecciones Asignatura",description:"ListaSecciones"},{id:"94",name:"Lista Parametro",description:"ListaParametro"},{id:"95",name:"Cuadro Profesor",description:"ListaCuadroProfesor"},{id:"95",name:"Cuadro",description:"ListaCuadro"},{id:"103",name:"CuadroPadre",description:"ListaCuadroPadre"}],M=[{id:"71",name:"Libro Diario",description:"Libro Diario"}],R=[{id:"80",name:"Personas",description:"ListaPersonas"},{id:"69",name:"Lista Relacion",description:"Lista Relacion"},{id:"65",name:"Tipo persona",description:"tipo persona"},{id:"64",name:"Departamento",description:"departamento"},{id:"81",name:"Municipios",description:"Muinicipios"}],z=[{id:"45",name:"Admin. de Usuarios",description:"Gestión Usuarios"},{id:"72",name:"Roles y Permisos",description:"roles and permissions"}],G=[{id:"49",name:"Lista Estado nota",description:"Lista Estado nota"},{id:"50",name:"Lista Estructura",description:"Lista Estructura"},{id:"51",name:"Lista Asignaturas",description:"Lista Asignaturas"},{id:"52",name:"Lista Ciclos",description:"Lista Ciclos"},{id:"53",name:"Lista Especialidades",description:"Lista Especialidades"},{id:"54",name:"Lista Estado asistencia",description:"Lista Estado asistencia"},{id:"55",name:"Lista Grados",description:"Lista Grados"},{id:"56",name:"Lista Grado Academico",description:"Lista Grado Academico"},{id:"57",name:"Lista Parciales",description:"Lista Parciales"},{id:"58",name:"Lista Ponderaciones",description:"Lista Ponderaciones"},{id:"104",name:"Lista Institutos",description:"ListaInstitutos"},{id:"59",name:"Lista Tipo Contrato",description:"Lista Tipo Contrato"},{id:"60",name:"Tipo matrícula",description:"tipo matricula"},{id:"61",name:"Periodo matrícula",description:"periodo matricula"},{id:"62",name:"Estado matrícula",description:"estado matricula"},{id:"63",name:"Concepto pago",description:"concepto pago"},{id:"66",name:"Edificios",description:"edificios"},{id:"67",name:"Días",description:"dias"},{id:"68",name:"Lista Historico Proc",description:"Lista Historico Proc"},{id:"70",name:"Contabilidad",description:"Contabilidad"}],D=[{id:"Permiso_Modulo",name:"Módulo"},{id:"Permiso_Consultar",name:"Ver"},{id:"Permiso_Insercion",name:"Crear"},{id:"Permiso_Actualizacion",name:"Editar"},{id:"Permiso_Eliminacion",name:"Eliminar"},{id:"Permiso_Nav",name:"Mostrar en Nav"}],w=()=>{switch(c){case"mantenimiento":return G;case"pagos":return M;case"personas":return R;case"usuarios":return z;default:return S}},I=()=>{_(!1)},v=async()=>{try{const i=await fetch("http://74.50.68.87:4000/api/roles/permisos",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});if(!i.ok)throw new Error("Error al cargar los permisos");const n=await i.json(),t=T(n);b(t),P(!1)}catch(i){console.error("Error:",i),d.fire({icon:"error",title:"Error",text:"No se pudieron cargar los permisos"}),P(!1)}},T=i=>{const n=i.reduce((s,o)=>(s[o.Cod_Rol]||(s[o.Cod_Rol]=[]),s[o.Cod_Rol].push(o),s),{}),t=Object.keys(x).reduce((s,o)=>(s[o]||(s[o]=[]),s),{...n});return Object.entries(t).map(([s,o])=>{const u=w();return{id:parseInt(s),nombre:x[s]||`Rol ${s}`,rol:x[s]||`Rol ${s}`,permisos:u.reduce((a,h)=>{const r=o.find(L=>L.Cod_Objeto.toString()===h.id);return{...a,[h.id]:{Permiso_Modulo:(r==null?void 0:r.Permiso_Modulo)==="1",Permiso_Consultar:(r==null?void 0:r.Permiso_Consultar)==="1",Permiso_Insercion:(r==null?void 0:r.Permiso_Insercion)==="1",Permiso_Actualizacion:(r==null?void 0:r.Permiso_Actualizacion)==="1",Permiso_Eliminacion:(r==null?void 0:r.Permiso_Eliminacion)==="1",Permiso_Nav:(r==null?void 0:r.Permiso_Nav)==="1"}}},{})}})};m.useEffect(()=>{v()},[c]);const N=async(i,n,t)=>{try{const s=f.find(l=>l.id===i);if(!s)throw new Error("Usuario no encontrado");const o=s.permisos[n];if(!o)throw new Error("Permisos del objeto no encontrados");const u=o[t],a={};if(t==="Permiso_Modulo")u?(a.Permiso_Modulo="0",a.Permiso_Consultar="0",a.Permiso_Insercion="0",a.Permiso_Actualizacion="0",a.Permiso_Eliminacion="0"):a.Permiso_Modulo="1";else if(t==="Permiso_Nav")a.Permiso_Nav=u?"0":"1";else{if(!o.Permiso_Modulo){d.fire({icon:"warning",title:"Advertencia",text:"Debe activar primero el permiso del módulo"});return}a.Permiso_Modulo=o.Permiso_Modulo?"1":"0",a.Permiso_Consultar=o.Permiso_Consultar?"1":"0",a.Permiso_Insercion=o.Permiso_Insercion?"1":"0",a.Permiso_Actualizacion=o.Permiso_Actualizacion?"1":"0",a.Permiso_Eliminacion=o.Permiso_Eliminacion?"1":"0",a.Permiso_Nav=o.Permiso_Nav?"1":"0",a[t]=u?"0":"1"}const h={Cod_Objeto:parseInt(n),Cod_Rol:i,...a};console.log("Enviando actualización:",h);const r=await fetch(`http://74.50.68.87:4000/api/roles/permisos/estado/${t}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:JSON.stringify(h)});if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);const L=await r.json();b(f.map(l=>l.id===i?{...l,permisos:{...l.permisos,[n]:{...l.permisos[n],...a}}}:l)),d.fire({icon:"success",title:"Éxito",text:"Permiso actualizado correctamente",timer:1500,showConfirmButton:!1})}catch(s){console.error("Error:",s),d.fire({icon:"error",title:"Error",text:s.message||"No se pudo actualizar el permiso"})}},B=async()=>{try{(await d.fire({title:"¿Guardar cambios?",text:"¿Estás seguro de que quieres guardar los cambios en los permisos?",icon:"warning",showCancelButton:!0,confirmButtonColor:"#4CAF50",cancelButtonColor:"#d33",confirmButtonText:"Guardar",cancelButtonText:"Cancelar"})).isConfirmed&&(await v(),d.fire({icon:"success",title:"¡Cambios Guardados!",text:"Los cambios en los permisos han sido guardados.",timer:2e3,showConfirmButton:!1}))}catch(i){console.error("Error:",i),d.fire({icon:"error",title:"Error",text:"No se pudieron guardar los cambios"})}},U=f.filter(i=>i.nombre.toLowerCase().includes(g.toLowerCase())||i.rol.toLowerCase().includes(g.toLowerCase())),C=w();return k?e.jsx("div",{className:"loader-container",children:e.jsx("div",{className:"loader"})}):j?e.jsxs("div",{className:"permisos-container",children:[e.jsx("style",{children:`
          .permisos-container {
            padding: 2rem;
            max-width: 100%;
            margin: 0 auto;
          }

          .warning-message {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 0.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .close-button {
            background: none;
            border: none;
            color: #856404;
            cursor: pointer;
            padding: 0.5rem;
          }

          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .title-section h1 {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2d3748;
            margin: 0;
          }

          .title-section p {
            color: #718096;
            margin-top: 0.5rem;
          }

          .control-section {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .search-container {
            position: relative;
            width: 300px;
          }

          .search-input {
            width: 100%;
            padding: 0.5rem 1rem 0.5rem 2.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
          }

          .search-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #718096;
          }

          .view-toggle {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .view-button {
            padding: 0.75rem 1.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            background-color: white;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
            font-weight: 500;
          }

          .view-button.active {
            background-color: #4CAF50;
            color: white;
            border-color: #4CAF50;
          }

          .save-button {
            padding: 0.75rem 1.5rem;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-weight: 600;
          }

          .save-button:hover {
            background-color: #45a049;
          }

          .table-container {
            overflow-x: auto;
            margin-top: 1rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .permisos-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px;
          }

          .permisos-table th,
          .permisos-table td {
            padding: 1rem;
            border: 1px solid #e2e8f0;
          }

          .permisos-table th {
            background-color: #f8fafc;
            font-weight: 600;
            text-align: left;
            color: #4a5568;
          }

          .user-cell {
            background-color: #f8fafc;
            min-width: 200px;
          }

          .user-name {
            font-weight: 600;
            color: #2d3748;
            margin: 0;
          }

          .user-role {
            color: #718096;
            font-size: 0.875rem;
            margin: 0;
          }

          .permission-cell {
            min-width: 150px;
          }

          .permission-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .permission-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .permission-label {
            color: #718096;
            font-size: 0.875rem;
          }

          .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
          }

          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 20px;
          }

          .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }

          input:checked + .slider {
            background-color: #4CAF50;
          }

          input:checked + .slider:before {
            transform: translateX(20px);
          }

          @media (max-width: 768px) {
            .control-section {
              flex-direction: column;
            }
            
            .search-container {
              width: 100%;
            }

            .view-toggle {
              width: 100%;
            }

            .view-button {
              flex: 1;
            }
          }
        `}),E&&e.jsxs("div",{className:"warning-message",children:[e.jsx("span",{children:"ADVERTENCIA: MODIFICAR ALGO EN ESTA PÁGINA AFECTARÁ LOS PERMISOS DE OTROS USUARIOS."}),e.jsx("button",{onClick:I,className:"close-button",children:"×"})]}),e.jsxs("div",{className:"header-container",children:[e.jsxs("div",{className:"title-section",children:[e.jsx("h1",{children:A}),e.jsx("p",{children:"Gestión de permisos por módulo y rol"})]}),e.jsxs("div",{className:"control-section",children:[e.jsxs("div",{className:"search-container",children:[e.jsx(H,{icon:J,className:"search-icon"}),e.jsx("input",{type:"text",placeholder:"Buscar por rol...",value:g,onChange:i=>y(i.target.value),className:"search-input"})]}),e.jsxs("div",{className:"view-toggle",children:[e.jsx("button",{className:`view-button ${c==="general"?"active":""}`,onClick:()=>p("general"),children:"General"}),e.jsx("button",{className:`view-button ${c==="mantenimiento"?"active":""}`,onClick:()=>p("mantenimiento"),children:"Mantenimiento"}),e.jsx("button",{className:`view-button ${c==="pagos"?"active":""}`,onClick:()=>p("pagos"),children:"Pagos y Finanzas"}),e.jsx("button",{className:`view-button ${c==="personas"?"active":""}`,onClick:()=>p("personas"),children:"Personas"}),e.jsx("button",{className:`view-button ${c==="usuarios"?"active":""}`,onClick:()=>p("usuarios"),children:"Usuarios"})]}),e.jsx("button",{className:"save-button",onClick:B,children:"Guardar Cambios"})]})]}),e.jsx("div",{className:"table-container",children:e.jsxs("table",{className:"permisos-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"user-cell",children:"Usuario"}),C.map(i=>e.jsx("th",{className:"permission-cell",title:i.description,children:i.name},i.id))]})}),e.jsx("tbody",{children:U.map(i=>{var n;return e.jsxs("tr",{children:[e.jsx("td",{className:"user-cell",children:e.jsxs("div",{className:"user-info-container",children:[e.jsxs("div",{className:"user-info-header",children:[e.jsx("p",{className:"user-name",children:i.nombre}),e.jsx("p",{className:"user-role",children:i.rol})]}),e.jsxs("div",{className:"sidebar-permission",children:[e.jsx("span",{className:"permission-label",children:"Mostrar en el Nav"}),e.jsxs("label",{className:"switch",children:[e.jsx("input",{type:"checkbox",checked:((n=i.permisos.global)==null?void 0:n.Permiso_Nav)||!1,onChange:()=>N(i.id,"global","Permiso_Nav")}),e.jsx("span",{className:"slider"})]})]})]})}),C.map(t=>e.jsx("td",{className:"permission-cell",children:e.jsx("div",{className:"permission-group",children:D.map(s=>{var o;return e.jsxs("div",{className:"permission-row",children:[e.jsx("span",{className:"permission-label",children:s.name}),e.jsxs("label",{className:"switch",children:[e.jsx("input",{type:"checkbox",checked:((o=i.permisos[t.id])==null?void 0:o[s.id])||!1,onChange:()=>N(i.id,t.id,s.id)}),e.jsx("span",{className:"slider"})]})]},s.id)})})},t.id))]},i.id)})})]})})]}):e.jsx(V,{})};export{ae as default};
