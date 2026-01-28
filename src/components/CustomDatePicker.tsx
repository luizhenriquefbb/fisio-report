import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  clearable?: boolean;
  variant?: "teal" | "white";
}

const CustomDatePicker = ({
  value,
  onChange,
  placeholder = "Selecionar data",
  className = "",
  clearable = false,
  variant = "teal",
}: CustomDatePickerProps) => {
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return placeholder;
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const isTeal = variant === "teal";
  const bgColor = isTeal ? "#52a397" : "#ffffff";
  const textColor = isTeal ? "#ffffff" : "#6c757d";
  const iconColor = isTeal ? "#ffffff" : "#6c757d";

  return (
    <div
      className={`position-relative d-inline-flex align-items-center ${className}`}
      style={{ minWidth: className.includes("w-100") ? "auto" : "220px" }}
    >
      <input
        type="date"
        className="position-absolute w-100 h-100 opacity-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ cursor: "pointer", left: 0, top: 0, zIndex: 2 }}
        title="Selecionar Data"
      />
      <div
        className="form-control d-flex align-items-center border-0 shadow-sm px-3 py-2 w-100"
        style={{
          borderRadius: "10px",
          cursor: "pointer",
          height: "45px",
          backgroundColor: bgColor,
          color: textColor,
          transition: "all 0.2s ease",
        }}
      >
        <CalendarIcon size={18} style={{ color: iconColor }} className="me-2" />
        <span className="fw-medium flex-grow-1" style={{ fontSize: "0.9rem" }}>
          {formatDisplayDate(value)}
        </span>

        {clearable && value ? (
          <X
            size={16}
            className="ms-2"
            style={{ color: iconColor, cursor: "pointer", zIndex: 5 }}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        ) : (
          <ChevronDown
            size={16}
            className="ms-2 opacity-50"
            style={{ color: iconColor }}
          />
        )}
      </div>
    </div>
  );
};

export default CustomDatePicker;
