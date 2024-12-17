import{r as h,j as o}from"./index-SVRFFNc9.js";import{C as d}from"./index.esm-DWwMdKxH.js";import{S as p}from"./sweetalert2.esm.all-D3pEHXw3.js";/* empty css                */import{E as A}from"./jspdf.plugin.autotable-gke1D7B3.js";import{E as B}from"./exceljs.min-DabLBGGe.js";import{F as $}from"./FileSaver.min-DN8zk8MP.js";import{C as ge}from"./CContainer-BdNP0s3v.js";import{C as pe,a as L}from"./CRow-Bf67u6lu.js";import{a as m}from"./CButton-D9GPTbB6.js";import{c as he}from"./cil-plus-D8mtC-W5.js";import{C as M,a as U,b as W,c as j}from"./CDropdownToggle-DlfIUTmX.js";import{c as H}from"./cil-description-MUzg6O3n.js";import{c as Y}from"./cil-print-CPAcfqxC.js";import{C as me}from"./CFormSelect-CzT7g5tb.js";import{C as O}from"./CInputGroup-D-McUFva.js";import{C as V}from"./CInputGroupText-Cfu0fzaY.js";import{c as Ce}from"./cil-search-CDkY_4k-.js";import{C as K}from"./CFormInput-B_gylY64.js";import{C as xe,a as fe,b as J,c as G,d as ue,e as R}from"./CTable-98qqrSRH.js";import{c as q}from"./cil-pen-53d2I-C-.js";import{c as be}from"./cil-trash-CBbKHhHb.js";import{C as we}from"./CPagination-UopCEeNZ.js";import{C as je,a as Te,b as ve,c as ye}from"./CModalHeader-Bhtr3bZe.js";import{C as Se}from"./CModalTitle-M2mBvD_5.js";import{c as Ee}from"./cil-save-CHBg7z_U.js";import"./CConditionalPortal-DwBsYzTA.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";import"./CBackdrop-BbuVwMMD.js";const ao=()=>{const[k,y]=h.useState([]),[Q,T]=h.useState(!1),[S,F]=h.useState({Cod_genero:"",Tipo_genero:""}),[c,f]=h.useState(null),[I,N]=h.useState(""),[u,E]=h.useState(1),[v,X]=h.useState(5);h.useEffect(()=>{_()},[]);const _=async()=>{try{const e=await fetch("http://localhost:4000/api/generoPersona/obtenerGeneroPersona");if(!e.ok)throw new Error(`Error en la solicitud: ${e.statusText}`);const r=await e.json();y(r)}catch(e){console.error("Error fetching generos:",e),p.fire({icon:"error",title:"Error",text:"No se pudo cargar la lista de géneros. Intenta más tarde."})}},Z=async()=>{try{if(!C||C.length===0){p.fire({icon:"warning",title:"Sin Datos",text:"No hay datos para exportar."});return}const e=prompt("Ingrese el nombre del archivo para el reporte Excel:","Reporte_Géneros");if(!e){console.warn("Exportación cancelada. No se proporcionó un nombre de archivo.");return}const r=new B.Workbook,t=r.addWorksheet("Géneros"),l="/logo.jpg";try{const n=await fetch(l).then(b=>b.arrayBuffer()),s=r.addImage({buffer:n,extension:"jpeg"});t.addImage(s,{tl:{col:.2,row:1},ext:{width:120,height:80}})}catch(n){console.warn("No se pudo cargar el logo:",n)}t.mergeCells("C1:H1"),t.getCell("C1").value="SAINT PATRICK'S ACADEMY",t.getCell("C1").font={size:18,bold:!0,color:{argb:"006633"}},t.getCell("C1").alignment={horizontal:"center",vertical:"middle"},t.mergeCells("C2:H2"),t.getCell("C2").value="Reporte de Géneros",t.getCell("C2").font={size:14,bold:!0,color:{argb:"006633"}},t.getCell("C2").alignment={horizontal:"center",vertical:"middle"},t.mergeCells("C3:H3"),t.getCell("C3").value="Casa Club del periodista, Colonia del Periodista",t.getCell("C3").font={size:10,color:{argb:"666666"}},t.getCell("C3").alignment={horizontal:"center",vertical:"middle"},t.mergeCells("C4:H4"),t.getCell("C4").value="Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu",t.getCell("C4").font={size:10,color:{argb:"666666"}},t.getCell("C4").alignment={horizontal:"center",vertical:"middle"},t.addRow([]);const a=["#","Tipo de Género"];t.addRow(["","","","",...a]).eachCell((n,s)=>{s>=5&&(n.font={bold:!0,color:{argb:"FFFFFF"}},n.fill={type:"pattern",pattern:"solid",fgColor:{argb:"006633"}},n.alignment={horizontal:"center",vertical:"middle"})}),C.forEach((n,s)=>{const b=t.addRow(["","","","",s+1,n.Tipo_genero.toUpperCase()]);b.eachCell((w,i)=>{i>=5&&(w.alignment={horizontal:"center",vertical:"middle"})}),s%2===0&&b.eachCell((w,i)=>{i>=5&&(w.fill={type:"pattern",pattern:"solid",fgColor:{argb:"E8F5E9"}})})}),t.getColumn(5).width=5,t.getColumn(6).width=30;try{const n=await r.xlsx.writeBuffer(),s=new Blob([n],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});$.saveAs(s,`${e}.xlsx`)}catch(n){console.error("Error al generar el archivo:",n)}}catch(e){console.error("Error al exportar a Excel:",e),p.fire({icon:"error",title:"Error",text:"Hubo un problema al exportar a Excel."})}},ee=()=>{const e=new A,r=new Image;r.src="/logo.jpg";const t=prompt("Ingrese el nombre del archivo (sin extensión):","Reporte_Generos");if(!t){console.warn("Exportación cancelada. No se proporcionó un nombre de archivo.");return}const l=C;if(!l||l.length===0){alert("No hay datos visibles para exportar.");return}r.onload=()=>{try{e.addImage(r,"JPEG",10,10,30,30),e.setFontSize(18),e.setTextColor(0,102,51),e.text("SAINT PATRICK'S ACADEMY",e.internal.pageSize.width/2,20,{align:"center"}),e.setFontSize(14),e.text("Reporte de Géneros",e.internal.pageSize.width/2,30,{align:"center"}),e.setFontSize(10),e.setTextColor(100),e.text("Casa Club del periodista, Colonia del Periodista",e.internal.pageSize.width/2,40,{align:"center"}),e.text("Teléfono: (504) 2234-8871",e.internal.pageSize.width/2,45,{align:"center"}),e.text("Correo: info@saintpatrickacademy.edu",e.internal.pageSize.width/2,50,{align:"center"}),e.setLineWidth(.5),e.setDrawColor(0,102,51),e.line(10,55,e.internal.pageSize.width-10,55),e.autoTable({startY:60,head:[["#","Tipo de Género"]],body:l.map((x,n)=>[n+1,x.Tipo_genero]),headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10},styles:{fontSize:10,cellPadding:3},alternateRowStyles:{fillColor:[240,248,255]}});const a=new Date().toLocaleDateString();e.setFontSize(10),e.setTextColor(100),e.text(`Fecha de generación: ${a}`,10,e.internal.pageSize.height-10),e.save(`${t}.pdf`)}catch(a){console.error("Error al generar el PDF:",a),alert("Ocurrió un error al generar el PDF.")}},r.onerror=()=>{console.error("No se pudo cargar el logo. El PDF se generará sin el logo."),alert("No se pudo cargar el logo. El PDF no se generará.")}},oe=()=>{const e=window.open("","","width=800,height=600"),r=window.location.origin+"/logo.jpg",t=C.length?C:k;e.document.write(`
    <html>
      <head>
        <title>Imprimir Reporte General</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            position: relative;
            margin-bottom: 30px; /* Incrementa la separación del logo */
          }
          .header img {
            position: absolute;
            left: 10px;
            top: 5px; /* Ajusta el logo más cerca del encabezado */
            width: 100px; /* Tamaño del logo */
            height: auto;
          }
          .header .text {
            text-align: center;
            margin-left: 120px; /* Centra el texto correctamente */
          }
          .header .text h1 {
            font-size: 18px;
            color: #006633; /* Verde oscuro */
            margin: 0;
          }
          .header .text h2 {
            font-size: 14px;
            color: #006633; /* Verde oscuro */
            margin: 5px 0 0;
          }
          .info {
            text-align: center;
            font-size: 10px;
            color: #666; /* Gris oscuro */
            margin-top: 5px;
          }
          .divider {
            border-top: 0.5px solid #006633; /* Línea divisoria verde */
            margin: 20px 0; /* Aumenta la separación */
          }
          table {
            width: 100%; /* La tabla abarca todo el ancho */
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #006633; /* Borde verde */
            padding: 10px;
            text-align: left; /* Texto alineado a la izquierda */
          }
          th {
            background-color: #006633; /* Verde oscuro */
            color: #fff; /* Texto blanco */
            font-size: 14px;
          }
          tr:nth-child(even) {
            background-color: #E8F5E9; /* Verde claro */
          }
          tr:nth-child(odd) {
            background-color: #f2f2f2; /* Gris claro */
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${r}" alt="Logo" />
          <div class="text">
            <h1>SAINT PATRICK'S ACADEMY</h1>
            <h2>Reporte de Géneros</h2>
            <div class="info">
              <p>Casa Club del periodista, Colonia del Periodista</p>
              <p>Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu</p>
            </div>
          </div>
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo de Género</th>
            </tr>
          </thead>
          <tbody>
            ${t.map((l,a)=>`
                <tr>
                  <td>${a+1}</td>
                  <td>${l.Tipo_genero.toUpperCase()}</td>
                </tr>`).join("")}
          </tbody>
        </table>
      </body>
    </html>
  `),e.document.close(),e.print()},re=e=>{const r=new A,t=new Image;t.src="/logo.jpg",t.onload=()=>{try{r.addImage(t,"JPEG",10,10,30,30),r.setFontSize(18),r.setTextColor(0,102,51),r.text("SAINT PATRICK'S ACADEMY",r.internal.pageSize.width/2,20,{align:"center"}),r.setFontSize(14),r.text("Reporte Individual - Género",r.internal.pageSize.width/2,30,{align:"center"}),r.setFontSize(10),r.setTextColor(100),r.text("Casa Club del periodista, Colonia del Periodista",r.internal.pageSize.width/2,40,{align:"center"}),r.text("Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu",r.internal.pageSize.width/2,45,{align:"center"}),r.setLineWidth(.5),r.setDrawColor(0,102,51),r.line(10,50,r.internal.pageSize.width-10,50),r.autoTable({startY:60,head:[["#","Tipo de Género"]],body:[[1,e.Tipo_genero]],headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10},styles:{fontSize:10,cellPadding:3},alternateRowStyles:{fillColor:[240,248,255]}});const l=new Date().toLocaleDateString();r.setFontSize(10),r.setTextColor(100),r.text(`Fecha de generación: ${l}`,10,r.internal.pageSize.height-10),r.save(`Reporte_Individual_${e.Tipo_genero}.pdf`)}catch(l){console.error("Error al generar el PDF:",l),alert("Ocurrió un error al generar el PDF.")}},t.onerror=()=>{console.error("No se pudo cargar el logo. El PDF se generará sin el logo."),alert("No se pudo cargar el logo.")}},te=async(e,r)=>{const t=prompt("Ingrese el nombre del archivo Excel:",`Reporte_Género_${e.Tipo_genero}_${r+1}`);if(!t)return;const l=new B.Workbook,a=l.addWorksheet("Reporte_Género"),x="/logo.jpg";try{const i=await fetch(x).then(de=>de.arrayBuffer()),g=l.addImage({buffer:i,extension:"jpeg"});a.addImage(g,{tl:{col:.2,row:1},ext:{width:120,height:80}})}catch(i){console.warn("No se pudo cargar el logo:",i)}a.mergeCells("C1:G1"),a.getCell("C1").value="SAINT PATRICK'S ACADEMY",a.getCell("C1").font={size:18,bold:!0,color:{argb:"006633"}},a.getCell("C1").alignment={horizontal:"center",vertical:"middle"},a.mergeCells("C2:G2"),a.getCell("C2").value="Reporte Individual - Género",a.getCell("C2").font={size:14,bold:!0,color:{argb:"006633"}},a.getCell("C2").alignment={horizontal:"center",vertical:"middle"},a.mergeCells("C3:G3"),a.getCell("C3").value="Casa Club del periodista, Colonia del Periodista",a.getCell("C3").font={size:10,color:{argb:"666666"}},a.getCell("C3").alignment={horizontal:"center",vertical:"middle"},a.mergeCells("C4:G4"),a.getCell("C4").value="Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu",a.getCell("C4").font={size:10,color:{argb:"666666"}},a.getCell("C4").alignment={horizontal:"center",vertical:"middle"},a.addRow([]);const n=["#","Tipo de Género"];a.addRow(["","","","",...n]).eachCell((i,g)=>{g>=5&&(i.font={bold:!0,color:{argb:"FFFFFF"}},i.fill={type:"pattern",pattern:"solid",fgColor:{argb:"006633"}},i.alignment={horizontal:"center",vertical:"middle"})});const b=r+1,w=a.addRow(["","","","",b,e.Tipo_genero.toUpperCase()]);w.eachCell((i,g)=>{g>=5&&(i.alignment={horizontal:"center",vertical:"middle"})}),w.eachCell((i,g)=>{g>=5&&(i.fill={type:"pattern",pattern:"solid",fgColor:{argb:"E8F5E9"}})}),a.getColumn(5).width=5,a.getColumn(6).width=30;try{const i=await l.xlsx.writeBuffer(),g=new Blob([i],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});$.saveAs(g,`${t}.xlsx`)}catch(i){console.error("Error al generar el archivo:",i)}},ae=e=>{const r=window.open("","","width=800,height=600"),t=window.location.origin+"/logo.jpg";r.document.write(`
    <html>
      <head>
        <title>Reporte Individual</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header img { width: 100px; height: auto; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #006633; padding: 10px; text-align: left; }
          th { background-color: #006633; color: #fff; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${t}" alt="Logo" />
          <h1>SAINT PATRICK'S ACADEMY</h1>
          <h2>Reporte Individual</h2>
        </div>
        <table>
          <tr><th>#</th><th>Tipo de Género</th></tr>
          <tr><td>1</td><td>${e.Tipo_genero.toUpperCase()}</td></tr>
        </table>
      </body>
    </html>
  `),r.document.close(),r.print()},ne=async()=>{const e=!!c,r=e?c:S;if(!r.Tipo_genero.trim()){p.fire({icon:"warning",title:"Campo vacío",text:'El campo "Tipo de Género" no puede estar vacío.'});return}try{const t=e?`http://localhost:4000/api/generoPersona/actualizarGeneroPersona/${c.Cod_genero}`:"http://localhost:4000/api/generoPersona/crearGeneroPersona",l=e?"PUT":"POST";console.log("Enviando datos:",JSON.stringify({Tipo_genero:r.Tipo_genero.trim()}));const a=await fetch(t,{method:l,headers:{"Content-Type":"application/json"},body:JSON.stringify({Tipo_genero:r.Tipo_genero.trim()})}),x=await a.json();if(a.ok)y(e?n=>n.map(s=>s.Cod_genero===c.Cod_genero?{...s,Tipo_genero:r.Tipo_genero.trim()}:s):n=>[...n,{Cod_genero:x.Cod_genero,Tipo_genero:r.Tipo_genero.trim()}]),p.fire({icon:"success",title:e?"Género actualizado":"Género creado",text:`El género fue ${e?"actualizado":"creado"} exitosamente.`}),T(!1),F({Cod_genero:"",Tipo_genero:""}),f(null);else throw new Error(x.message||"No se pudo realizar la operación.")}catch(t){console.error("Error en la operación:",t),p.fire({icon:"error",title:"Error en el servidor",text:t.message||"Inténtalo más tarde."})}},le=async(e,r)=>{try{if(!(await p.fire({title:"Confirmar Eliminación",html:`¿Estás seguro de que deseas eliminar el género: <strong>${r}</strong>?`,showCancelButton:!0,confirmButtonColor:"#FF6B6B",cancelButtonColor:"#6C757D",cancelButtonText:"Cancelar",confirmButtonText:'<i class="fa fa-trash"></i> Eliminar',reverseButtons:!0,focusCancel:!0})).isConfirmed)return;const l=await fetch(`http://localhost:4000/api/generoPersona/eliminarGeneroPersona/${encodeURIComponent(e)}`,{method:"DELETE"}),a=await l.json();if(l.ok)_(),p.fire({icon:"success",title:"Género eliminado",text:`El género "${r}" fue eliminado correctamente.`});else throw new Error(a.Mensaje||`No se pudo eliminar el género "${r}".`)}catch(t){console.error("Error eliminando el género:",t),p.fire({icon:"error",title:"Error",text:t.message||`No se pudo eliminar el género "${r}".`})}},ie=e=>{N(e.target.value),E(1)},se=e=>{X(Number(e.target.value)),E(1)},z=k.filter(e=>e.Tipo_genero?e.Tipo_genero.toLowerCase().includes(I.toLowerCase()):!1),P=u*v,ce=P-v,C=z.slice(ce,P),D=e=>E(e);return o.jsxs(ge,{children:[o.jsxs(pe,{className:"align-items-center mb-5",children:[o.jsx(L,{xs:"8",md:"9",children:o.jsx("h1",{children:"Mantenimieno Géneros"})}),o.jsxs(L,{xs:"4",md:"3",className:"text-end",children:[o.jsxs(m,{style:{backgroundColor:"#4B6251",color:"white"},onClick:()=>{T(!0),f(null)},children:[o.jsx(d,{icon:he})," Nuevo"]}),o.jsxs(M,{children:[o.jsxs(U,{style:{backgroundColor:"#6C8E58",color:"white",marginLeft:"10px"},children:[o.jsx(d,{icon:H})," Reporte"]}),o.jsxs(W,{children:[o.jsxs(j,{onClick:Z,children:[o.jsx("i",{className:"fa fa-file-excel-o",style:{marginRight:"5px"}})," Descargar en Excel"]}),o.jsxs(j,{onClick:ee,children:[o.jsx("i",{className:"fa fa-file-pdf-o",style:{marginRight:"5px"}})," Descargar en PDF"]}),o.jsxs(j,{onClick:oe,children:[o.jsx(d,{icon:Y,style:{marginRight:"5px"}})," Imprimir"]})]})]}),o.jsxs("div",{className:"mt-2",style:{textAlign:"right"},children:[o.jsx("span",{children:"Mostrar "}),o.jsxs(me,{value:v,onChange:se,style:{maxWidth:"70px",display:"inline-block",margin:"0 5px"},children:[o.jsx("option",{value:5,children:"5"}),o.jsx("option",{value:10,children:"10"}),o.jsx("option",{value:20,children:"20"})]}),o.jsx("span",{children:" registros"})]})]})]}),o.jsxs(O,{className:"mb-3",style:{maxWidth:"400px"},children:[o.jsx(V,{children:o.jsx(d,{icon:Ce})}),o.jsx(K,{placeholder:"Buscar género persona....",onChange:ie,value:I}),o.jsxs(m,{onClick:()=>N(""),style:{border:"2px solid #d3d3d3",color:"#4B6251",backgroundColor:"#f0f0f0"},children:[o.jsx("i",{className:"fa fa-broom",style:{marginRight:"5px"}})," Limpiar"]})]}),o.jsx("div",{className:"table-container",style:{maxHeight:"400px",overflowY:"scroll",marginBottom:"20px"},children:o.jsxs(xe,{striped:!0,bordered:!0,hover:!0,children:[o.jsx(fe,{children:o.jsxs(J,{children:[o.jsx(G,{children:"#"}),o.jsx(G,{children:"Tipo de Género"}),o.jsx(G,{children:"Acciones"})]})}),o.jsx(ue,{children:C.map((e,r)=>o.jsxs(J,{children:[o.jsx(R,{children:r+1+(u-1)*v}),o.jsx(R,{children:e.Tipo_genero}),o.jsxs(R,{children:[o.jsx(m,{color:"warning",size:"sm",onClick:()=>{f(e),T(!0)},children:o.jsx(d,{icon:q})}),o.jsx(m,{color:"danger",size:"sm",style:{marginLeft:"5px"},onClick:()=>le(e.Cod_genero,e.Tipo_genero),children:o.jsx(d,{icon:be})}),o.jsxs(M,{variant:"btn-group",style:{marginLeft:"5px"},children:[o.jsxs(U,{size:"sm",style:{backgroundColor:"#007bff",color:"white",border:"none"},className:"dropdown-toggle-black",children:[o.jsx(d,{icon:H,style:{color:"black"}})," "]}),o.jsxs(W,{children:[o.jsxs(j,{onClick:()=>te(e),children:[o.jsx(d,{icon:"cil-file-excel",className:"me-2"}),"Descargar en Excel"]}),o.jsxs(j,{onClick:()=>re(e),children:[o.jsx(d,{icon:"cil-file-pdf",className:"me-2"}),"Descargar en PDF"]}),o.jsxs(j,{onClick:()=>ae(e),children:[o.jsx(d,{icon:Y,className:"me-2"}),"Imprimir"]})]})]})]})]},e.Cod_genero))})]})}),o.jsxs(we,{align:"center",className:"my-3",children:[o.jsx(m,{style:{backgroundColor:"#7fa573",color:"white",padding:"10px 20px",marginRight:"10px",border:"none",borderRadius:"5px"},onClick:()=>D(u-1),disabled:u===1,children:"Anterior"}),o.jsx(m,{style:{backgroundColor:"#7fa573",color:"white",padding:"10px 20px",border:"none",borderRadius:"5px"},onClick:()=>D(u+1),disabled:P>=z.length,children:"Siguiente"}),o.jsxs("span",{style:{marginLeft:"15px",fontSize:"16px",color:"#333"},children:["Página ",u," de ",Math.ceil(z.length/v)]})]}),o.jsxs(je,{visible:Q,onClose:()=>{T(!1),f(null)},children:[o.jsx(Te,{children:o.jsx(Se,{children:c?"Actualizar Género":"Crear Nuevo Género"})}),o.jsx(ve,{children:o.jsxs(O,{className:"mb-3",children:[o.jsx(V,{children:"Tipo de Género"}),o.jsx(K,{placeholder:"Ingrese el tipo de género",value:c?c.Tipo_genero:S.Tipo_genero,onChange:e=>{c?f({...c,Tipo_genero:e.target.value}):F({...S,Tipo_genero:e.target.value})}})]})}),o.jsxs(ye,{children:[o.jsx(m,{color:"secondary",onClick:()=>{T(!1),f(null)},children:"Cancelar"}),o.jsxs(m,{style:c?{backgroundColor:"#FFD700",color:"white"}:{backgroundColor:"#4B6251",color:"white"},onClick:ne,children:[o.jsx(d,{icon:c?q:Ee})," ",c?"Actualizar":"Guardar"," "]})]})]})]})};export{ao as default};
