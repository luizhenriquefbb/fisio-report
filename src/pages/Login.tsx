import { useState } from "react";
import { Button, Form, Card, Container } from "react-bootstrap";
import { api } from "../services/api";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login({ email, password });
      localStorage.setItem("token", res.token);
      onLogin();
    } catch (err: any) {
      setError(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <Card
        style={{ width: "400px", borderRadius: "15px" }}
        className="shadow-sm border-0"
      >
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold" style={{ color: "#1a233a" }}>
              FisioReport
            </h3>
            <small className="text-muted">Gestão Clínica Esportiva</small>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small">{error}</div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="******"
              />
            </Form.Group>
            <Button
              variant="dark"
              type="submit"
              className="w-100 py-2 mb-3"
              style={{ backgroundColor: "#1a233a" }}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
