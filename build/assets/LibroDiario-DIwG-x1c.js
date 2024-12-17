import{r as s,j as e}from"./index-SVRFFNc9.js";import{E as le}from"./jspdf.plugin.autotable-gke1D7B3.js";import{S as g}from"./sweetalert2.esm.all-D3pEHXw3.js";import{l as ie}from"./logo_saint_patrick-xw7Wl8f3.js";import{u as ce}from"./usePermission-BCWksQX7.js";import de from"./AccessDenied-yaDW3Jao.js";import{C as me}from"./circle-alert-DxKZfK3F.js";import{C as he}from"./check-CzPZpIZL.js";import{c as S}from"./createLucideIcon-CPQyE5BK.js";import{C as q}from"./calendar-D8_5m5mg.js";import{F as W}from"./file-text-Clyuk29C.js";import{R as ue}from"./refresh-cw-O16dAa9U.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=S("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=S("Filter",[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=S("List",[["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 18h.01",key:"1tta3j"}],["path",{d:"M3 6h.01",key:"1rqtza"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 18h13",key:"1lx6n3"}],["path",{d:"M8 6h13",key:"ik3vkj"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=S("Pen",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=S("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]),J=({cuentas:A,naturaleza:j,value:L,onChange:R,name:D,error:y})=>{const u=A.filter(l=>l.Naturaleza_cuenta===j).reduce((l,c)=>{const i=c.Tipo_Cuenta;return l[i]||(l[i]=[]),l[i].push(c),l},{});return e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{className:"field-label",children:[e.jsx(W,{className:"h-4 w-4 mr-2"}),"Cuenta ",j==="Deudora"?"Deudora":"Acreedora"]}),e.jsxs("select",{name:D,value:L,onChange:R,className:"field-select",children:[e.jsxs("option",{value:"",children:["Seleccione una cuenta ",j==="DEUDORA"?"deudora":"acreedora"]}),Object.entries(u).map(([l,c])=>e.jsx("optgroup",{label:l,children:c.map(i=>e.jsxs("option",{value:i.Cod_cuenta,className:`cuenta-${j.toLowerCase()}`,children:[i.Cod_cuenta," - ",i.Nombre_cuenta]},i.Cod_cuenta))},l))]}),y&&e.jsx("span",{className:"field-error",children:`Seleccione una cuenta ${j.toLowerCase()}`})]})},Me=()=>{const{canSelect:A,canUpdate:j,canDelete:L,canInsert:R}=ce("LibroDiario"),[D,y]=s.useState([]),[u,l]=s.useState([]),[c,i]=s.useState([]),[Y,_]=s.useState(!1),[O,E]=s.useState(null),[I,K]=s.useState(null),[z,$]=s.useState(null),[w,Q]=s.useState("todos"),[B,X]=s.useState({});s.useState(0);const[d,F]=s.useState({Fecha:new Date().toISOString().split("T")[0],Descripcion:"",Cod_cuenta:"",Monto:"",Tipo:"DEUDOR"}),[m,v]=s.useState({Fecha:new Date().toISOString().split("T")[0],Descripcion:"",Cod_cuenta:"",Monto:"",Tipo:"ACREEDOR"}),[r,H]=s.useState({deudor:{},acreedor:{}}),[Z,P]=s.useState(!0);s.useEffect(()=>{k(),ee()},[]),s.useEffect(()=>{te()},[D,w]),s.useEffect(()=>{const t={};c.forEach(a=>{t[a.Cod_cuenta]=a.Nombre_cuenta}),X(t)},[c]),s.useEffect(()=>{ae()},[d,m]);const k=async()=>{_(!0);try{const t=await fetch("http://localhost:4000/api/Librodiario",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});if(!t.ok)throw new Error("Error en la respuesta del servidor");const a=await t.json();Array.isArray(a)?y(a):(y([]),E("No se encontraron registros."))}catch(t){E("Error al cargar los registros: "+t.message),console.error("Error al cargar registros:",t)}finally{_(!1)}},ee=async()=>{try{const t=await fetch("http://localhost:4000/api/catalogoCuentas",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});if(!t.ok)throw new Error("Error en la respuesta del servidor");const a=await t.json();i(a)}catch(t){E("Error al cargar las cuentas: "+t.message)}},te=()=>{l(w==="todos"?D:D.filter(t=>t.Tipo===w))},ae=()=>{if(z){P(!1);return}const t=U("deudor"),a=U("acreedor");H({deudor:t,acreedor:a});const o=Object.keys(t).length>0||Object.keys(a).length>0,x=d.Monto&&m.Monto;P(o||!x)},U=t=>{const a=t==="deudor"?d:m,o={};return a.Fecha||(o.Fecha="La fecha es requerida"),a.Descripcion||(o.Descripcion="La descripción es requerida"),a.Cod_cuenta||(o.Cod_cuenta="La cuenta es requerida"),(!a.Monto||isNaN(a.Monto)||parseFloat(a.Monto)<=0)&&(o.Monto="El monto debe ser un número mayor a 0"),o},p=(t,a)=>{const{name:o,value:x}=t.target;a==="deudor"?F(N=>({...N,[o]:x})):v(N=>({...N,[o]:x}))},oe=async t=>{t.preventDefault();try{g.fire({title:"Guardando registros...",text:"Por favor espere",allowOutsideClick:!1,showConfirmButton:!1,willOpen:()=>{g.showLoading()}}),console.log("Datos del Deudor:",d),console.log("Datos del Acreedor:",m);const a=await fetch("http://localhost:4000/api/Librodiario",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:JSON.stringify(d)}),o=await fetch("http://localhost:4000/api/Librodiario",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:JSON.stringify(m)});if(!a.ok||!o.ok)throw new Error("Error al guardar los registros");await g.fire({icon:"success",title:"¡Éxito!",text:"Registros guardados correctamente",confirmButtonColor:"#22c55e",timer:1500}),G(),await k()}catch(a){await g.fire({icon:"error",title:"Error",text:a.message,confirmButtonColor:"#22c55e"})}},se=async t=>{if((await g.fire({title:"¿Está seguro?",text:"Esta acción no se puede revertir",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Sí, eliminar",cancelButtonText:"Cancelar"})).isConfirmed)try{if(!(await fetch(`http://localhost:4000/api/Librodiario/${t}`,{method:"DELETE",headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}})).ok)throw new Error("Error al eliminar el registro");await g.fire("¡Eliminado!","El registro ha sido eliminado exitosamente.","success"),await k()}catch(o){g.fire("Error","No se pudo eliminar el registro: "+o.message,"error")}},re=t=>{t.tipo==="DEUDOR"?(F({Fecha:t.Fecha.split("T")[0],Descripcion:t.Descripcion,Cod_cuenta:t.Cod_cuenta,Monto:t.Monto.toString(),tipo:"DEUDOR"}),v({Fecha:new Date().toISOString().split("T")[0],Descripcion:"",Cod_cuenta:"",Monto:"",tipo:"ACREEDOR"})):(v({Fecha:t.Fecha.split("T")[0],Descripcion:t.Descripcion,Cod_cuenta:t.Cod_cuenta,Monto:t.Monto.toString(),tipo:"ACREEDOR"}),F({Fecha:new Date().toISOString().split("T")[0],Descripcion:"",Cod_cuenta:"",Monto:"",tipo:"DEUDOR"})),$(t.Cod_libro_diario),window.scrollTo({top:0,behavior:"smooth"})},G=()=>{F({Fecha:new Date().toISOString().split("T")[0],Descripcion:"",Cod_cuenta:"",Monto:"",Tipo:"Acreedor"}),v({Fecha:new Date().toISOString().split("T")[0],Descripcion:"",Cod_cuenta:"",Monto:"",Tipo:"Acreedor"}),$(null),H({deudor:{},acreedor:{}})},ne=()=>{const t=new le({orientation:"landscape",unit:"mm",format:"a4"}),a=new Image;a.src=ie,a.onload=()=>{const o=t.internal.pageSize.width,x=t.internal.pageSize.height,N=()=>{const h="CONFIDENCIAL";t.saveGraphicsState(),t.setGState(new t.GState({opacity:.15})),t.setTextColor(220,53,69),t.setFontSize(50),t.setFont("helvetica","bold");for(let f=0;f<x;f+=50*2)for(let b=0;b<o;b+=50*4)t.text(h,b,f,{angle:-45,renderingMode:"fill"});t.restoreGraphicsState()};t.addImage(a,"PNG",10,5,25,25),t.setTextColor(22,160,133),t.setFontSize(22),t.text("SAINT PATRICK'S ACADEMY",o/2,15,{align:"center"}),t.setFontSize(18),t.text("LIBRO DIARIO",o/2,25,{align:"center"}),t.setFontSize(10),t.setTextColor(68,68,68),t.text(["Casa Club del periodista, Colonia del Periodista","Teléfono: (504) 2234-8871","Correo: info@saintpatrickacademy.edu"],o/2,33,{align:"center",lineHeightFactor:1.5}),N();const M=u.reduce((n,h)=>{const f=parseFloat(h.Monto)||0,b=(h.Tipo||h.tipo||"").toString().toUpperCase();return b.includes("DEUDOR")?n.totalDeudor+=f:b.includes("ACREEDOR")&&(n.totalAcreedor+=f),n},{totalDeudor:0,totalAcreedor:0}),C=M.totalDeudor-M.totalAcreedor;t.autoTable({startY:50,head:[["#","Fecha","Descripción","Cuenta","Monto (L)","Tipo"]],body:[...u.map((n,h)=>{const f=(n.Tipo||n.tipo||"").toString().toUpperCase();return[h+1,new Date(n.Fecha).toLocaleDateString("es-HN"),n.Descripcion,`${n.Cod_cuenta} - ${B[n.Cod_cuenta]||""}`,`L ${parseFloat(n.Monto).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2})}`,f.includes("DEUDOR")?"DEUDOR":"ACREEDOR"]}),[{content:"",colSpan:6,styles:{fillColor:[255,255,255],minCellHeight:5}}],[{content:"RESUMEN DE TRANSACCIONES",colSpan:6,styles:{fillColor:[22,160,133],textColor:[255,255,255],fontSize:12,fontStyle:"bold",halign:"center"}}],[{content:"Total Cargos (Debe)",colSpan:3,styles:{fontStyle:"bold"}},{content:`L ${M.totalDeudor.toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2})}`,colSpan:3,styles:{halign:"right",fontStyle:"bold"}}],[{content:"Total Abonos (Haber)",colSpan:3,styles:{fontStyle:"bold"}},{content:`L ${M.totalAcreedor.toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2})}`,colSpan:3,styles:{halign:"right",fontStyle:"bold"}}],[{content:"",colSpan:6,styles:{fillColor:[255,255,255],minCellHeight:5}}],[{content:"BALANCE DE VALORACIÓN",colSpan:6,styles:{fillColor:[22,160,133],textColor:[255,255,255],fontSize:12,fontStyle:"bold",halign:"center"}}],[{content:"Balance",colSpan:3,styles:{fontStyle:"bold"}},{content:`L ${Math.abs(C).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2})} ${C>=0?"(Deudor)":"(Acreedor)"}`,colSpan:3,styles:{halign:"right",fontStyle:"bold",textColor:C===0?[0,128,0]:[0,0,0]}}],[{content:C===0?"Las cuentas están balanceadas":"Las cuentas no están balanceadas",colSpan:6,styles:{halign:"center",fontStyle:"bold",textColor:C===0?[0,128,0]:[220,53,69]}}]],styles:{fontSize:10,cellPadding:5},headStyles:{fillColor:[22,160,133],textColor:[255,255,255],fontSize:11,fontStyle:"bold"},alternateRowStyles:{fillColor:[240,248,255]},margin:{top:15},didDrawPage:function(n){N(),t.setFontSize(8),t.setTextColor(128);const h=new Date().toLocaleDateString("es-HN",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});t.text(`Generado el: ${h}`,15,x-10),t.text(`Página ${n.pageCount}`,o-20,x-10)}}),t.save("Reporte_Libro_Diario.pdf")},a.onerror=()=>{g.fire("Error","No se pudo cargar el logo.","error")}};return A?e.jsxs("div",{className:"libro-diario-container",children:[e.jsxs("div",{className:"header-section",children:[e.jsx("h1",{className:"header-title",children:"Libro Diario"}),e.jsx("p",{className:"header-subtitle",children:"Gestión de transacciones diarias"})]}),O&&e.jsxs("div",{className:"alert alert-error",children:[e.jsx(me,{className:"h-5 w-5 mr-2"}),e.jsx("p",{children:O}),e.jsx("button",{className:"ml-auto",onClick:()=>E(null),children:"×"})]}),I&&e.jsxs("div",{className:"alert alert-success",children:[e.jsx(he,{className:"h-5 w-5 mr-2"}),e.jsx("span",{children:I}),e.jsx("button",{className:"ml-auto",onClick:()=>K(null),children:"×"})]}),e.jsxs("form",{onSubmit:oe,className:"form-container",children:[e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("h2",{className:"form-group-title",children:[e.jsx(T,{className:"h-5 w-5 mr-2"}),"Deudor"]}),e.jsxs("div",{className:"form-section",children:[e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{className:"field-label",children:[e.jsx(q,{className:"h-4 w-4 mr-2"}),"Fecha"]}),e.jsx("input",{type:"date",name:"Fecha",value:d.Fecha,onChange:t=>p(t,"deudor"),className:"field-input",max:new Date().toISOString().split("T")[0]}),r.deudor.Fecha&&e.jsx("span",{className:"field-error",children:r.deudor.Fecha})]}),e.jsx(J,{cuentas:c,naturaleza:"DEUDORA",value:d.Cod_cuenta,onChange:t=>p(t,"deudor"),name:"Cod_cuenta",error:r.deudor.Cod_cuenta}),e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{className:"field-label",children:[e.jsx(V,{className:"h-4 w-4 mr-2"}),"Descripción"]}),e.jsx("input",{type:"text",name:"Descripcion",value:d.Descripcion,onChange:t=>p(t,"deudor"),className:"field-input",placeholder:"Ingrese la descripción"}),r.deudor.Descripcion&&e.jsx("span",{className:"field-error",children:r.deudor.Descripcion})]}),e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{className:"field-label",children:[e.jsx(T,{className:"h-4 w-4 mr-2"}),"Monto (L)"]}),e.jsx("input",{type:"number",name:"Monto",value:d.Monto,onChange:t=>p(t,"deudor"),className:"field-input",placeholder:"0.00",step:"0.01",min:"0"}),r.deudor.Monto&&e.jsx("span",{className:"field-error",children:r.deudor.Monto})]})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("h2",{className:"form-group-title",children:[e.jsx(T,{className:"h-5 w-5 mr-2"}),"Acreedor"]}),e.jsxs("div",{className:"form-section",children:[e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{className:"field-label",children:[e.jsx(q,{className:"h-4 w-4 mr-2"}),"Fecha"]}),e.jsx("input",{type:"date",name:"Fecha",value:m.Fecha,onChange:t=>p(t,"acreedor"),className:"field-input",max:new Date().toISOString().split("T")[0]}),r.acreedor.Fecha&&e.jsx("span",{className:"field-error",children:r.acreedor.Fecha})]}),e.jsx(J,{cuentas:c,naturaleza:"ACREEDORA",value:m.Cod_cuenta,onChange:t=>p(t,"acreedor"),name:"Cod_cuenta",error:r.acreedor.Cod_cuenta}),e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{className:"field-label",children:[e.jsx(V,{className:"h-4 w-4 mr-2"}),"Descripción"]}),e.jsx("input",{type:"text",name:"Descripcion",value:m.Descripcion,onChange:t=>p(t,"acreedor"),className:"field-input",placeholder:"Ingrese la descripción"}),r.acreedor.Descripcion&&e.jsx("span",{className:"field-error",children:r.acreedor.Descripcion})]}),e.jsxs("div",{className:"form-field",children:[e.jsxs("label",{className:"field-label",children:[e.jsx(T,{className:"h-4 w-4 mr-2"}),"Monto (L)"]}),e.jsx("input",{type:"number",name:"Monto",value:m.Monto,onChange:t=>p(t,"acreedor"),className:"field-input",placeholder:"0.00",step:"0.01",min:"0"}),r.acreedor.Monto&&e.jsx("span",{className:"field-error",children:r.acreedor.Monto})]})]})]})]}),e.jsxs("div",{className:"button-group",children:[e.jsx("button",{type:"button",onClick:G,className:"button-cancel",children:"Cancelar"}),R&&e.jsx("button",{type:"submit",disabled:Z,className:"button-submit",children:z?"Actualizar":"Registrar"})]})]}),e.jsxs("div",{className:"table-container",children:[e.jsxs("div",{className:"table-header",children:[e.jsx("h2",{className:"table-title",children:"Registros"}),e.jsxs("div",{className:"table-actions",children:[e.jsxs("div",{className:"filter-group",children:[e.jsx(pe,{className:"h-5 w-5 text-gray-500"}),e.jsxs("select",{value:w,onChange:t=>Q(t.target.value),className:"filter-select",children:[e.jsx("option",{value:"todos",children:"Todos"}),e.jsx("option",{value:"Deudor",children:"Deudor"}),e.jsx("option",{value:"Acreedor",children:"Acreedor"})]})]}),e.jsxs("button",{onClick:ne,className:"pdf-button",children:[e.jsx(W,{className:"h-4 w-4 mr-2"}),"Generar PDF"]})]})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"table-styles",children:[e.jsx("thead",{className:"table-head",children:e.jsxs("tr",{children:[e.jsx("th",{className:"table-header-cell",children:"Fecha"}),e.jsx("th",{className:"table-header-cell",children:"Descripción"}),e.jsx("th",{className:"table-header-cell",children:"Cuenta"}),e.jsx("th",{className:"table-header-cell",children:"Monto (L)"}),e.jsx("th",{className:"table-header-cell",children:"Tipo"}),e.jsx("th",{className:"table-header-cell",children:"Acciones"})]})}),e.jsx("tbody",{className:"table-body",children:Y?e.jsx("tr",{children:e.jsx("td",{colSpan:"6",className:"loading-text",children:e.jsxs("div",{className:"flex items-center justify-center",children:[e.jsx(ue,{className:"h-5 w-5 animate-spin mr-2"}),"Cargando registros..."]})})}):u.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:"6",className:"empty-text",children:"No hay registros disponibles"})}):u.map(t=>e.jsxs("tr",{className:"table-row",children:[e.jsx("td",{className:"table-cell",children:new Date(t.Fecha).toLocaleDateString()}),e.jsx("td",{className:"table-cell",children:t.Descripcion}),e.jsxs("td",{className:"table-cell",children:[t.Cod_cuenta," - ",B[t.Cod_cuenta]||"Sin nombre"]}),e.jsxs("td",{className:"table-cell",children:["L ",parseFloat(t.Monto).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2})]}),e.jsx("td",{className:"table-cell",children:e.jsx("span",{className:`px-3 py-1 rounded-full text-xs font-medium ${t.tipo==="Deudor"?"bg-blue-100 text-blue-800":"bg-green-100 text-green-800"}`,children:t.tipo})}),"   ",e.jsx("td",{className:"table-cell",children:e.jsx("span",{className:`px-3 py-1 rounded-full text-xs font-medium ${t.tipo==="Deudor"?"bg-blue-100 text-blue-800":"bg-green-100 text-green-800"}`,children:t.Tipo})}),e.jsxs("td",{className:"table-actions-cell",children:[j&&e.jsxs("button",{onClick:()=>re(t),className:"action-button edit-button",title:"Editar registro",children:[e.jsx(xe,{className:"h-5 w-5 mr-2"}),"Editar"]}),L&&e.jsxs("button",{onClick:()=>se(t.Cod_libro_diario),className:"action-button delete-button",title:"Eliminar registro",children:[e.jsx(fe,{className:"h-5 w-5 mr-2"}),"Eliminar"]})]})]},t.Cod_libro_diario))}),u.length>0&&e.jsx("tfoot",{className:"bg-gray-50 border-t border-gray-200",children:e.jsxs("tr",{children:[e.jsx("td",{colSpan:"3",className:"px-6 py-4 text-sm font-medium text-gray-900",children:"Total:"}),e.jsxs("td",{className:"px-6 py-4 text-sm font-medium text-gray-900",children:["L ",u.reduce((t,a)=>t+parseFloat(a.Monto),0).toLocaleString("es-HN",{minimumFractionDigits:2,maximumFractionDigits:2})]}),e.jsx("td",{colSpan:"2"})]})})]})})]})]}):e.jsx(de,{})};export{Me as default};
