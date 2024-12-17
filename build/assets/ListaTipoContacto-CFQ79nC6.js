import{r as f,j as o}from"./index-SVRFFNc9.js";import{C as x}from"./index.esm-DWwMdKxH.js";import{S as C}from"./sweetalert2.esm.all-D3pEHXw3.js";/* empty css                */import{E as B}from"./jspdf.plugin.autotable-gke1D7B3.js";import{E as $}from"./exceljs.min-DabLBGGe.js";import{F as M}from"./FileSaver.min-DN8zk8MP.js";import{C as Ce}from"./CContainer-BdNP0s3v.js";import{C as ge,a as L}from"./CRow-Bf67u6lu.js";import{a as u}from"./CButton-D9GPTbB6.js";import{c as me}from"./cil-plus-D8mtC-W5.js";import{C as U,a as G,b as H,c as w}from"./CDropdownToggle-DlfIUTmX.js";import{c as W}from"./cil-description-MUzg6O3n.js";import{c as Y}from"./cil-print-CPAcfqxC.js";import{C as fe}from"./CFormSelect-CzT7g5tb.js";import{C as V}from"./CInputGroup-D-McUFva.js";import{C as K}from"./CInputGroupText-Cfu0fzaY.js";import{c as xe}from"./cil-search-CDkY_4k-.js";import{C as O}from"./CFormInput-B_gylY64.js";import{C as ue,a as be,b as J,c as k,d as we,e as R}from"./CTable-98qqrSRH.js";import{c as q}from"./cil-pen-53d2I-C-.js";import{c as Te}from"./cil-trash-CBbKHhHb.js";import{C as ve}from"./CPagination-UopCEeNZ.js";import{C as je,a as ye,b as Se,c as ze}from"./CModalHeader-Bhtr3bZe.js";import{C as _e}from"./CModalTitle-M2mBvD_5.js";import{c as Ee}from"./cil-save-CHBg7z_U.js";import"./CConditionalPortal-DwBsYzTA.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";import"./CBackdrop-BbuVwMMD.js";const no=()=>{const[z,j]=f.useState([]),[Q,T]=f.useState(!1),[p,_]=f.useState(null),[g,y]=f.useState({tipo_contacto:""}),[X,v]=f.useState(!1),[E,P]=f.useState(""),[b,F]=f.useState(1),[S,Z]=f.useState(5);f.useEffect(()=>{ee()},[]);const ee=async()=>{try{const e=await fetch("http://74.50.68.87:4000/api/tipoContacto/obtenerTipoContacto");if(!e.ok)throw new Error(`Error en la solicitud: ${e.statusText}`);const a=await e.json();console.log("Datos recibidos del backend:",a);const t=a.map(i=>({cod_tipo_contacto:i.cod_tipo_contacto,tipo_contacto:i.tipo_contacto||"N/A"}));j(t)}catch(e){console.error("Error fetching tipos de contacto:",e),C.fire({icon:"error",title:"Error",text:"No se pudo cargar la lista de tipos de contacto."})}},oe=async()=>{if(!m.length){C.fire({icon:"warning",title:"Sin Datos",text:"No hay datos para exportar."});return}const e=prompt("Ingrese el nombre del archivo para el reporte Excel:","Reporte_Tipos_Contacto");if(!e){console.warn("Exportación cancelada. No se proporcionó un nombre de archivo.");return}const a=new $.Workbook,t=a.addWorksheet("Tipos_Contacto"),i="/logo.jpg";try{const n=await fetch(i).then(h=>h.arrayBuffer()),s=a.addImage({buffer:n,extension:"jpeg"});t.addImage(s,{tl:{col:.2,row:1},ext:{width:120,height:80}})}catch(n){console.warn("No se pudo cargar el logo:",n)}t.mergeCells("C1:H1"),t.getCell("C1").value="SAINT PATRICK'S ACADEMY",t.getCell("C1").font={size:18,bold:!0,color:{argb:"006633"}},t.getCell("C1").alignment={horizontal:"center",vertical:"middle"},t.mergeCells("C2:H2"),t.getCell("C2").value="Reporte de Tipos de Contacto",t.getCell("C2").font={size:14,bold:!0},t.getCell("C2").alignment={horizontal:"center",vertical:"middle"},t.mergeCells("C3:H3"),t.getCell("C3").value="Casa Club del periodista, Colonia del Periodista",t.getCell("C3").font={size:10,color:{argb:"666666"}},t.getCell("C3").alignment={horizontal:"center",vertical:"middle"},t.mergeCells("C4:H4"),t.getCell("C4").value="Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu",t.getCell("C4").font={size:10,color:{argb:"666666"}},t.getCell("C4").alignment={horizontal:"center",vertical:"middle"},t.addRow([]);const r=["#","Tipo de Contacto"];t.addRow(["","","","",...r]).eachCell((n,s)=>{s>=5&&(n.font={bold:!0,color:{argb:"FFFFFF"}},n.fill={type:"pattern",pattern:"solid",fgColor:{argb:"006633"}},n.alignment={horizontal:"center",vertical:"middle"})}),m.forEach((n,s)=>{const h=t.addRow(["","","","",s+1,n.tipo_contacto.toUpperCase()]);h.eachCell((l,d)=>{d>=5&&(l.alignment={horizontal:"center",vertical:"middle"})}),s%2===0&&h.eachCell((l,d)=>{d>=5&&(l.fill={type:"pattern",pattern:"solid",fgColor:{argb:"E8F5E9"}})})}),t.getColumn(5).width=5,t.getColumn(6).width=30;try{const n=await a.xlsx.writeBuffer(),s=new Blob([n],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});M.saveAs(s,`${e}.xlsx`)}catch(n){console.error("Error al generar el archivo:",n)}},te=()=>{const e=new B,a=new Image;a.src="/logo.jpg";const t=prompt("Ingrese el nombre del archivo (sin extensión):","Reporte_TiposContacto");if(!t){console.warn("Exportación cancelada. No se proporcionó un nombre de archivo.");return}a.onload=()=>{e.addImage(a,"JPEG",10,10,30,30),e.setFontSize(18),e.setTextColor(0,102,51),e.text("SAINT PATRICK'S ACADEMY",e.internal.pageSize.width/2,20,{align:"center"}),e.setFontSize(14),e.text("Reporte de Tipos de Contacto",e.internal.pageSize.width/2,30,{align:"center"}),e.setFontSize(10),e.setTextColor(100),e.text("Casa Club del periodista, Colonia del Periodista",e.internal.pageSize.width/2,40,{align:"center"}),e.text("Teléfono: (504) 2234-8871",e.internal.pageSize.width/2,45,{align:"center"}),e.text("Correo: info@saintpatrickacademy.edu",e.internal.pageSize.width/2,50,{align:"center"}),e.setLineWidth(.5),e.setDrawColor(0,102,51),e.line(10,55,e.internal.pageSize.width-10,55),e.autoTable({startY:60,head:[["#","Tipo de Contacto"]],body:m.map((r,c)=>[c+1,r.tipo_contacto.toUpperCase()]),headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10},styles:{fontSize:10,cellPadding:3},alternateRowStyles:{fillColor:[240,248,255]}});const i=new Date().toLocaleDateString();e.setFontSize(10),e.setTextColor(100),e.text(`Fecha de generación: ${i}`,10,e.internal.pageSize.height-10),e.save(`${t}.pdf`)},a.onerror=()=>{console.error("No se pudo cargar el logo. El PDF se generará sin el logo."),e.setFontSize(18),e.setTextColor(0,102,51),e.text("SAINT PATRICK'S ACADEMY",e.internal.pageSize.width/2,20,{align:"center"}),e.setFontSize(14),e.text("Reporte de Tipos de Contacto",e.internal.pageSize.width/2,30,{align:"center"}),e.autoTable({startY:50,head:[["#","Tipo de Contacto"]],body:m.map((r,c)=>[c+1,r.tipo_contacto.toUpperCase()]),headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10},styles:{fontSize:10,cellPadding:3},alternateRowStyles:{fillColor:[240,248,255]}});const i=new Date().toLocaleDateString();e.setFontSize(10),e.text(`Fecha de generación: ${i}`,10,e.internal.pageSize.height-10),e.save(`${t}.pdf`)}},re=()=>{const e=window.open("","","width=800,height=600"),a=window.location.origin+"/logo.jpg",t=m.length?m:z;e.document.write(`
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
            <img src="${a}" alt="Logo" />
            <div class="text">
              <h1>SAINT PATRICK'S ACADEMY</h1>
              <h2>Reporte de Tipos de Contacto</h2>
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
                <th>Tipo de Contacto</th>
              </tr>
            </thead>
            <tbody>
              ${t.map((i,r)=>`
                  <tr>
                    <td>${r+1}</td>
                    <td>${i.tipo_contacto.toUpperCase()}</td>
                  </tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `),e.document.close(),e.print()},ae=async(e,a)=>{const t=prompt("Ingrese el nombre del archivo Excel:",`Reporte_TipoContacto_${e.tipo_contacto}_${a+1}`);if(!t)return;const i=new $.Workbook,r=i.addWorksheet("Reporte_TipoContacto"),c="/logo.jpg";try{const l=await fetch(c).then(he=>he.arrayBuffer()),d=i.addImage({buffer:l,extension:"jpeg"});r.addImage(d,{tl:{col:.2,row:1},ext:{width:120,height:80}})}catch(l){console.warn("No se pudo cargar el logo:",l)}r.mergeCells("C1:H1"),r.getCell("C1").value="SAINT PATRICK'S ACADEMY",r.getCell("C1").font={size:18,bold:!0,color:{argb:"006633"}},r.getCell("C1").alignment={horizontal:"center",vertical:"middle"},r.mergeCells("C2:H2"),r.getCell("C2").value="Reporte Individual de Tipo de Contacto",r.getCell("C2").font={size:14,bold:!0},r.getCell("C2").alignment={horizontal:"center",vertical:"middle"},r.mergeCells("C3:H3"),r.getCell("C3").value="Casa Club del periodista, Colonia del Periodista",r.getCell("C3").font={size:10,color:{argb:"666666"}},r.getCell("C3").alignment={horizontal:"center",vertical:"middle"},r.mergeCells("C4:H4"),r.getCell("C4").value="Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu",r.getCell("C4").font={size:10,color:{argb:"666666"}},r.getCell("C4").alignment={horizontal:"center",vertical:"middle"},r.addRow([]);const n=["#","Tipo de Contacto"];r.addRow(["","","","",...n]).eachCell((l,d)=>{d>=5&&(l.font={bold:!0,color:{argb:"FFFFFF"}},l.fill={type:"pattern",pattern:"solid",fgColor:{argb:"006633"}},l.alignment={horizontal:"center",vertical:"middle"})});const h=r.addRow(["","","","",a+1,e.tipo_contacto.toUpperCase()]);h.eachCell((l,d)=>{d>=5&&(l.alignment={horizontal:"center",vertical:"middle"})}),h.eachCell((l,d)=>{d>=5&&(l.fill={type:"pattern",pattern:"solid",fgColor:{argb:"E8F5E9"}})}),r.getColumn(5).width=5,r.getColumn(6).width=30;try{const l=await i.xlsx.writeBuffer(),d=new Blob([l],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});M.saveAs(d,`${t}.xlsx`)}catch(l){console.error("Error al generar el archivo:",l)}},ie=(e,a)=>{const t=new B,i=new Image;i.src="/logo.jpg";const r=prompt("Ingrese el nombre del archivo (sin extensión):",`Reporte_TipoContacto_${e.tipo_contacto}`);if(!r){console.warn("Exportación cancelada. No se proporcionó un nombre de archivo.");return}i.onload=()=>{try{t.addImage(i,"JPEG",10,10,30,30),t.setFontSize(18),t.setTextColor(0,102,51),t.text("SAINT PATRICK'S ACADEMY",t.internal.pageSize.width/2,20,{align:"center"}),t.setFontSize(14),t.text("Reporte de Tipo de Contacto",t.internal.pageSize.width/2,30,{align:"center"}),t.setFontSize(10),t.setTextColor(100),t.text("Casa Club del periodista, Colonia del Periodista",t.internal.pageSize.width/2,40,{align:"center"}),t.text("Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu",t.internal.pageSize.width/2,45,{align:"center"}),t.setLineWidth(.5),t.setDrawColor(0,102,51),t.line(10,55,t.internal.pageSize.width-10,55),t.autoTable({startY:60,head:[["#","Tipo de Contacto"]],body:[[a+1,e.tipo_contacto.toUpperCase()]],headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10},styles:{fontSize:10,cellPadding:3},alternateRowStyles:{fillColor:[240,248,255]}}),t.save(`${r}.pdf`)}catch(c){console.error("Error al generar el PDF:",c),alert("Ocurrió un error al generar el PDF.")}},i.onerror=()=>{console.error("No se pudo cargar el logo. Generando el PDF sin logo."),t.save(`${r}.pdf`)}},ne=(e,a)=>{const t=window.open("","","width=800,height=600"),i=window.location.origin+"/logo.jpg";t.document.write(`
      <html>
        <head>
          <title>Imprimir Tipo de Contacto</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              position: relative;
              margin-bottom: 20px;
            }
            .header img {
              position: absolute;
              left: 10px;
              top: 5px; /* Acerca el logo al encabezado */
              width: 100px; /* Tamaño original del logo */
              height: auto;
            }
            .header .text {
              text-align: center;
              margin: 0; /* Centra el texto del encabezado */
            }
            .header .text h1 {
              font-size: 18px;
              color: #006633; /* Verde oscuro */
              margin: 0;
            }
            .header .text h2 {
              font-size: 14px;
              margin: 5px 0 0;
              color: #006633; /* Verde oscuro */
            }
            .info {
              text-align: center;
              font-size: 10px;
              color: #666; /* Gris oscuro */
              margin-top: 5px;
            }
            .divider {
              border-top: 0.5px solid #006633; /* Línea divisoria verde */
              margin: 15px 0;
            }
            .record {
              width: 100%; /* La tabla abarca todo el ancho */
              margin: 20px 0;
              border-collapse: collapse;
            }
            .record th, .record td {
              padding: 10px;
              border: 1px solid #006633; /* Borde verde */
              text-align: left; /* Texto alineado a la izquierda */
            }
            .record th {
              background-color: #006633; /* Verde oscuro */
              color: #fff; /* Texto blanco */
            }
            .record td {
              background-color: #f2f2f2; /* Gris claro */
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${i}" alt="Logo" />
            <div class="text">
              <h1>SAINT PATRICK'S ACADEMY</h1>
              <h2>Reporte de Tipo de Contacto</h2>
              <div class="info">
                <p>Casa Club del periodista, Colonia del Periodista</p>
                <p>Teléfono: (504) 2234-8871</p>
                <p>Correo: info@saintpatrickacademy.edu</p>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <table class="record">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo de Contacto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${a+1}</td>
                <td>${e.tipo_contacto.toUpperCase()}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `),t.document.close(),t.print()},le=async()=>{if(X)return;if(z.some(c=>c.tipo_contacto.toUpperCase()===g.tipo_contacto.trim().toUpperCase()&&(!p||c.cod_tipo_contacto!==p.cod_tipo_contacto))){C.fire({icon:"error",title:"Error",text:`El tipo de contacto "${g.tipo_contacto.trim()}" ya existe`}),v(!1);return}v(!0);const a=p?`http://74.50.68.87:4000/api/tipoContacto/actualizarTipoContacto/${p.cod_tipo_contacto}`:"http://74.50.68.87:4000/api/tipoContacto/crearTipoContacto",t=p?"PUT":"POST",i=JSON.stringify({tipo_contacto:g.tipo_contacto.trim()});if(!g.tipo_contacto.trim()){C.fire({icon:"error",title:"Error",text:'El campo "Tipo de Contacto" no puede estar vacío.'}),v(!1);return}if(!/[aeiouáéíóúü]/i.test(g.tipo_contacto)){C.fire({icon:"error",title:"Error",text:'El "Tipo de Contacto" debe contener al menos una vocal.'}),v(!1);return}try{const c=await fetch(a,{method:t,headers:{"Content-Type":"application/json"},body:i}),n=await c.json();c.ok?(j(p?s=>s.map(h=>h.cod_tipo_contacto===p.cod_tipo_contacto?{...h,tipo_contacto:g.tipo_contacto.trim()}:h):s=>[...s,{cod_tipo_contacto:n.cod_tipo_contacto,tipo_contacto:g.tipo_contacto.trim()}]),T(!1),y({tipo_contacto:""}),_(null),C.fire({icon:"success",title:p?"Tipo de contacto actualizado":"Tipo de contacto creado",text:n.Mensaje||"Operación realizada con éxito"})):C.fire({icon:"error",title:"Error",text:n.Mensaje})}catch(c){console.error("Error:",c),C.fire({icon:"error",title:"Error",text:"Error en el servidor."})}finally{v(!1)}},ce=async(e,a)=>{try{if(!(await C.fire({title:"Confirmar Eliminación",html:`¿Estás seguro de que deseas eliminar el tipo de contacto: <strong>${a||"N/A"}</strong>?`,showCancelButton:!0,confirmButtonColor:"#FF6B6B",cancelButtonColor:"#6C757D",cancelButtonText:"Cancelar",confirmButtonText:'<i class="fa fa-trash"></i> Eliminar',reverseButtons:!0,focusCancel:!0})).isConfirmed)return;const i=await fetch(`http://74.50.68.87:4000/api/tipoContacto/eliminarTipoContacto/${encodeURIComponent(e)}`,{method:"DELETE"}),r=await i.json();if(i.ok)j(c=>c.filter(n=>n.cod_tipo_contacto!==e)),C.fire({icon:"success",title:"Tipo de contacto eliminado",text:r.Mensaje||"Eliminado correctamente"});else throw new Error(r.Mensaje||"Error al eliminar")}catch(t){console.error("Error eliminando el tipo de contacto:",t),C.fire({icon:"error",title:"Error",text:t.message||"No se pudo eliminar el tipo de contacto."})}},se=e=>{Z(Number(e.target.value)),F(1)},de=e=>P(e.target.value),m=z.filter(e=>e.tipo_contacto.toLowerCase().includes(E.toLowerCase())||e.cod_tipo_contacto.toString().includes(E)),D=b*S,I=D-S,pe=m.slice(I,D),N=Math.ceil(m.length/S),A=e=>F(e);return o.jsxs(Ce,{children:[o.jsxs(ge,{className:"align-items-center mb-5",children:[o.jsx(L,{xs:"8",md:"9",children:o.jsx("h1",{children:"Mantenimiento de Tipos de Contacto"})}),o.jsxs(L,{xs:"4",md:"3",className:"text-end",children:[o.jsxs(u,{style:{backgroundColor:"#4B6251",color:"white"},onClick:()=>{T(!0),_(null),y({tipo_contacto:""})},children:[o.jsx(x,{icon:me})," Nuevo"]}),o.jsxs(U,{className:"ms-2",children:[o.jsxs(G,{style:{backgroundColor:"#6C8E58",color:"white"},children:[o.jsx(x,{icon:W})," Reporte"]}),o.jsxs(H,{children:[o.jsxs(w,{onClick:oe,children:[o.jsx("i",{className:"fa fa-file-excel-o",style:{marginRight:"5px"}})," Descargar en Excel"]}),o.jsxs(w,{onClick:te,children:[o.jsx("i",{className:"fa fa-file-pdf-o",style:{marginRight:"5px"}})," Descargar en PDF"]}),o.jsxs(w,{onClick:re,children:[o.jsx(x,{icon:Y})," Imprimir"]})]})]}),o.jsxs("div",{className:"mt-2",style:{textAlign:"right"},children:[o.jsx("span",{children:"Mostrar "}),o.jsxs(fe,{value:S,onChange:se,style:{maxWidth:"70px",display:"inline-block",margin:"0 5px"},children:[o.jsx("option",{value:5,children:"5"}),o.jsx("option",{value:10,children:"10"}),o.jsx("option",{value:20,children:"20"})]}),o.jsx("span",{children:" registros"})]})]})]}),o.jsxs(V,{className:"mb-3",style:{maxWidth:"400px"},children:[o.jsx(K,{children:o.jsx(x,{icon:xe})}),o.jsx(O,{placeholder:"Buscar tipo contacto....",onChange:de,value:E}),o.jsxs(u,{onClick:()=>P(""),style:{border:"2px solid #d3d3d3",color:"#4B6251",backgroundColor:"#f0f0f0"},children:[o.jsx("i",{className:"fa fa-broom",style:{marginRight:"5px"}})," Limpiar"]})]}),o.jsx("div",{className:"table-container",style:{maxHeight:"400px",overflowY:"scroll",marginBottom:"20px"},children:o.jsxs(ue,{striped:!0,bordered:!0,hover:!0,children:[o.jsx(be,{children:o.jsxs(J,{children:[o.jsx(k,{children:"#"}),o.jsx(k,{children:"Tipo de Contacto"}),o.jsx(k,{children:"Acciones"})]})}),o.jsx(we,{children:pe.map((e,a)=>o.jsxs(J,{children:[o.jsx(R,{children:a+1+I}),o.jsx(R,{children:e.tipo_contacto}),o.jsxs(R,{children:[o.jsx(u,{color:"warning",onClick:()=>{_(e),T(!0),y({tipo_contacto:e.tipo_contacto})},children:o.jsx(x,{icon:q})}),o.jsx(u,{color:"danger",onClick:()=>ce(e.cod_tipo_contacto,e.tipo_contacto),className:"ms-2",children:o.jsx(x,{icon:Te})}),o.jsxs(U,{className:"ms-2",children:[o.jsx(G,{color:"info",children:o.jsx(x,{icon:W})}),o.jsxs(H,{children:[o.jsxs(w,{onClick:()=>ae(e,a),children:[o.jsx("i",{className:"fa fa-file-excel-o",style:{marginRight:"5px"}})," Descargar en Excel"]}),o.jsxs(w,{onClick:()=>ie(e,a),children:[o.jsx("i",{className:"fa fa-file-pdf-o",style:{marginRight:"5px"}})," Descargar en PDF"]}),o.jsxs(w,{onClick:()=>ne(e,a),children:[o.jsx(x,{icon:Y})," Imprimir"]})]})]})]})]},e.cod_tipo_contacto))})]})}),o.jsxs(ve,{align:"center",className:"my-3",children:[o.jsx(u,{style:{backgroundColor:"#7fa573",color:"white",marginRight:"20px"},onClick:()=>A(b-1),disabled:b===1,children:"Anterior"}),o.jsx(u,{style:{backgroundColor:"#7fa573",color:"white"},onClick:()=>A(b+1),disabled:b===N||m.length===0,children:"Siguiente"}),o.jsxs("span",{style:{marginLeft:"10px",color:"black",fontSize:"16px"},children:["Página ",b," de ",N]})]}),o.jsxs(je,{visible:Q,onClose:()=>T(!1),children:[o.jsx(ye,{children:o.jsx(_e,{children:p?"Actualizar Tipo de Contacto":"Crear Nuevo Tipo de Contacto"})}),o.jsx(Se,{children:o.jsxs(V,{className:"mb-3",children:[o.jsx(K,{style:{backgroundColor:"#f0f0f0",color:"black"},children:"Tipo Contacto"}),o.jsx(O,{placeholder:"Tipo de Contacto",value:g.tipo_contacto,onChange:e=>{let a=e.target.value.replace(/[0-9]/g,"");a=a.replace(/\s{2,}/g," "),y({tipo_contacto:a.toUpperCase()})},onKeyDown:e=>{if(e.key===" "){const a=g.tipo_contacto;(a.endsWith(" ")||a==="")&&e.preventDefault()}g.tipo_contacto.length>=50&&e.key!=="Backspace"&&e.key!=="Delete"&&e.preventDefault()}})]})}),o.jsxs(ze,{children:[o.jsx(u,{color:"secondary",onClick:()=>T(!1),children:"Cancelar"}),o.jsxs(u,{onClick:le,style:p?{backgroundColor:"#FFD700",color:"white"}:{backgroundColor:"#4B6251",color:"white"},children:[o.jsx(x,{icon:p?q:Ee})," ",p?"Actualizar":"Guardar"]})]})]})]})};export{no as default};
