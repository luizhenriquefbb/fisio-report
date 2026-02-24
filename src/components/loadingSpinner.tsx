import { Spinner } from "react-bootstrap";

const LoadingSpinner = () => {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 9999,
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="text-center">
        <Spinner
          animation="border"
          role="status"
          style={{ width: "3rem", height: "3rem", color: "#1a233a" }}
        >
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <h6 className="mt-3 fw-bold text-dark" style={{ letterSpacing: "1px" }}>
          PROCESSANDO
        </h6>
      </div>
    </div>
  );
};

export default LoadingSpinner;
