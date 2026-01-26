import { useState } from 'react';
import { Button, Form, Card, Container } from 'react-bootstrap';
import { api } from '../services/api';

interface RegisterProps {
    onRegister: () => void;
    onBack: () => void;
}

export default function Register({ onRegister, onBack }: RegisterProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            await api.register({ email, password });
            onRegister(); // Switch back to login or auto-login
        } catch (err: any) {
            setError(err.message || 'Falha no cadastro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Card style={{ width: '400px', borderRadius: '15px' }} className="shadow-sm border-0">
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <h3 className="fw-bold" style={{ color: '#1a233a' }}>Cadastro</h3>
                        <small className="text-muted">Crie sua conta no FisioReport</small>
                    </div>
                    
                    {error && <div className="alert alert-danger py-2 small">{error}</div>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                                placeholder="seu@email.com"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Senha</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                                placeholder="******"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Confirmar Senha</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                required 
                                placeholder="******"
                            />
                        </Form.Group>
                        <Button 
                            variant="dark" 
                            type="submit" 
                            className="w-100 py-2 mb-3" 
                            style={{ backgroundColor: '#1a233a' }}
                            disabled={loading}
                        >
                            {loading ? 'Cadastrando...' : 'Criar Conta'}
                        </Button>
                    </Form>
                    <div className="text-center">
                        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="text-decoration-none small">Voltar para Login</a>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
