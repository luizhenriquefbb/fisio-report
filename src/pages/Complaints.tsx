import { Activity } from 'lucide-react';
import { api } from '../services/api';
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
      fetchData={() => api.getComplaints()}
      onCreate={(data) => api.createComplaint(data)}
      onUpdate={(data) => api.updateComplaint(data)}
      onDelete={(id) => api.deleteComplaint(id)}
    />
  );
};

export default Complaints;
