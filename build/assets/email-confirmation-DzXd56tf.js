import{p as o,r as i,j as e}from"./index-SVRFFNc9.js";const c=()=>{const{correo:t}=o(),[r,n]=i.useState(!0);return i.useEffect(()=>{const a=setTimeout(()=>{n(!1)},3e16);return()=>clearTimeout(a)},[]),e.jsxs("div",{className:"confirmation-container",children:[e.jsxs("div",{className:"confirmation-card",children:[e.jsx("div",{className:"email-icon",children:e.jsxs("div",{className:"envelope",children:[e.jsx("div",{className:"envelope-flap"}),e.jsx("div",{className:"envelope-letter",children:"✓"})]})}),e.jsx("h2",{className:"confirmation-title",children:"Confirma tu correo electrónico"}),e.jsxs("div",{className:"confirmation-content",children:[e.jsxs("p",{className:"email-sent-to",children:["Hemos enviado un enlace a:",e.jsx("br",{}),e.jsx("strong",{className:"email-highlight",children:t})]}),r?e.jsxs("div",{className:"waiting-confirmation",children:[e.jsx("div",{className:"spinner",children:e.jsx("div",{className:"spinner-ring"})}),e.jsxs("p",{className:"waiting-text",children:["Esperando confirmación...",e.jsx("br",{}),e.jsx("span",{className:"subtle-text",children:"Puedes cerrar esta pestaña y continuar desde tu correo"})]})]}):e.jsxs("div",{className:"confirmation-complete",children:[e.jsx("div",{className:"check-mark",children:"✓"}),e.jsx("p",{className:"complete-text",children:"Gracias por tu paciencia. Ya puedes iniciar sesión."})]}),e.jsxs("div",{className:"instructions",children:[e.jsx("p",{className:"instruction-title",children:"No recibiste el correo?"}),e.jsxs("ul",{className:"instruction-list",children:[e.jsx("li",{children:"Revisa tu carpeta de spam"}),e.jsx("li",{children:"Verifica que el correo sea correcto"}),e.jsx("li",{children:"Espera unos minutos e intenta nuevamente"})]})]})]})]}),e.jsx("style",{jsx:!0,children:`
        .confirmation-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
          padding: 20px;
        }

        .confirmation-card {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          width: 100%;
          max-width: 500px;
          text-align: center;
        }

        .email-icon {
          margin-bottom: 2rem;
        }

        .envelope {
          position: relative;
          width: 80px;
          height: 60px;
          margin: 0 auto;
        }

        .envelope-flap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: #4A90E2;
          clip-path: polygon(0 0, 50% 30px, 100% 0, 100% 100%, 0 100%);
        }

        .envelope-letter {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 1.5rem;
          z-index: 1;
        }

        .confirmation-title {
          color: #2c3e50;
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
        }

        .email-sent-to {
          color: #555;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .email-highlight {
          display: inline-block;
          color: #2c3e50;
          background: #f8f9fa;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          margin-top: 0.5rem;
          border: 2px solid #e9ecef;
        }

        .waiting-confirmation {
          margin: 2rem 0;
        }

        .spinner {
          margin: 0 auto 1.5rem;
          width: 50px;
          height: 50px;
        }

        .spinner-ring {
          width: 100%;
          height: 100%;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4A90E2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .waiting-text {
          color: #555;
          line-height: 1.6;
        }

        .subtle-text {
          display: block;
          color: #888;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .confirmation-complete {
          margin: 2rem 0;
        }

        .check-mark {
          width: 50px;
          height: 50px;
          background: #4CAF50;
          border-radius: 50%;
          color: white;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .complete-text {
          color: #4CAF50;
          font-weight: 500;
        }

        .instructions {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f5f5f5;
        }

        .instruction-title {
          color: #666;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .instruction-list {
          list-style: none;
          padding: 0;
          margin: 0;
          color: #888;
          font-size: 0.9rem;
          line-height: 1.8;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .confirmation-card {
            padding: 1.5rem;
          }

          .confirmation-title {
            font-size: 1.5rem;
          }

          .email-highlight {
            font-size: 0.9rem;
          }
        }
      `})]})};export{c as default};
