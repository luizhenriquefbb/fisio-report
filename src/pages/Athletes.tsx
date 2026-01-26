import { Users } from 'lucide-react';
import { api } from '../services/api';
import CrudLayout from '../components/CrudLayout';
import { Form } from 'react-bootstrap';

const Athletes = () => {
  const initialData = { name: '', position: '', photo: '' };

  const columns = [
    { key: 'name', label: 'Nome', render: (item: any) => (
        <div className="d-flex align-items-center">
             <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" 
                  style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                  {item.name.charAt(0)}
             </div>
             <div>
                <div className="fw-bold">{item.name}</div>
             </div>
        </div>
    )},
    { key: 'position', label: 'Posição' }
  ];

  const AthleteForm = ({ data, onChange }: any) => (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Nome do Atleta</Form.Label>
        <Form.Control 
          type="text" 
          value={data.name} 
          onChange={(e) => onChange({...data, name: e.target.value})} 
          placeholder="Ex: João Silva"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Posição</Form.Label>
        <Form.Control 
          type="text" 
          value={data.position} 
          onChange={(e) => onChange({...data, position: e.target.value})} 
          placeholder="Ex: Meia, Atacante"
        />
      </Form.Group>
      {/* Photo field skipped for simplicity/mock */}
    </Form>
  );

  return (
    <CrudLayout
      title="Atletas"
      subtitle="Gerencie o elenco de jogadores"
      icon={Users}
      columns={columns}
      initialFormData={initialData}
      FormComponent={AthleteForm}
      fetchData={() => api.getPlayers()}
      onCreate={(data) => api.createPlayer(data)}
      onUpdate={(data) => api.updatePlayer(data)}
      onDelete={(id) => api.deletePlayer(id)}
    />
  );
};

export default Athletes;
