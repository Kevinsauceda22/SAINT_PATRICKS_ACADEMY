import{r as l,i as b,j as o,C as H}from"./index-SVRFFNc9.js";import{E as B}from"./jspdf.plugin.autotable-gke1D7B3.js";import{u as C,w as M}from"./xlsx-lwdk4T0U.js";import{l as W}from"./logo_saint_patrick-xw7Wl8f3.js";import{C as Y,a as q}from"./CCardBody-BwCgYaTs.js";import{C as K}from"./CCardHeader-C_B6DycW.js";import{C as I,a as d}from"./CRow-Bf67u6lu.js";import{C as A}from"./CFormInput-B_gylY64.js";import{C as S}from"./CFormSelect-CzT7g5tb.js";import{a as T}from"./CButton-D9GPTbB6.js";import{F as V}from"./file-text-Clyuk29C.js";import{c as J}from"./createLucideIcon-CPQyE5BK.js";import{C as Q,a as X,b as w,c as m,d as Z,e as p}from"./CTable-98qqrSRH.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=J("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]),ge=()=>{const[E,k]=l.useState([]),[z,F]=l.useState(!0),[t,O]=l.useState({fechaInicio:new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString().split("T")[0],fechaFin:new Date().toISOString().split("T")[0],usuario:"",accion:"",objeto:""}),[N,_]=l.useState([]),[D,U]=l.useState([]);l.useEffect(()=>{L(),R(),P()},[]);const L=async()=>{try{const e=localStorage.getItem("token");if(!e)return;const a={headers:{Authorization:`Bearer ${e}`}},s=await b.get("http://74.50.68.87:4000/api/bitacora/reporte",a);k(s.data),F(!1)}catch(e){console.error("Error al cargar actividades:",e),F(!1)}},R=async()=>{try{const e=localStorage.getItem("token"),a=await b.get("http://74.50.68.87:4000/api/usuarios",{headers:{Authorization:`Bearer ${e}`}});_(a.data)}catch(e){console.error("Error al cargar usuarios:",e)}},P=async()=>{try{const e=localStorage.getItem("token"),a=await b.get("http://74.50.68.87:4000/api/bitacora/objetos",{headers:{Authorization:`Bearer ${e}`}});U(a.data)}catch(e){console.error("Error al cargar objetos:",e)}},h=e=>{const{name:a,value:s}=e.target;O(r=>({...r,[a]:s}))},j=()=>E.filter(e=>{const a=new Date(e.Fecha).toISOString().split("T")[0],s=!t.fechaInicio||a>=t.fechaInicio,r=!t.fechaFin||a<=t.fechaFin,u=!t.usuario||e.Cod_usuario.toString()===t.usuario,n=!t.accion||e.Accion===t.accion,x=!t.objeto||e.Cod_objeto.toString()===t.objeto;return s&&r&&u&&n&&x}),$=()=>{const e=j(),a=C.json_to_sheet(e.map(r=>({Fecha:new Date(r.Fecha).toLocaleString(),Usuario:r.NombreUsuario,Acción:r.Accion,Objeto:r.NombreObjeto,Descripción:r.Descripcion}))),s=C.book_new();C.book_append_sheet(s,a,"Actividades"),M(s,"Reporte_Actividades.xlsx")},G=()=>{const e=new B({orientation:"landscape",unit:"mm",format:"a4"}),a=new Image;a.src=W,a.onload=()=>{var v,y;const s=e.internal.pageSize.width,r=e.internal.pageSize.height,u=()=>{const c="CONFIDENCIAL";e.saveGraphicsState(),e.setGState(new e.GState({opacity:.15})),e.setTextColor(220,53,69),e.setFontSize(50),e.setFont("helvetica","bold");for(let g=0;g<r;g+=50*2)for(let f=0;f<s;f+=50*4)e.text(c,f,g,{angle:-45,renderingMode:"fill"});e.restoreGraphicsState()};e.addImage(a,"PNG",10,5,25,25),e.setTextColor(22,160,133),e.setFontSize(22),e.text("SAINT PATRICK'S ACADEMY",s/2,15,{align:"center"}),e.setFontSize(18),e.text("REPORTE DE ACTIVIDADES DEL SISTEMA",s/2,25,{align:"center"}),e.setFontSize(10),e.setTextColor(68,68,68),e.text(["Casa Club del periodista, Colonia del Periodista","Teléfono: (504) 2234-8871","Correo: info@saintpatrickacademy.edu"],s/2,33,{align:"center",lineHeightFactor:1.5}),u();const n=[];if(t.fechaInicio&&n.push(`Fecha Inicio: ${t.fechaInicio}`),t.fechaFin&&n.push(`Fecha Fin: ${t.fechaFin}`),t.usuario){const i=(v=N.find(c=>c.cod_usuario.toString()===t.usuario))==null?void 0:v.Nombre_usuario;i&&n.push(`Usuario: ${i}`)}if(t.accion&&n.push(`Acción: ${t.accion}`),t.objeto){const i=(y=D.find(c=>c.Cod_objeto.toString()===t.objeto))==null?void 0:y.Nom_objeto;i&&n.push(`Objeto: ${i}`)}const x=j();e.autoTable({startY:50,head:[["#","Fecha y Hora","Usuario","Acción","Objeto","Descripción"]],body:x.map((i,c)=>[c+1,new Date(i.Fecha).toLocaleString(),i.NombreUsuario,i.Accion,i.NombreObjeto,i.Descripcion]),styles:{fontSize:10,cellPadding:5},headStyles:{fillColor:[22,160,133],textColor:[255,255,255],fontSize:11,fontStyle:"bold"},alternateRowStyles:{fillColor:[240,248,255]},margin:{top:15},didDrawPage:function(i){u(),e.setFontSize(8),e.setTextColor(128);const c=new Date().toLocaleDateString("es-HN",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});e.text(`Generado el: ${c}`,15,r-10),e.text(`Página ${i.pageCount}`,s-20,r-10),n.length>0&&(e.setFontSize(8),e.setTextColor(68,68,68),e.text("Filtros aplicados: "+n.join(" | "),s/2,r-10,{align:"center"}))}}),e.save("Reporte_Actividades.pdf")},a.onerror=()=>{console.error("No se pudo cargar el logo")}};return o.jsx(o.Fragment,{children:o.jsxs(Y,{className:"mb-4",children:[o.jsx(K,{children:o.jsx("h2",{className:"mb-0",children:"Centro de Actividades"})}),o.jsxs(q,{children:[o.jsxs(I,{className:"mb-4",children:[o.jsx(d,{md:3,children:o.jsxs("div",{className:"mb-3",children:[o.jsx("label",{className:"form-label",children:"Fecha Inicio"}),o.jsx(A,{type:"date",name:"fechaInicio",value:t.fechaInicio,onChange:h})]})}),o.jsx(d,{md:3,children:o.jsxs("div",{className:"mb-3",children:[o.jsx("label",{className:"form-label",children:"Fecha Fin"}),o.jsx(A,{type:"date",name:"fechaFin",value:t.fechaFin,onChange:h})]})}),o.jsx(d,{md:2,children:o.jsxs("div",{className:"mb-3",children:[o.jsx("label",{className:"form-label",children:"Usuario"}),o.jsxs(S,{name:"usuario",value:t.usuario,onChange:h,children:[o.jsx("option",{value:"",children:"Todos"}),N.map(e=>o.jsx("option",{value:e.cod_usuario,children:e.Nombre_usuario},e.cod_usuario))]})]})}),o.jsx(d,{md:2,children:o.jsxs("div",{className:"mb-3",children:[o.jsx("label",{className:"form-label",children:"Acción"}),o.jsxs(S,{name:"accion",value:t.accion,onChange:h,children:[o.jsx("option",{value:"",children:"Todas"}),o.jsx("option",{value:"LOGIN",children:"Login"}),o.jsx("option",{value:"LOGOUT",children:"Logout"}),o.jsx("option",{value:"INSERT",children:"Insert"}),o.jsx("option",{value:"UPDATE",children:"Update"}),o.jsx("option",{value:"DELETE",children:"Delete"})]})]})}),o.jsx(d,{md:2,children:o.jsxs("div",{className:"mb-3",children:[o.jsx("label",{className:"form-label",children:"Objeto"}),o.jsxs(S,{name:"objeto",value:t.objeto,onChange:h,children:[o.jsx("option",{value:"",children:"Todos"}),D.map(e=>o.jsx("option",{value:e.Cod_objeto,children:e.Nom_objeto},e.Cod_objeto))]})]})})]}),o.jsx(I,{className:"mb-3",children:o.jsxs(d,{className:"d-flex justify-content-end gap-2",children:[o.jsxs(T,{color:"primary",onClick:G,className:"d-flex align-items-center gap-2",children:[o.jsx(V,{size:20}),"Exportar a PDF"]}),o.jsxs(T,{color:"success",onClick:$,className:"d-flex align-items-center gap-2",children:[o.jsx(ee,{size:20}),"Exportar a Excel"]})]})}),z?o.jsx("div",{className:"text-center",children:o.jsx(H,{color:"primary"})}):o.jsxs(Q,{bordered:!0,hover:!0,responsive:!0,children:[o.jsx(X,{children:o.jsxs(w,{children:[o.jsx(m,{scope:"col",children:"Fecha"}),o.jsx(m,{scope:"col",children:"Usuario"}),o.jsx(m,{scope:"col",children:"Acción"}),o.jsx(m,{scope:"col",children:"Objeto"}),o.jsx(m,{scope:"col",children:"Descripción"})]})}),o.jsx(Z,{children:j().map((e,a)=>o.jsxs(w,{children:[o.jsx(p,{children:new Date(e.Fecha).toLocaleString()}),o.jsx(p,{children:e.NombreUsuario}),o.jsx(p,{children:e.Accion}),o.jsx(p,{children:e.NombreObjeto}),o.jsx(p,{children:e.Descripcion})]},a))})]})]})]})})};export{ge as default};
