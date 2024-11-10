import React, { useState } from 'react';
import { PlusCircle, X, Edit2, Trash2, AlertCircle, CheckCircle, Download, Filter, ArrowUp, ArrowDown, Search } from 'lucide-react';

const LibroDiario = () => {
  const [entries, setEntries] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    type: 'ingreso'
  });

  const totals = entries.reduce((acc, entry) => {
    if (entry.type === 'ingreso') {
      acc.income += parseFloat(entry.amount);
    } else {
      acc.expenses += parseFloat(entry.amount);
    }
    return acc;
  }, { income: 0, expenses: 0 });

  const balance = totals.income - totals.expenses;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.description || !formData.amount) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setEntries([...entries, { ...formData, id: Date.now() }]);
    setFormData({ date: '', description: '', amount: '', type: 'ingreso' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDelete = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const filteredEntries = entries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Sistema Financiero</h1>
        <p className="subtitle">Control de Ingresos y Egresos</p>
      </header>

      <div className="summary-cards">
        <div className="summary-card income">
          <h3>Ingresos Totales</h3>
          <div className="amount">${totals.income.toFixed(2)}</div>
          <div className="trend">
            <ArrowUp />
            <span>Entradas de dinero</span>
          </div>
        </div>

        <div className="summary-card expenses">
          <h3>Egresos Totales</h3>
          <div className="amount">${totals.expenses.toFixed(2)}</div>
          <div className="trend">
            <ArrowDown />
            <span>Salidas de dinero</span>
          </div>
        </div>

        <div className="summary-card balance">
          <h3>Balance Actual</h3>
          <div className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
            ${Math.abs(balance).toFixed(2)}
          </div>
          <div className="trend">
            {balance >= 0 ? 'Superávit' : 'Déficit'}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="alert success">
          <CheckCircle className="alert-icon" />
          <span>Transacción registrada exitosamente</span>
          <button className="alert-close" onClick={() => setShowSuccess(false)}>
            <X />
          </button>
        </div>
      )}

      {showError && (
        <div className="alert error">
          <AlertCircle className="alert-icon" />
          <span>Por favor complete todos los campos</span>
          <button className="alert-close" onClick={() => setShowError(false)}>
            <X />
          </button>
        </div>
      )}

      <div className="card transaction-form">
        <h2>Nueva Transacción</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="date">Fecha</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <input
                type="text"
                id="description"
                placeholder="Descripción de la transacción"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Monto</label>
              <input
                type="number"
                id="amount"
                placeholder="0.00"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="type">Tipo</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <PlusCircle />
              <span>Agregar Transacción</span>
            </button>
          </div>
        </form>
      </div>

      <div className="card transactions-table">
        <div className="table-header">
          <h2>Registro de Transacciones</h2>
          <div className="table-actions">
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar transacción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-outline">
              <Download />
              <span>Exportar</span>
            </button>
            <button className="btn btn-outline">
              <Filter />
              <span>Filtrar</span>
            </button>
          </div>
        </div>
        
        <div className="table-container">
          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <p>No hay transacciones registradas</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>{entry.description}</td>
                    <td className="amount">${entry.amount}</td>
                    <td>
                      <span className={`badge ${entry.type}`}>
                        {entry.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn-icon edit">
                          <Edit2 />
                        </button>
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibroDiario;