import { useState, useRef } from 'react';
import { Button, Input } from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

const ListaTipoDocumentos = ({ tiposDocumentos, agregarTipoDocumento, actualizarTipoDocumento, eliminarTipoDocumento }) => {
  const [nuevoTipoDocumento, setNuevoTipoDocumento] = useState('');
  const [tipoDocumentoToUpdate, setTipoDocumentoToUpdate] = useState(null);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setNuevoTipoDocumento(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nuevoTipoDocumento.trim().length <= 3) {
      alert('El nombre del tipo de documento debe tener más de 3 letras.');
      return;
    }
    if (tipoDocumentoToUpdate) {
      actualizarTipoDocumento(tipoDocumentoToUpdate.id, nuevoTipoDocumento);
      setTipoDocumentoToUpdate(null);
    } else {
      agregarTipoDocumento(nuevoTipoDocumento);
    }
    setNuevoTipoDocumento('');
  };

  const handleEdit = (tipoDocumento) => {
    setTipoDocumentoToUpdate(tipoDocumento);
    setNuevoTipoDocumento(tipoDocumento.nombre);
    inputRef.current.focus();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este tipo de documento?')) {
      eliminarTipoDocumento(id);
    }
  };

  return (
    <div>
      <h2>Lista de Tipos de Documentos</h2>
      <form onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          type="text"
          value={nuevoTipoDocumento}
          onChange={handleInputChange}
          placeholder="Ingrese un tipo de documento"
        />
        <Button type="submit">{tipoDocumentoToUpdate ? 'Actualizar' : 'Agregar'}</Button>
      </form>
      <ul>
        {tiposDocumentos.map((tipo) => (
          <li key={tipo.id}>
            {tipo.nombre}
            <Button onClick={() => handleEdit(tipo)}><Pencil /></Button>
            <Button onClick={() => handleDelete(tipo.id)}><Trash2 /></Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaTipoDocumentos;
