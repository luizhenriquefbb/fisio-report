import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { api } from '../services/api';
import { message } from "@tauri-apps/plugin-dialog";

interface LookupItem {
  id: number;
  name: string;
  color?: string;
}

interface Player {
  id: number;
  name: string;
  position: string;
  photo?: string;
}

interface LookupData {
  players: Player[];
  complaints: LookupItem[];
  shifts: LookupItem[];
  treatments: LookupItem[];
  status: LookupItem[];
}

interface NewRecordModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
}

const NewRecordModal = ({ show, onHide, onSave }: NewRecordModalProps) => {
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [formData, setFormData] = useState({
    playerId: '',
    complaintId: '',
    shiftId: '',
    treatmentId: '',
    statusId: '',
    observation: ''
  });

  useEffect(() => {
    if (show) {
      loadLookupData();
      // Reset form
      setFormData({
        playerId: '',
        complaintId: '',
        shiftId: '',
        treatmentId: '',
        statusId: '',
        observation: ''
      });
    }
  }, [show]);

  const loadLookupData = async () => {
    try {
      const data = await api.getLookupOptions();
      setLookupData(data as LookupData);
    } catch (err) {
      console.error(err);
      await message("Erro ao carregar opções: " + err, { title: 'Erro', kind: 'error' });
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.playerId || !formData.complaintId || !formData.shiftId || !formData.treatmentId || !formData.statusId) {
      await message("Por favor, preencha todos os campos obrigatórios.", { title: 'Atenção', kind: 'warning' });
      return;
    }

    try {
      await api.createRecord({
        playerId: parseInt(formData.playerId),
        complaintId: parseInt(formData.complaintId),
        shiftId: parseInt(formData.shiftId),
        treatmentId: parseInt(formData.treatmentId),
        statusId: parseInt(formData.statusId),
        observation: formData.observation
      });
      await message("Registro criado com sucesso!", { title: 'Sucesso', kind: 'info' });
      onSave();
      onHide();
    } catch (err) {
      await message("Erro ao salvar: " + err, { title: 'Erro', kind: 'error' });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Novo Registro</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p className="text-muted mb-4">Preencha os dados do atleta para o relatório diário.</p>
        
        <Form>
          <div className="row mb-3">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-muted text-uppercase">Atleta</Form.Label>
                <Form.Select 
                  value={formData.playerId} 
                  onChange={(e) => setFormData({...formData, playerId: e.target.value})}
                  className="py-2"
                >
                  <option value="">Selecione...</option>
                  {lookupData?.players.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.position}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
               <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-muted text-uppercase">Queixa Principal</Form.Label>
                <Form.Select 
                  value={formData.complaintId} 
                  onChange={(e) => setFormData({...formData, complaintId: e.target.value})}
                  className="py-2"
                >
                  <option value="">Selecione...</option>
                  {lookupData?.complaints.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-muted text-uppercase">Período</Form.Label>
                <Form.Select 
                   value={formData.shiftId} 
                   onChange={(e) => setFormData({...formData, shiftId: e.target.value})}
                   className="py-2"
                >
                  <option value="">Selecione...</option>
                  {lookupData?.shifts.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
             <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-muted text-uppercase">Tratamento Realizado</Form.Label>
                <Form.Select 
                   value={formData.treatmentId} 
                   onChange={(e) => setFormData({...formData, treatmentId: e.target.value})}
                   className="py-2"
                >
                  <option value="">Selecione...</option>
                  {lookupData?.treatments.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small text-muted text-uppercase d-block">Status do Atleta</Form.Label>
            <div className="d-flex gap-3">
              {lookupData?.status.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setFormData({...formData, statusId: s.id.toString()})}
                  className={`p-3 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${formData.statusId === s.id.toString() ? 'border-2 border-dark bg-light' : ''}`}
                  style={{ cursor: 'pointer', minWidth: '140px' }}
                >
                  <div 
                    className="rounded-circle" 
                    style={{ width: '12px', height: '12px', backgroundColor: s.color || '#ccc' }}
                  ></div>
                  <span className="fw-medium">{s.name}</span>
                </div>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-muted text-uppercase">Observações</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Descreva detalhes da evolução clínica..."
              value={formData.observation}
              onChange={(e) => setFormData({...formData, observation: e.target.value})}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 pb-4 pe-4">
        <Button variant="light" onClick={onHide} className="px-4">
          Cancelar
        </Button>
        <Button 
          variant="dark" 
          onClick={handleSubmit} 
          className="px-4"
          style={{ backgroundColor: '#1a233a', borderColor: '#1a233a' }}
        >
          Salvar Registro
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewRecordModal;
