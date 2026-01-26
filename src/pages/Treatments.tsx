import { Stethoscope } from 'lucide-react';
import { api } from '../services/api';
import CrudLayout from '../components/CrudLayout';
import { Form } from 'react-bootstrap';

const Treatments = () => {
  const initialData = { name: '' };

  const columns = [
    { key: 'name', label: 'Nome do Tratamento', render: (item: any) => <div className="fw-bold">{item.name}</div> }
  ];

  const TreatmentForm = ({ data, onChange }: any) => (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Nome</Form.Label>
        <Form.Control 
          type="text" 
          value={data.name} 
          onChange={(e) => onChange({...data, name: e.target.value})} 
          placeholder="Ex: Crioterapia"
        />
      </Form.Group>
    </Form>
  );

  return (
    <CrudLayout
      title="Tratamentos"
      subtitle="Tipos de tratamentos disponíveis"
      icon={Stethoscope}
      columns={columns}
      initialFormData={initialData}
      FormComponent={TreatmentForm}
      fetchData={() => api.getTreatments()}
      onCreate={(data) => api.createTreatment(data)}
      onUpdate={(data) => api.updateTreatment(data)}
      onDelete={(id) => api.deleteTreatment(id)}
    />
  );
};

export default Treatments;
