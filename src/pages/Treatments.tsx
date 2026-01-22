import { Stethoscope } from 'lucide-react';
import { invoke } from "@tauri-apps/api/core";
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
      fetchData={() => invoke('get_all_treatments')}
      onCreate={(data) => invoke('create_treatment', { request: data })}
      onUpdate={(data) => invoke('update_treatment', { request: data })}
      onDelete={(id) => invoke('delete_treatment', { id })}
    />
  );
};

export default Treatments;
