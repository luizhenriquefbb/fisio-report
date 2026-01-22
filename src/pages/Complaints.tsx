import { Activity } from 'lucide-react';
import { invoke } from "@tauri-apps/api/core";
import CrudLayout from '../components/CrudLayout';
import { Form } from 'react-bootstrap';

const Complaints = () => {
  const initialData = { name: '' };

  const columns = [
    { key: 'name', label: 'Queixa Principal', render: (item: any) => <div className="fw-bold">{item.name}</div> }
  ];

  const ComplaintForm = ({ data, onChange }: any) => (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Nome</Form.Label>
        <Form.Control 
          type="text" 
          value={data.name} 
          onChange={(e) => onChange({...data, name: e.target.value})} 
          placeholder="Ex: Dor Muscular"
        />
      </Form.Group>
    </Form>
  );

  return (
    <CrudLayout
      title="Queixas"
      subtitle="Tipos de lesões e dores comuns"
      icon={Activity}
      columns={columns}
      initialFormData={initialData}
      FormComponent={ComplaintForm}
      fetchData={() => invoke('get_all_complaints')}
      onCreate={(data) => invoke('create_complaint', { request: data })}
      onUpdate={(data) => invoke('update_complaint', { request: data })}
      onDelete={(id) => invoke('delete_complaint', { id })}
    />
  );
};

export default Complaints;
