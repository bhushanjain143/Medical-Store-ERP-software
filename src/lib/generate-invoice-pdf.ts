import jsPDF from "jspdf";

interface InvoiceItem {
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  gstRate: number;
  gstAmount: number;
  discount: number;
  medicine: { name: string };
  batch: { batchNumber: string };
}

interface InvoiceData {
  invoiceNumber: string;
  totalAmount: number;
  paymentMode: string;
  discount: number;
  gstAmount: number;
  subtotal: number;
  createdAt: string;
  notes: string | null;
  customer: { name: string; phone: string | null } | null;
  user: { name: string };
  items: InvoiceItem[];
}

function fmtCurrency(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateInvoicePDF(sale: InvoiceData, storeName = "MedStore ERP") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const TEAL = [13, 148, 136] as const;
  const DARK = [30, 41, 59] as const;
  const GRAY = [100, 116, 139] as const;
  const LIGHT_BG = [248, 250, 252] as const;

  // ── Header band ──
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pageW, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(storeName, margin, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Medical Store - GST Tax Invoice", margin, 21);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(sale.invoiceNumber, pageW - margin, 14, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(fmtDate(sale.createdAt), pageW - margin, 21, { align: "right" });

  y = 40;

  // ── Bill To / Billed By ──
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentW, 24, 2, 2, "F");

  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", margin + 4, y + 6);
  doc.text("BILLED BY", pageW / 2 + 4, y + 6);

  doc.setTextColor(...DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(sale.customer?.name || "Walk-in Customer", margin + 4, y + 13);
  doc.text(sale.user.name, pageW / 2 + 4, y + 13);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  if (sale.customer?.phone) {
    doc.text(`Ph: ${sale.customer.phone}`, margin + 4, y + 19);
  }
  doc.text(`Payment: ${sale.paymentMode.toUpperCase()}`, pageW / 2 + 4, y + 19);

  y += 30;

  // ── Items table ──
  const cols = [
    { label: "#", w: 8, align: "center" as const },
    { label: "Medicine", w: 0, align: "left" as const },
    { label: "Batch", w: 22, align: "left" as const },
    { label: "Qty", w: 14, align: "center" as const },
    { label: "Rate", w: 22, align: "right" as const },
    { label: "GST%", w: 16, align: "right" as const },
    { label: "CGST", w: 22, align: "right" as const },
    { label: "SGST", w: 22, align: "right" as const },
    { label: "Amount", w: 24, align: "right" as const },
  ];

  const fixedW = cols.reduce((s, c) => s + c.w, 0);
  cols[1].w = contentW - fixedW;

  // Table header
  doc.setFillColor(...TEAL);
  doc.rect(margin, y, contentW, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");

  let colX = margin;
  for (const col of cols) {
    const tx = col.align === "right" ? colX + col.w - 2 : col.align === "center" ? colX + col.w / 2 : colX + 2;
    doc.text(col.label, tx, y + 5.5, { align: col.align });
    colX += col.w;
  }

  y += 8;

  // Table rows
  doc.setFontSize(8);
  sale.items.forEach((item, i) => {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }

    const rowH = 9;
    const isEven = i % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentW, rowH, "F");
    }

    const itemGst = (item.totalAmount * item.gstRate) / (100 + item.gstRate);

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    colX = margin;

    const rowData = [
      { text: (i + 1).toString(), align: "center" as const },
      { text: item.medicine.name.length > 28 ? item.medicine.name.substring(0, 26) + "..." : item.medicine.name, align: "left" as const },
      { text: item.batch.batchNumber, align: "left" as const },
      { text: item.quantity.toString(), align: "center" as const },
      { text: fmtCurrency(item.unitPrice), align: "right" as const },
      { text: `${item.gstRate}%`, align: "right" as const },
      { text: fmtCurrency(itemGst / 2), align: "right" as const },
      { text: fmtCurrency(itemGst / 2), align: "right" as const },
      { text: fmtCurrency(item.totalAmount), align: "right" as const },
    ];

    rowData.forEach((cell, ci) => {
      const col = cols[ci];
      const tx = cell.align === "right" ? colX + col.w - 2 : cell.align === "center" ? colX + col.w / 2 : colX + 2;
      doc.text(cell.text, tx, y + 6, { align: cell.align });
      colX += col.w;
    });

    y += rowH;
  });

  // Table bottom line
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentW, y);

  y += 6;

  // ── Totals section ──
  const totalsX = pageW / 2 + 10;
  const totalsW = pageW - margin - totalsX;

  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(totalsX, y, totalsW, sale.discount > 0 ? 52 : 44, 2, 2, "F");

  const drawRow = (label: string, value: string, bold = false, color: readonly [number, number, number] = DARK) => {
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(label, totalsX + 4, y);
    doc.setTextColor(...color);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 8);
    doc.text(value, totalsX + totalsW - 4, y, { align: "right" });
    y += bold ? 7 : 6;
  };

  y += 6;
  const preTaxAmount = sale.subtotal - sale.gstAmount;
  drawRow("Subtotal (before tax)", fmtCurrency(preTaxAmount));
  drawRow("CGST", fmtCurrency(sale.gstAmount / 2));
  drawRow("SGST", fmtCurrency(sale.gstAmount / 2));
  drawRow("Total GST (incl.)", fmtCurrency(sale.gstAmount));

  if (sale.discount > 0) {
    drawRow("Discount", `- ${fmtCurrency(sale.discount)}`, false, [239, 68, 68]);
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX + 4, y - 2, totalsX + totalsW - 4, y - 2);
  y += 2;
  drawRow("Grand Total", fmtCurrency(sale.totalAmount), true, TEAL);

  // Notes
  if (sale.notes) {
    y += 8;
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(`Note: ${sale.notes}`, margin, y);
  }

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, footerY - 4, pageW - margin, footerY - 4);
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your purchase! This is a computer-generated invoice.", pageW / 2, footerY, { align: "center" });
  doc.text(`Generated by ${storeName}`, pageW / 2, footerY + 4, { align: "center" });

  doc.save(`${sale.invoiceNumber}.pdf`);
}
