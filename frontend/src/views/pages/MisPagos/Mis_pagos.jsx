import React, { useState } from 'react';

const ParentDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState('Ana García');
  
  const payments = [
    {
      id: 1,
      concept: 'Mensualidad Marzo',
      amount: 350.00,
      date: '2024-03-01',
      status: 'completed',
      dueDate: '2024-03-05'
    },
    {
      id: 2,
      concept: 'Materiales de Arte',
      amount: 45.50,
      date: '2024-02-28',
      status: 'completed',
      dueDate: '2024-03-01'
    },
    {
      id: 3,
      concept: 'Mensualidad Abril',
      amount: 350.00,
      status: 'pending',
      dueDate: '2024-04-05'
    }
  ];

  return (
    <div className="parent-dashboard">
      <style>{`
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
      `}</style>

      <div className="dashboard-container">
        <div className="welcome-section">
          <div className="welcome-header">
            <div className="welcome-text">
              <h1>Gestión de Pagos</h1>
              <p>Gestiona los pagos escolares de tus hijos fácilmente</p>
            </div>
            <select 
              className="student-selector"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="Ana García">Ana García - 3º Primaria</option>
              <option value="Carlos García">Carlos García - 1º Primaria</option>
            </select>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <h3>Mensualidad Actual</h3>
              <p className="amount">L.350.00</p>
              <p className="payment-status status-good">Pagado al día</p>
            </div>
            <div className="summary-card">
              <h3>Próximo Vencimiento</h3>
              <p className="amount">L.350.00</p>
              <p className="payment-status status-warning">Vence: 5 Abril</p>
            </div>
            <div className="summary-card">
              <h3>Total Año Escolar</h3>
              <p className="amount">L3,500.00</p>
              <p className="payment-status">7 de 10 mensualidades</p>
            </div>
          </div>
        </div>

        <div className="payments-section">
          <div className="section-header">
            <h2 className="section-title">Historial de Pagos</h2>
            <button className="pay-button">Realizar Pago</button>
          </div>

          <div className="payment-list">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-item">
                <div className="payment-info">
                  <h3 className="payment-concept">{payment.concept}</h3>
                  <p className="payment-date">
                    {payment.status === 'completed' 
                      ? `Pagado el ${new Date(payment.date).toLocaleDateString()}`
                      : `Vence el ${new Date(payment.dueDate).toLocaleDateString()}`
                    }
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="payment-amount">L{payment.amount.toFixed(2)}</span>
                  <span className={`status-badge ${payment.status === 'completed' ? 'status-completed' : 'status-pending'}`}>
                    {payment.status === 'completed' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="next-payment">
            <h3>Próximo Pago</h3>
            <p>La mensualidad de Abril vence el 05/04/2024. Realiza tu pago a tiempo para evitar recargos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;