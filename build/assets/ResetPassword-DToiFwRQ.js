import{r as n,j as e}from"./index-SVRFFNc9.js";import{S as a}from"./sweetalert2.esm.all-D3pEHXw3.js";const p=()=>{const[r,s]=n.useState(1),[i,c]=n.useState(""),l=async t=>{t.preventDefault();try{const o=await fetch("http://localhost:4000/api/usuarios/olvide-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({correo_usuario:i})});if(!o.ok){const d=await o.json();throw new Error(d.mensaje||"Error al enviar el correo de restablecimiento")}s(2),a.fire({title:"¡Éxito!",text:"Instrucciones de restablecimiento de contraseña enviadas a tu correo.",icon:"success",confirmButtonText:"Aceptar"})}catch(o){console.error(o),a.fire({title:"Error",text:o.message,icon:"error",confirmButtonText:"Aceptar"})}};return e.jsxs("div",{className:"reset-container",children:[e.jsxs("div",{className:"reset-card",children:[e.jsx("div",{className:"icon-container",children:e.jsxs("div",{className:"lock-icon",children:[e.jsx("div",{className:"lock-body"}),e.jsx("div",{className:"lock-hook"})]})}),e.jsx("h1",{className:"title",children:r===1&&"Restablecer Contraseña"}),e.jsxs("p",{className:"description",children:[r===1&&"Ingresa tu correo electrónico para recibir instrucciones de restablecimiento.",r===2&&"Las instrucciones han sido enviadas a tu correo."]}),e.jsxs("div",{className:"form-container",children:[r===1&&e.jsxs("form",{onSubmit:l,className:"reset-form",children:[e.jsx("input",{type:"email",placeholder:"correo@ejemplo.com",value:i,onChange:t=>c(t.target.value),required:!0,className:"input-field"}),e.jsx("button",{type:"submit",className:"submit-button",children:"Enviar Instrucciones"})]}),r===2&&e.jsxs("div",{className:"success-container",children:[e.jsx("div",{className:"success-icon",children:"✓"}),e.jsx("button",{onClick:()=>window.location.href="/login",className:"submit-button",children:"Ir al Inicio de Sesión"})]}),r>1&&e.jsx("button",{onClick:()=>s(r-1),className:"back-button",children:"Volver atrás"})]})]}),e.jsx("style",{jsx:!0,children:`
        .reset-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          padding: 20px;
        }

        .reset-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .icon-container {
          margin-bottom: 1.5rem;
        }

        .lock-icon {
          display: inline-block;
          position: relative;
          width: 60px;
          height: 60px;
        }

        .lock-body {
          width: 40px;
          height: 30px;
          background: #4A90E2;
          border-radius: 5px;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .lock-hook {
          width: 20px;
          height: 20px;
          border: 6px solid #4A90E2;
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          border-bottom: transparent;
        }

        .title {
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .description {
          color: #666;
          margin-bottom: 2rem;
        }

        .reset-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-field {
          padding: 0.75rem 1rem;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          width: 100%;
        }

        .input-field:focus {
          border-color: #4A90E2;
          outline: none;
        }

        .submit-button {
          background-color: #4A90E2;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .submit-button:hover {
          background-color: #357ABD;
        }

        .back-button {
          background: transparent;
          border: none;
          color: #4A90E2;
          cursor: pointer;
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        .success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 1rem;
        }

        .success-icon {
          font-size: 3rem;
          color: #4A90E2;
          margin-bottom: 1rem;
        }
      `})]})};export{p as default};
