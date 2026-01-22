import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface ObservationModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (observation: string) => void;
  initialObservation: string;
}

const ObservationModal = ({ show, onHide, onSave, initialObservation }: ObservationModalProps) => {
  const [observation, setObservation] = useState(initialObservation);

  useEffect(() => {
    setObservation(initialObservation);
  }, [initialObservation, show]);

  const handleSave = () => {
    onSave(observation);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">Editar Observação</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form>
          <Form.Group>
            <Form.Label className="fw-semibold small text-muted text-uppercase">Observações</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={5} 
              placeholder="Descreva detalhes da evolução clínica..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
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
          onClick={handleSave} 
          className="px-4"
          style={{ backgroundColor: '#1a233a', borderColor: '#1a233a' }}
        >
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ObservationModal;
