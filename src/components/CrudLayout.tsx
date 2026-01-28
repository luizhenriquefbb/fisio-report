import { useState, useEffect } from 'react';
import { Button, Modal, Dropdown } from 'react-bootstrap';
import { Plus, Search, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { message, confirm } from "../services/dialog";

// Interfaces generic enough to handle all entity types
interface GenericItem {
  id: number;
  [key: string]: any;
}

interface Column {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
}

interface CrudLayoutProps {
  title: string;
  subtitle: string;
  icon: any;
  columns: Column[];
  fetchData: () => Promise<GenericItem[]>;
  onDelete: (id: number) => Promise<void>;
  onCreate: (data: any) => Promise<void>;
  onUpdate: (data: any) => Promise<void>;
  FormComponent: React.FC<{ data: any, onChange: (data: any) => void }>;
  initialFormData: any;
}

const CrudLayout = ({
  title,
  subtitle,
  icon: Icon,
  columns,
  fetchData,
  onDelete,
  onCreate,
  onUpdate,
  FormComponent,
  initialFormData
}: CrudLayoutProps) => {
  const [items, setItems] = useState<GenericItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadItems = async () => {
    try {
      const data = await fetchData();
      setItems(data);
    } catch (err) {
      console.error(err);
      await message("Erro ao carregar dados: " + err, { title: 'Erro', kind: 'error' });
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: GenericItem) => {
    setFormData(item);
    setIsEditing(true);
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm('Tem certeza que deseja excluir este item?', { title: 'Confirmar Exclusão', kind: 'warning' });
    if (!confirmed) return;

    try {
      await onDelete(id);
      await message("Item excluído com sucesso.", { title: 'Sucesso', kind: 'info' });
      loadItems();
    } catch (err) {
      await message("Erro ao excluir: " + err, { title: 'Erro', kind: 'error' });
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await onUpdate({ ...formData, id: editingId });
        await message("Item atualizado com sucesso.", { title: 'Sucesso', kind: 'info' });
      } else {
        await onCreate(formData);
        await message("Item criado com sucesso.", { title: 'Sucesso', kind: 'info' });
      }
      setShowModal(false);
      loadItems();
    } catch (err) {
      await message("Erro ao salvar: " + err, { title: 'Erro', kind: 'error' });
    }
  };

  const filteredItems = items.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-3 p-md-4 bg-light" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 mb-md-5">
        <div className="d-flex align-items-center gap-3">
             <div className="p-3 rounded-3 bg-white shadow-sm">
                <Icon size={24} className="text-primary" />
             </div>
             <div>
                <h4 className="mb-0 fw-bold">{title}</h4>
                <small className="text-muted">{subtitle}</small>
             </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="card-header bg-white border-0 p-4 d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
            <div className="position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input
                    type="text"
                    className="form-control ps-5 bg-light border-0 crud-search-input"
                    placeholder="Filtrar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: '8px' }}
                />
            </div>
            <Button
                variant="dark"
                onClick={handleOpenCreate}
                className="d-flex align-items-center justify-content-center px-3"
                style={{ borderRadius: '8px', backgroundColor: '#1a233a' }}
            >
                <Plus size={18} className="me-2" />
                Novo
            </Button>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="bg-light text-muted small text-uppercase fw-bold">
                <tr>
                  {columns.map(col => (
                    <th key={col.key} className="ps-4 py-3 border-0" style={{ whiteSpace: 'nowrap' }}>{col.label}</th>
                  ))}
                  <th className="pe-4 py-3 border-0 text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="border-top">
                    {columns.map(col => (
                      <td key={col.key} className="ps-4 py-3 border-0" style={{ whiteSpace: 'nowrap' }}>
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    <td className="pe-4 py-3 border-0 text-end">
                      <Dropdown align="end">
                          <Dropdown.Toggle variant="link" className="text-muted p-0 border-0" id={`dropdown-${item.id}`}>
                              <MoreVertical size={18} />
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleOpenEdit(item)}>
                                  <Pencil size={14} className="me-2" /> Editar
                              </Dropdown.Item>
                              <Dropdown.Item className="text-danger" onClick={() => handleDelete(item.id)}>
                                  <Trash2 size={14} className="me-2" /> Remover
                              </Dropdown.Item>
                          </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredItems.length === 0 && (
              <div className="text-center py-5 text-muted">
                  Nenhum registro encontrado.
              </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{isEditing ? 'Editar' : 'Novo'} Registro</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
             <FormComponent data={formData} onChange={setFormData} />
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-4 pe-4">
          <Button variant="light" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="dark"
            onClick={handleSubmit}
            style={{ backgroundColor: '#1a233a', borderColor: '#1a233a' }}
          >
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CrudLayout;
