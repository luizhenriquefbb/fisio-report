import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReportPdf = async ({
  date,
  therapists,
  finalNotes,
  records,
}: {
  date: string;
  therapists: string[];
  finalNotes: string;
  records: {
    player_name: string;
    complaint: string;
    shift: string;
    treatment: string;
    status: string;
    observation?: string;
  }[];
}) => {
  try {
    const doc = new jsPDF();

    // 1. Format Date (e.g., 10/01/2026 – Sábado)
    const [year, month, day] = date.split("-");
    if (
      !year ||
      !month ||
      !day ||
      isNaN(+year) ||
      isNaN(+month) ||
      isNaN(+day)
    ) {
      throw new Error(`Invalid date format: "${date}". Expected YYYY-MM-DD.`);
    }
    const dateObj = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    );
    const daysOfWeek = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    const dayName = daysOfWeek[dateObj.getDay()];
    const formattedDate = `${day}/${month}/${year} – ${dayName}`;

    // Helper for status colors
    const getStatusStyles = (status: string) => {
      const statusLowerCase = status.toLowerCase();
      if (statusLowerCase.includes("não liberado")) {
        return { fillColor: [255, 0, 0], textColor: [255, 255, 255] }; // Red
      }
      if (
        statusLowerCase.includes("liberado") &&
        !statusLowerCase.includes("não") &&
        !statusLowerCase.includes("transição") &&
        !statusLowerCase.includes("inicio")
      ) {
        return { fillColor: [40, 167, 69], textColor: [255, 255, 255] }; // Green
      }
      if (
        statusLowerCase.includes("transição") ||
        statusLowerCase.includes("inicio")
      ) {
        return { fillColor: [255, 235, 59], textColor: [0, 0, 0] }; // Yellow
      }
      return null;
    };

    // 2. Header - Layout variables
    const PAGE_WIDTH = 210;
    // const PAGE_HEIGHT = 297;
    const MARGIN_LEFT = 20;
    const MARGIN_RIGHT = 190;
    const centerOfPageX = PAGE_WIDTH / 2;
    const LINE_HEIGHT = 5;
    const TEXT_SPACING = 10;

    // Logo positioning
    const LOGO_BASE64 = ""; // Replace with base64 string or keep empty for no logo
    const imageX = LOGO_BASE64 ? MARGIN_LEFT : 0;
    const imageY = LOGO_BASE64 ? 10 : 0;
    const imageWidth = LOGO_BASE64 ? 25 : 0;
    const imageHeight = LOGO_BASE64 ? 25 : 0;

    if (LOGO_BASE64) {
      try {
        doc.addImage(
          LOGO_BASE64,
          "PNG",
          imageX,
          imageY,
          imageWidth,
          imageHeight,
        );
      } catch (e) {
        console.error("Error adding logo to PDF", e);
      }
    }

    // Header text positioning
    let currentY = imageHeight > 0 ? imageY + imageHeight + 5 : 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("{Nome da Equipe}", centerOfPageX, currentY, {
      align: "center",
    });
    currentY += TEXT_SPACING;

    doc.setFontSize(12);
    doc.text(
      "RELATÓRIO DIÁRIO DE ATENDIMENTOS – FISIOTERAPIA",
      centerOfPageX,
      currentY,
      {
        align: "center",
      },
    );
    currentY += TEXT_SPACING;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Departamento de Fisioterapia", centerOfPageX, currentY, {
      align: "center",
    });
    currentY += TEXT_SPACING;

    const therapistsText = `Fisioterapeutas Responsáveis: ${therapists.join(" – ")}`;
    const splitTherapists = doc.splitTextToSize(therapistsText, 75);
    doc.text(splitTherapists, centerOfPageX, currentY, {
      align: "center",
    });
    currentY += splitTherapists.length * LINE_HEIGHT + 5;

    // Horizontal line after header
    doc.setLineWidth(0.2);
    doc.line(MARGIN_LEFT, currentY, MARGIN_RIGHT, currentY);
    currentY += TEXT_SPACING + 2;

    // 3. Section Title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "Registros clínicos e terapêuticos",
      centerOfPageX,
      currentY,
      {
        align: "center",
      },
    );
    currentY += TEXT_SPACING;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(formattedDate, centerOfPageX, currentY, {
      align: "center",
    });
    const dateWidth = doc.getTextWidth(formattedDate);
    doc.line(
      centerOfPageX - dateWidth / 2,
      currentY + 1,
      centerOfPageX + dateWidth / 2,
      currentY + 1,
    );
    currentY += TEXT_SPACING;

    // 4. Records Table
    autoTable(doc, {
      startY: currentY,
      head: [
        ["ATLETA", "QUEIXA", "PERIODO", "TRATAMENTO", "STATUS", "OBSERVAÇÕES"],
      ],
      body: records.map((r) => [
        r.player_name,
        r.complaint,
        r.shift,
        r.treatment,
        r.status,
        r.observation || "-",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
        valign: "middle",
        fontSize: 8,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        valign: "middle",
        halign: "center",
        overflow: "linebreak",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { halign: "left", cellWidth: 45 },
        4: { cellWidth: 30 },
        5: { halign: "left", cellWidth: 45 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          const styles = getStatusStyles(data.cell.raw as string);
          if (styles) {
            data.cell.styles.fillColor = styles.fillColor as [
              number,
              number,
              number,
            ];
            data.cell.styles.textColor = styles.textColor as [
              number,
              number,
              number,
            ];
          }
        }
      },
      margin: { left: 10, right: 10 },
    });

    // 5. Final Notes (Relatório da Massagem)
    if (finalNotes) {
      let notesY = (doc as any).lastAutoTable.finalY + 15;
      const NOTES_SPACING = 10;
      const PAGE_THRESHOLD = 260;

      // Check for page overflow
      if (notesY > PAGE_THRESHOLD) {
        doc.addPage();
        doc.setPage(doc.getNumberOfPages());
        notesY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("OBSERVAÇÕES GERAIS", MARGIN_LEFT, notesY);
      notesY += NOTES_SPACING;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const NOTES_WIDTH = 170;
      const splitNotes = doc.splitTextToSize(finalNotes, NOTES_WIDTH);
      doc.text(splitNotes, MARGIN_LEFT, notesY);
    }

    // 6. Output
    const pdfArrayBuffer = doc.output("arraybuffer");

    return new Response(pdfArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Relatorio_Fisio_${date}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("[PDF] Generation error:", error);
    throw error;
  }
};
