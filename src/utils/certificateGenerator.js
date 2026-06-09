import jsPDF from 'jspdf';

export function generateCertificatePDF({ userName, courseTitle, issuedAt, certificateId }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const W = 297;
  const H = 210;

  // Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, W, H, 'F');

  // Outer border
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(3);
  doc.rect(8, 8, W - 16, H - 16);

  // Inner border
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(1);
  doc.rect(12, 12, W - 24, H - 24);

  // Top decorative stripe
  doc.setFillColor(37, 99, 235);
  doc.rect(8, 8, W - 16, 14, 'F');

  // Bottom decorative stripe
  doc.rect(8, H - 22, W - 16, 14, 'F');

  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('LEARNHUB LEARNING MANAGEMENT SYSTEM', W / 2, 17, { align: 'center' });

  // Certificate of Completion
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.text('Certificate of Completion', W / 2, 55, { align: 'center' });

  // Divider line
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(0.8);
  doc.line(60, 62, W - 60, 62);

  // Presented to
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('This is to certify that', W / 2, 77, { align: 'center' });

  // Name
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(userName, W / 2, 96, { align: 'center' });

  // Name underline
  const nameWidth = doc.getTextWidth(userName);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.5);
  doc.line(W / 2 - nameWidth / 2 - 5, 99, W / 2 + nameWidth / 2 + 5, 99);

  // Has successfully completed
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('has successfully completed', W / 2, 112, { align: 'center' });

  // Course title
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(courseTitle, 200);
  doc.text(titleLines, W / 2, 124, { align: 'center' });

  // Date
  const dateStr = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Date section
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 50, 155, W / 2 + 50, 155);

  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(dateStr, W / 2, 148, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Date of Completion', W / 2, 162, { align: 'center' });

  // Certificate ID
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Certificate ID: ${certificateId}`, W / 2, H - 12, { align: 'center' });

  // Corner decorations
  const drawCorner = (x, y, rx, ry) => {
    doc.setFillColor(219, 234, 254);
    doc.circle(x, y, 6, 'F');
  };
  drawCorner(14, 14);
  drawCorner(W - 14, 14);
  drawCorner(14, H - 14);
  drawCorner(W - 14, H - 14);

  doc.save(`Certificate-${userName.replace(/\s+/g, '_')}-${courseTitle.slice(0, 20).replace(/\s+/g, '_')}.pdf`);
}
