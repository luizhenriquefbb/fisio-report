import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LOGO_BASE64 } from "../assets/logo";

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

    // 2. Header
    // Logo
    const imageX = LOGO_BASE64 ? 20 : 0;
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

    const imageAlignmentX = 105; // Center of the page (210mm width / 2)

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("BOTAFOGO FUTEBOL CLUBE – SAF", imageAlignmentX, 18, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(
      "RELATÓRIO DIÁRIO DE ATENDIMENTOS – FISIOTERAPIA",
      imageAlignmentX,
      25,
      {
        align: "center",
      },
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Departamento de Fisioterapia", imageAlignmentX, 31, {
      align: "center",
    });

    const therapistsText = `Fisioterapeutas Responsáveis: ${therapists.join(" – ")}`;
    const splitTherapists = doc.splitTextToSize(therapistsText, 75);
    doc.text(splitTherapists, imageAlignmentX, 37, {
      align: "center",
    });

    const headerBottomY = 37 + splitTherapists.length * 5;
    doc.setLineWidth(0.2);
    doc.line(20, headerBottomY, 190, headerBottomY);

    // 3. Section Title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Registros clínicos e terapêuticos", 115, headerBottomY + 10, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(formattedDate, 105, headerBottomY + 20, {
      align: "center",
    });
    const dateWidth = doc.getTextWidth(formattedDate);
    doc.line(
      105 - dateWidth / 2,
      headerBottomY + 21,
      105 + dateWidth / 2,
      headerBottomY + 21,
    );

    // 4. Records Table
    autoTable(doc, {
      startY: headerBottomY + 30,
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
    });

    // 5. Final Notes (Relatório da Massagem)
    if (finalNotes) {
      const finalY = (doc as any).lastAutoTable.finalY + 15;

      // Check for page overflow
      if (finalY > 260) {
        doc.addPage();
        doc.setPage(doc.getNumberOfPages());
      }

      const currentY = finalY > 260 ? 20 : finalY;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("OBSERVAÇÕES GERAIS", 20, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(finalNotes, 170);
      doc.text(splitNotes, 20, currentY + 10);
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
