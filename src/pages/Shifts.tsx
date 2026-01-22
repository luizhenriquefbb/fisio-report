import { Clock } from 'lucide-react';
import { invoke } from "@tauri-apps/api/core";
import CrudLayout from '../components/CrudLayout';
import { Form } from 'react-bootstrap';

const Shifts = () => {
  const initialData = { name: '' };

  const columns = [
    { key: 'name', label: 'Período', render: (item: any) => <div className="fw-bold">{item.name}</div> }
  ];

  const ShiftForm = ({ data, onChange }: any) => (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Nome</Form.Label>
        <Form.Control 
          type="text" 
          value={data.name} 
          onChange={(e) => onChange({...data, name: e.target.value})} 
          placeholder="Ex: Manhã"
        />
      </Form.Group>
    </Form>
  );

  return (
    <CrudLayout
      title="Períodos"
      subtitle="Turnos de tratamento"
      icon={Clock}
      columns={columns}
      initialFormData={initialData}
      FormComponent={ShiftForm}
      fetchData={() => invoke('get_all_shifts')}
      onCreate={(data) => invoke('create_shift', { request: data })}
      onUpdate={(data) => invoke('update_shift', { request: data })}
      onDelete={(id) => invoke('delete_shift', { id })}
    />
  );
};

export default Shifts;
