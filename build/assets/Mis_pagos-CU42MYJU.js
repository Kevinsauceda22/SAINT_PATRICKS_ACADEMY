import{r as n,j as e}from"./index-SVRFFNc9.js";const i=()=>{const[s,t]=n.useState("Ana García"),r=[{id:1,concept:"Mensualidad Marzo",amount:350,date:"2024-03-01",status:"completed",dueDate:"2024-03-05"},{id:2,concept:"Materiales de Arte",amount:45.5,date:"2024-02-28",status:"completed",dueDate:"2024-03-01"},{id:3,concept:"Mensualidad Abril",amount:350,status:"pending",dueDate:"2024-04-05"}];return e.jsxs("div",{className:"parent-dashboard",children:[e.jsx("style",{children:`
        .parent-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
          min-height: 100vh;
          padding: 2rem;
        }

        .dashboard-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .welcome-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .welcome-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .welcome-text {
          color: #1e293b;
        }

        .welcome-text h1 {
          font-size: 1.8rem;
          margin: 0;
        }

        .welcome-text p {
          color: #64748b;
          margin: 0.5rem 0;
        }

        .student-selector {
          padding: 0.5rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          color: #1e293b;
          background: white;
          cursor: pointer;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .summary-card {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s;
        }

        .summary-card:hover {
          transform: translateY(-3px);
        }

        .summary-card h3 {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-card .amount {
          font-size: 1.8rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .payment-status {
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }

        .status-good {
          color: #16a34a;
        }

        .status-warning {
          color: #ea580c;
        }

        .payments-section {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.2rem;
          color: #1e293b;
          margin: 0;
        }

        .payment-list {
          border-radius: 12px;
          overflow: hidden;
        }

        .payment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s;
        }

        .payment-item:hover {
          background-color: #f8fafc;
        }

        .payment-info {
          flex: 1;
        }

        .payment-concept {
          font-weight: 500;
          color: #1e293b;
          margin: 0;
        }

        .payment-date {
          color: #64748b;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .payment-amount {
          font-weight: 600;
          color: #1e293b;
          font-size: 1.1rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          margin-left: 1rem;
        }

        .status-completed {
          background: #dcfce7;
          color: #166534;
        }

        .status-pending {
          background: #fef9c3;
          color: #854d0e;
        }

        .next-payment {
          border: 2px solid #e2e8f0;
          border-radius: 15px;
          padding: 1.5rem;
          margin-top: 2rem;
          background: #fffbeb;
        }

        .next-payment h3 {
          color: #92400e;
          margin: 0 0 0.5rem 0;
        }

        .next-payment p {
          color: #92400e;
          margin: 0;
          font-size: 0.9rem;
        }

        .pay-button {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pay-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .parent-dashboard {
            padding: 1rem;
          }
          
          .summary-cards {
            grid-template-columns: 1fr;
          }
          
          .welcome-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .student-selector {
            width: 100%;
          }
        }
      `}),e.jsxs("div",{className:"dashboard-container",children:[e.jsxs("div",{className:"welcome-section",children:[e.jsxs("div",{className:"welcome-header",children:[e.jsxs("div",{className:"welcome-text",children:[e.jsx("h1",{children:"Gestión de Pagos"}),e.jsx("p",{children:"Gestiona los pagos escolares de tus hijos fácilmente"})]}),e.jsxs("select",{className:"student-selector",value:s,onChange:a=>t(a.target.value),children:[e.jsx("option",{value:"Ana García",children:"Ana García - 3º Primaria"}),e.jsx("option",{value:"Carlos García",children:"Carlos García - 1º Primaria"})]})]}),e.jsxs("div",{className:"summary-cards",children:[e.jsxs("div",{className:"summary-card",children:[e.jsx("h3",{children:"Mensualidad Actual"}),e.jsx("p",{className:"amount",children:"L.350.00"}),e.jsx("p",{className:"payment-status status-good",children:"Pagado al día"})]}),e.jsxs("div",{className:"summary-card",children:[e.jsx("h3",{children:"Próximo Vencimiento"}),e.jsx("p",{className:"amount",children:"L.350.00"}),e.jsx("p",{className:"payment-status status-warning",children:"Vence: 5 Abril"})]}),e.jsxs("div",{className:"summary-card",children:[e.jsx("h3",{children:"Total Año Escolar"}),e.jsx("p",{className:"amount",children:"L3,500.00"}),e.jsx("p",{className:"payment-status",children:"7 de 10 mensualidades"})]})]})]}),e.jsxs("div",{className:"payments-section",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h2",{className:"section-title",children:"Historial de Pagos"}),e.jsx("button",{className:"pay-button",children:"Realizar Pago"})]}),e.jsx("div",{className:"payment-list",children:r.map(a=>e.jsxs("div",{className:"payment-item",children:[e.jsxs("div",{className:"payment-info",children:[e.jsx("h3",{className:"payment-concept",children:a.concept}),e.jsx("p",{className:"payment-date",children:a.status==="completed"?`Pagado el ${new Date(a.date).toLocaleDateString()}`:`Vence el ${new Date(a.dueDate).toLocaleDateString()}`})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center"},children:[e.jsxs("span",{className:"payment-amount",children:["L",a.amount.toFixed(2)]}),e.jsx("span",{className:`status-badge ${a.status==="completed"?"status-completed":"status-pending"}`,children:a.status==="completed"?"Pagado":"Pendiente"})]})]},a.id))}),e.jsxs("div",{className:"next-payment",children:[e.jsx("h3",{children:"Próximo Pago"}),e.jsx("p",{children:"La mensualidad de Abril vence el 05/04/2024. Realiza tu pago a tiempo para evitar recargos."})]})]})]})]})};export{i as default};
