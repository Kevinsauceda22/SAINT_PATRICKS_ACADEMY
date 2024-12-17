import{r as d,x as ve,j as o,h as M,i as $}from"./index-SVRFFNc9.js";import{C as p}from"./index.esm-DWwMdKxH.js";import{S as n}from"./sweetalert2.esm.all-D3pEHXw3.js";import{l as Ae}from"./logo_saint_patrick-xw7Wl8f3.js";import{E as _e}from"./jspdf.plugin.autotable-gke1D7B3.js";import{u as I,w as Be}from"./xlsx-lwdk4T0U.js";import{u as Ne}from"./usePermission-BCWksQX7.js";import ze from"./AccessDenied-yaDW3Jao.js";import{C as Re}from"./CContainer-BdNP0s3v.js";import{C as re,a as A}from"./CRow-Bf67u6lu.js";import{a as l}from"./CButton-D9GPTbB6.js";import{c as Le}from"./cil-plus-D8mtC-W5.js";import{C as Me,a as $e,b as Ie,c as te}from"./CDropdownToggle-DlfIUTmX.js";import{c as Fe}from"./cil-description-MUzg6O3n.js";import{c as Ue}from"./cil-file-CeQgYs_D.js";import{c as He}from"./cil-spreadsheet-CJUvf_vM.js";import{C as _}from"./CInputGroup-D-McUFva.js";import{C as F}from"./CInputGroupText-Cfu0fzaY.js";import{c as Oe}from"./cil-search-CDkY_4k-.js";import{C as U}from"./CFormInput-B_gylY64.js";import{c as Ve}from"./cil-brush-alt-CV61lKqC.js";import{C as We}from"./CFormSelect-CzT7g5tb.js";import{C as Ge,a as qe,b as ne,c as H,d as Je,e as O}from"./CTable-98qqrSRH.js";import{c as ae}from"./cil-pen-53d2I-C-.js";import{c as ie}from"./cil-trash-CBbKHhHb.js";import{C as Ye}from"./CPagination-UopCEeNZ.js";import{C as V,a as W,b as G,c as q}from"./CModalHeader-Bhtr3bZe.js";import{C as J}from"./CModalTitle-M2mBvD_5.js";import{C as se}from"./CForm-CYRkMwLo.js";import{c as Ze}from"./cil-save-CHBg7z_U.js";import"./CConditionalPortal-DwBsYzTA.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";import"./CBackdrop-BbuVwMMD.js";const Ro=()=>{const{canSelect:ce,loading:Ke,error:Qe,canDelete:le,canInsert:de,canUpdate:pe}=Ne("ListaPonderaciones"),[B,ue]=d.useState([]),[me,y]=d.useState(!1),[xe,w]=d.useState(!1),[ge,k]=d.useState(!1),[h,Y]=d.useState(""),[u,N]=d.useState({}),[z,Z]=d.useState({}),[f,he]=d.useState(5),[K,Q]=d.useState(""),[C,T]=d.useState(1),S=d.useRef(null),[fe,x]=d.useState(!1);d.useEffect(()=>{E();const e=localStorage.getItem("token");if(e)try{const t=ve(e);console.log("Token decodificado:",t)}catch(t){console.error("Error al decodificar el token:",t)}},[]);const E=async()=>{try{const r=(await(await fetch("http://74.50.68.87:4000/api/ponderaciones/verPonderaciones")).json()).map((i,a)=>({...i,originalIndex:a+1}));ue(r)}catch(e){console.error("Error al obtener las Ponderaciones:",e)}},Ce=()=>{const e=typeof h=="string"?h:h.Descripcion_ponderacion;return!e||e.trim()===""?(n.fire({icon:"error",title:"Error",text:'El campo "Descripción de la Ponderación no puede estar vacío',confirmButtonText:"Aceptar"}),!1):B.some(r=>r.Descripcion_ponderacion.trim().toLowerCase()===e.trim().toLowerCase())?(n.fire({icon:"error",title:"Error",text:`La ponderación "${e}" ya existe`,confirmButtonText:"Aceptar"}),!1):!0},be=()=>u.Descripcion_ponderacion?B.some(t=>t.Descripcion_ponderacion.trim().toLowerCase()===u.Descripcion_ponderacion.trim().toLowerCase()&&t.Cod_ponderacion!==u.Cod_ponderacion)?(n.fire({icon:"error",title:"Error",text:`La ponderación "${u.Descripcion_ponderacion}" ya existe`,confirmButtonText:"Aceptar"}),!1):!0:(n.fire({icon:"error",title:"Error",text:'El campo "Descripción de la Ponderación" no puede estar vacío',confirmButtonText:"Aceptar"}),!1),je=()=>{if(!j||j.length===0){n.fire({icon:"info",title:"Tabla vacía",text:"No hay datos disponibles para generar el reporte.",confirmButtonText:"Aceptar"});return}const e=new _e,t=new Image;t.src=Ae,t.onload=()=>{e.addImage(t,"PNG",10,10,30,30);let r=20;e.setFontSize(18),e.setTextColor(0,102,51),e.text("SAINT PATRICK'S ACADEMY",e.internal.pageSize.width/2,r,{align:"center"}),r+=12,e.setFontSize(16),e.text("Reporte de Ponderaciones",e.internal.pageSize.width/2,r,{align:"center"}),r+=10,e.setFontSize(10),e.setTextColor(100),e.text("Casa Club del periodista, Colonia del Periodista",e.internal.pageSize.width/2,r,{align:"center"}),r+=4,e.text("Teléfono: (504) 2234-8871",e.internal.pageSize.width/2,r,{align:"center"}),r+=4,e.text("Correo: info@saintpatrickacademy.edu",e.internal.pageSize.width/2,r,{align:"center"}),r+=6,e.setLineWidth(.5),e.setDrawColor(0,102,51),e.line(10,r,e.internal.pageSize.width-10,r);const i=e.internal.pageSize.height;e.autoTable({startY:r+4,head:[["#","Descripción de Ponderación"]],body:j.map((c,s)=>[c.originalIndex||s+1,c.Descripcion_ponderacion]),headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10},styles:{fontSize:10,cellPadding:3,halign:"center"},columnStyles:{0:{cellWidth:"auto"},1:{cellWidth:"auto"}},alternateRowStyles:{fillColor:[240,248,255]},didDrawPage:c=>{const s=new Date,g=`${s.toLocaleDateString()} ${s.toLocaleTimeString()}`,b=e.internal.pageSize.height;e.setFontSize(10),e.setTextColor(100),e.text(`Fecha y hora de generación: ${g}`,10,b-10)}});const a=e.internal.getNumberOfPages(),m=e.internal.pageSize.width;for(let c=1;c<=a;c++){e.setPage(c),e.setTextColor(100);const s=`Página ${c} de ${a}`;e.text(s,m-30,i-10)}window.open(e.output("bloburl"),"_blank")},t.onerror=()=>{console.warn("No se pudo cargar el logo. El PDF se generará sin el logo."),window.open(e.output("bloburl"),"_blank")}},ye=()=>{const e=[["Saint Patrick Academy"],["Reporte de Ponderaciones"],[`Fecha de generación: ${new Date().toLocaleDateString()}`],[]];e.push(["#","Descripción de Ponderación"]);const t=j.map((s,g)=>[s.originalIndex||g+1,s.Descripcion_ponderacion]),r=[...e,...t],i=I.aoa_to_sheet(r),a=[{wpx:50},{wpx:280}];i["!cols"]=a;const m=I.book_new();I.book_append_sheet(m,i,"Reporte de Ponderaciones");const c=`reporte_ponderaciones_${new Date().toLocaleDateString().replace(/\//g,"-")}.xlsx`;Be(m,c)},X=(e,t)=>{const r=e.target,i=r.selectionStart;let a=r.value.toUpperCase().trimStart();const m=/^[A-Za-z0-9Ññ\s]*$/;if(/\s{2,}/.test(a)&&(n.fire({icon:"warning",title:"Espacios múltiples",text:"No se permite más de un espacio entre palabras.",confirmButtonText:"Aceptar"}),a=a.replace(/\s+/g," ")),!m.test(a)){n.fire({icon:"warning",title:"Caracteres no permitidos",text:"Solo se permiten letras y espacios.",confirmButtonText:"Aceptar"});return}const c=a.split(" ");for(let s of c){const g={};for(let b of s)if(g[b]=(g[b]||0)+1,g[b]>4){n.fire({icon:"warning",title:"Repetición de letras",text:`La letra "${b}" se repite más de 4 veces en la palabra "${s}".`,confirmButtonText:"Aceptar"});return}}r.value=a,t(a),x(!0),requestAnimationFrame(()=>{S.current&&S.current.setSelectionRange(i,i)})},P=e=>{e.preventDefault(),n.fire({icon:"warning",title:"Acción bloqueada",text:"Copiar y pegar no está permitido.",confirmButtonText:"Aceptar"})},D=(e,t)=>{fe?n.fire({title:"¿Estás seguro?",text:"Si cierras este formulario, perderás todos los datos ingresados.",icon:"warning",showCancelButton:!0,confirmButtonText:"Sí, cerrar",cancelButtonText:"Cancelar"}).then(r=>{r.isConfirmed&&(e(!1),t(),x(!1))}):(e(!1),t(),x(!1))},R=()=>Y(""),L=()=>N(""),we=async()=>{if(Ce())try{const e=localStorage.getItem("token");if(console.log("Token obtenido:",e),!e){n.fire("Error","No tienes permiso para realizar esta acción","error");return}if((await fetch("http://74.50.68.87:4000/api/ponderaciones/crearPonderacion",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({Descripcion_ponderacion:h})})).ok){const r=M(e);if(console.log("Token decodificado:",r),!r.cod_usuario)throw console.error("No se pudo obtener el código de usuario del token"),new Error("No se pudo obtener el código de usuario del token");const i=`El usuario: ${r.nombre_usuario} ha creado una nueva ponderación: ${h}`,a=await $.post("http://74.50.68.87:4000/api/bitacora/registro",{cod_usuario:r.cod_usuario,cod_objeto:58,accion:"INSERT",descripcion:i},{headers:{Authorization:`Bearer ${e}`}});console.log("Respuesta de registro en bitácora:",a),a.status>=200&&a.status<300?(console.log("Registro en bitácora exitoso"),n.fire({icon:"success",title:"¡Éxito!",text:"La ponderación se ha creado correctamente",confirmButtonText:"Aceptar"}),E(),y(!1),R(),x(!1)):n.fire("Error","No se pudo registrar la acción en la bitácora","error")}else n.fire({icon:"error",title:"Error",text:"Hubo un problema al crear la ponderación",confirmButtonText:"Aceptar"})}catch(e){console.error("Error al crear la ponderación:",e),n.fire({icon:"error",title:"Error",text:"Hubo un problema al crear la ponderación",confirmButtonText:"Aceptar"})}},ke=async()=>{if(be())try{const e=localStorage.getItem("token");if(console.log("Token obtenido:",e),!e){n.fire("Error","No tienes permiso para realizar esta acción","error");return}if((await fetch("http://74.50.68.87:4000/api/ponderaciones/actualizarPonderacion",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({Cod_ponderacion:u.Cod_ponderacion,Descripcion_ponderacion:u.Descripcion_ponderacion})})).ok){const r=M(e);if(console.log("Token decodificado:",r),!r.cod_usuario)throw console.error("No se pudo obtener el código de usuario del token"),new Error("No se pudo obtener el código de usuario del token");const i=`El usuario: ${r.nombre_usuario} ha actualizado la ponderación: ${u.Descripcion_ponderacion} `,a=await $.post("http://74.50.68.87:4000/api/bitacora/registro",{cod_usuario:r.cod_usuario,cod_objeto:58,accion:"UPDATE",descripcion:i},{headers:{Authorization:`Bearer ${e}`}});console.log("Respuesta de registro en bitácora:",a),a.status>=200&&a.status<300?(console.log("Registro en bitácora exitoso"),n.fire({icon:"success",title:"¡Éxito!",text:"La ponderación se ha actualizado correctamente",confirmButtonText:"Aceptar"}),E(),w(!1),L(),x(!1)):n.fire("Error","No se pudo registrar la acción en la bitácora","error")}else n.fire({icon:"error",title:"Error",text:"Hubo un problema al actualizar la ponderación",confirmButtonText:"Aceptar"})}catch(e){console.error("Error al actualizar la ponderación:",e),n.fire({icon:"error",title:"Error",text:"Hubo un problema al actualizar la ponderación",confirmButtonText:"Aceptar"})}},Te=async()=>{try{const e=localStorage.getItem("token");if(console.log("Token obtenido:",e),!e){n.fire("Error","No tienes permiso para realizar esta acción","error");return}const t=await fetch("http://74.50.68.87:4000/api/ponderaciones/eliminarPonderacion",{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({Cod_ponderacion:z.Cod_ponderacion})});if(t.ok){const r=M(e);if(console.log("Token decodificado:",r),!r.cod_usuario)throw console.error("No se pudo obtener el código de usuario del token"),new Error("No se pudo obtener el código de usuario del token");const i=`El usuario: ${r.nombre_usuario} ha eliminado la ponderación: ${z.Descripcion_ponderacion}`,a=await $.post("http://74.50.68.87:4000/api/bitacora/registro",{cod_usuario:r.cod_usuario,cod_objeto:58,accion:"DELETE",descripcion:i},{headers:{Authorization:`Bearer ${e}`}});console.log("Respuesta de registro en bitácora:",a),a.status>=200&&a.status<300?(console.log("Registro en bitácora exitoso"),n.fire({icon:"success",title:"¡Éxito!",text:"La ponderación se ha eliminado correctamente",confirmButtonText:"Aceptar"}),E(),k(!1),Z({})):n.fire("Error","No se pudo registrar la acción en la bitácora","error")}else(await t.json()).error==="La ponderación ya pertenece a un grado"?n.fire({icon:"error",title:"Error",text:"La ponderación ya pertenece a un grado",confirmButtonText:"Aceptar"}):n.fire({icon:"error",title:"Error",text:"Hubo un problema al eliminar la ponderación",confirmButtonText:"Aceptar"})}catch(e){console.error("Error al eliminar la ponderación:",e),n.fire({icon:"error",title:"Error",text:"Hubo un problema al eliminar la ponderación",confirmButtonText:"Aceptar"})}},Se=e=>{N(e),w(!0),x(!1)},Ee=e=>{Z(e),k(!0)},Pe=e=>{let r=e.target.value.toUpperCase().trimStart();const i=/^[A-ZÑÁÉÍÓÚ0-9\s,]*$/;if(/\s{2,}/.test(r)&&(n.fire({icon:"warning",title:"Espacios múltiples",text:"No se permite más de un espacio entre palabras.",confirmButtonText:"Aceptar"}),r=r.replace(/\s+/g," ")),!i.test(r)){n.fire({icon:"warning",title:"Caracteres no permitidos",text:"Solo se permiten letras, números y espacios.",confirmButtonText:"Aceptar"});return}const a=r.split(" ");for(let m of a){const c={};for(let s of m)if(c[s]=(c[s]||0)+1,c[s]>4){n.fire({icon:"warning",title:"Repetición de letras",text:`La letra "${s}" se repite más de 4 veces en la palabra "${m}".`,confirmButtonText:"Aceptar"});return}}Q(r),T(1)},v=B.filter(e=>e.Descripcion_ponderacion.toLowerCase().includes(K.toLowerCase())),ee=C*f,De=ee-f,j=v.slice(De,ee),oe=e=>{e>0&&e<=Math.ceil(v.length/f)&&T(e)};return ce?o.jsxs(Re,{children:[o.jsxs(re,{className:"align-items-center mb-5",children:[o.jsx(A,{xs:"12",md:"9",children:o.jsx("h1",{className:"mb-0",children:"Mantenimiento Ponderaciones"})}),o.jsxs(A,{xs:"12",md:"3",className:"text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center",children:[de&&o.jsxs(l,{className:"mb-3 mb-md-0 me-md-3 gap-1 rounded shadow",style:{backgroundColor:"#4B6251",color:"white",transition:"all 0.3s ease",height:"40px",width:"auto",minWidth:"100px",padding:"0 16px",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#3C4B43",e.currentTarget.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#4B6251",e.currentTarget.style.boxShadow="none"},onClick:()=>{y(!0),x(!1)},children:[o.jsx(p,{icon:Le})," Nuevo"]}),o.jsxs(Me,{className:"btn-sm d-flex align-items-center gap-1 rounded shadow",children:[o.jsxs($e,{style:{backgroundColor:"#6C8E58",color:"white",cursor:"pointer",transition:"all 0.3s ease"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#5A784C",e.currentTarget.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#6C8E58",e.currentTarget.style.boxShadow="none"},children:[o.jsx(p,{icon:Fe})," Reporte"]}),o.jsxs(Ie,{style:{position:"absolute",zIndex:1050,backgroundColor:"#fff",boxShadow:"0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius:"4px",overflow:"hidden"},children:[o.jsxs(te,{onClick:je,style:{cursor:"pointer",outline:"none",backgroundColor:"transparent",padding:"0.5rem 1rem",fontSize:"0.85rem",color:"#333",borderBottom:"1px solid #eaeaea",transition:"background-color 0.1s"},onMouseOver:e=>e.target.style.backgroundColor="#f5f5f5",onMouseOut:e=>e.target.style.backgroundColor="transparent",children:[o.jsx(p,{icon:Ue,size:"sm"})," Abrir en PDF"]}),o.jsxs(te,{onClick:ye,style:{cursor:"pointer",outline:"none",backgroundColor:"transparent",padding:"0.5rem 1rem",fontSize:"0.85rem",color:"#333",transition:"background-color 0.3s"},onMouseOver:e=>e.target.style.backgroundColor="#f5f5f5",onMouseOut:e=>e.target.style.backgroundColor="transparent",children:[o.jsx(p,{icon:He,size:"sm"})," Descargar Excel"]})]})]})]})]}),o.jsxs(re,{className:"align-items-center mt-4 mb-2",children:[o.jsx(A,{xs:"12",md:"8",className:"d-flex flex-wrap align-items-center",children:o.jsxs(_,{className:"me-3",style:{width:"400px"},children:[o.jsx(F,{children:o.jsx(p,{icon:Oe})}),o.jsx(U,{placeholder:"Buscar ponderacion...",onChange:Pe,value:K}),o.jsxs(l,{style:{border:"1px solid #ccc",transition:"all 0.1s ease-in-out",backgroundColor:"#F3F4F7",color:"#343a40"},onClick:()=>{Q(""),T(1)},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#E0E0E0",e.currentTarget.style.color="black"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#F3F4F7",e.currentTarget.style.color="#343a40"},children:[o.jsx(p,{icon:Ve})," Limpiar"]})]})}),o.jsx(A,{xs:"12",md:"4",className:"text-md-end mt-2 mt-md-0",children:o.jsx(_,{className:"mt-2 mt-md-0",style:{width:"auto",display:"inline-block"},children:o.jsxs("div",{className:"d-inline-flex align-items-center",children:[o.jsx("span",{children:"Mostrar "}),o.jsxs(We,{style:{width:"80px",display:"inline-block",textAlign:"center"},onChange:e=>{const t=Number(e.target.value);he(t),T(1)},value:f,children:[o.jsx("option",{value:"5",children:"5"}),o.jsx("option",{value:"10",children:"10"}),o.jsx("option",{value:"20",children:"20"})]}),o.jsx("span",{children:" registros"})]})})})]}),o.jsx("div",{className:"table-container",style:{maxHeight:"400px",overflowY:"scroll",marginBottom:"20px"},children:o.jsxs(Ge,{striped:!0,bordered:!0,hover:!0,children:[o.jsx(qe,{children:o.jsxs(ne,{children:[o.jsx(H,{style:{width:"50px"},children:"#"}),o.jsx(H,{style:{width:"50px"},children:"Descripcion de la Ponderacion"}),o.jsx(H,{style:{width:"50px"},children:"Acciones"})]})}),o.jsx(Je,{children:j.map(e=>o.jsxs(ne,{children:[o.jsx(O,{children:e.originalIndex}),o.jsx(O,{children:e.Descripcion_ponderacion}),o.jsxs(O,{children:[pe&&o.jsx(l,{style:{backgroundColor:"#F9B64E",marginRight:"10px"},onClick:()=>Se(e),children:o.jsx(p,{icon:ae})}),le&&o.jsx(l,{style:{backgroundColor:"#E57368",marginRight:"10px"},onClick:()=>Ee(e),children:o.jsx(p,{icon:ie})})]})]},e.Cod_ponderacion))})]})}),o.jsxs("div",{className:"pagination-container",style:{display:"flex",justifyContent:"center",alignItems:"center"},children:[o.jsxs(Ye,{"aria-label":"Page navigation",children:[o.jsx(l,{style:{backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:C===1,onClick:()=>oe(C-1),children:"Anterior"}),o.jsx(l,{style:{marginLeft:"10px",backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:C===Math.ceil(v.length/f),onClick:()=>oe(C+1),children:"Siguiente"})]}),o.jsxs("span",{style:{marginLeft:"10px"},children:["Página ",C," de ",Math.ceil(v.length/f)]})]}),o.jsxs(V,{visible:me,backdrop:"static",children:[o.jsxs(W,{closeButton:!1,children:[o.jsx(J,{children:"Nueva Ponderación"}),o.jsx(l,{className:"btn-close","aria-label":"Close",onClick:()=>D(y,R)})]}),o.jsx(G,{children:o.jsx(se,{children:o.jsxs(_,{className:"mb-3",children:[o.jsx(F,{children:"Descripción de la Ponderación"}),o.jsx(U,{ref:S,type:"text",placeholder:"Ingrese una descripción de la ponderación",maxLength:50,onPaste:P,onCopy:P,value:h,onChange:e=>X(e,Y)})]})})}),o.jsxs(q,{children:[o.jsx(l,{color:"secondary",onClick:()=>D(y,R),children:"Cancelar"}),o.jsxs(l,{style:{backgroundColor:"#4B6251",color:"white"},onClick:we,onMouseEnter:e=>e.currentTarget.style.backgroundColor="#3C4B43",onMouseLeave:e=>e.currentTarget.style.backgroundColor="#4B6251",children:[o.jsx(p,{icon:Ze,style:{marginRight:"5px"}}),"Guardar"]})]})]}),o.jsxs(V,{visible:xe,backdrop:"static",children:[o.jsxs(W,{closeButton:!1,children:[o.jsx(J,{children:"Actualizar Ponderación"}),o.jsx(l,{className:"btn-close","aria-label":"Close",onClick:()=>D(w,L)})]}),o.jsx(G,{children:o.jsx(se,{children:o.jsxs(_,{className:"mb-3",children:[o.jsx(F,{children:"Descripción de la Ponderación"}),o.jsx(U,{ref:S,maxLength:50,onPaste:P,onCopy:P,placeholder:"Ingrese la nueva descripción de la ponderación",value:u.Descripcion_ponderacion,onChange:e=>X(e,t=>N({...u,Descripcion_ponderacion:t}))})]})})}),o.jsxs(q,{children:[o.jsx(l,{color:"secondary",onClick:()=>D(w,L),children:"Cancelar"}),o.jsxs(l,{style:{backgroundColor:"#F9B64E",color:"white"},onClick:ke,children:[o.jsx(p,{icon:ae,style:{marginRight:"5px"}})," Actualizar"]})]})]}),o.jsxs(V,{visible:ge,onClose:()=>k(!1),backdrop:"static",children:[o.jsx(W,{children:o.jsx(J,{children:"Confirmar Eliminación"})}),o.jsx(G,{children:o.jsxs("p",{children:["¿Estás seguro de que deseas eliminar la ponderacion:  ",o.jsx("strong",{children:z.Descripcion_ponderacion}),"?"]})}),o.jsxs(q,{children:[o.jsx(l,{color:"secondary",onClick:()=>k(!1),children:"Cancelar"}),o.jsxs(l,{style:{backgroundColor:"#E57368",color:"white"},onClick:Te,children:[o.jsx(p,{icon:ie,style:{marginRight:"5px"}}),"Eliminar"]})]})]})]}):o.jsx(ze,{})};export{Ro as default};
