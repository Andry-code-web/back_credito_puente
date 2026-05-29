const PDFDocument = require('pdfkit');

/**
 * Formats a number to currency string based on the currency code.
 */
function formatCurrency(amount, currency) {
   const symbol = (currency && currency.toLowerCase() === 'usd') ? '$' : 'S/.';
   const parsedAmount = parseFloat(amount);
   if (isNaN(parsedAmount)) return `${symbol} 0.00`;
   return `${symbol} ${parsedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formats a date string to a readable format (DD/MM/YYYY).
 */
function formatDate(dateString) {
   if (!dateString) return '-';
   try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      // Add time zone offset to prevent off-by-one errors from UTC conversion
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() + userTimezoneOffset);

      const day = String(localDate.getDate()).padStart(2, '0');
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const year = localDate.getFullYear();
      return `${day}/${month}/${year}`;
   } catch (e) {
      return dateString;
   }
}

/**
 * Generates the loan PDF and streams it to the res object.
 */
function generateLoanPDF(loan, client, advisor, investor, cuotas, res) {
   const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

   // Stream the PDF directly to the Express response object
   doc.pipe(res);

   // Color definitions
   const primaryColor = '#0DA071'; // Deep Navy
   const secondaryColor = '#4a5568'; // Slate Gray
   const lightBgColor = '#f7fafc'; // Very light gray/blue
   const borderColor = '#e2e8f0'; // Light gray border
   const accentColor = '#0DA071'; // Accent Blue

   // Draw header and details page
   drawPageHeader(doc, loan.id, primaryColor, secondaryColor, borderColor);

   let currentY = 105;

   // Draw Grid Boxes
   drawInfoGrid(doc, currentY, loan, client, advisor, investor, primaryColor, secondaryColor, lightBgColor, borderColor);

   currentY += 150; // Move below the grid boxes

   // Payments schedule section title
   doc.fillColor(primaryColor)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('CRONOGRAMA DE PAGOS', 50, currentY);

   currentY += 22;

   // Table Headers configuration
   const cols = [
      { label: 'N°', width: 30, align: 'center' },
      { label: 'Vencimiento', width: 85, align: 'left' },
      { label: 'Capital', width: 95, align: 'right' },
      { label: 'Interés', width: 95, align: 'right' },
      { label: 'Monto Cuota', width: 100, align: 'right' },
      { label: 'Saldo Pend.', width: 90, align: 'right' }
   ];

   // Total width of columns is 30 + 85 + 95 + 95 + 100 + 90 = 495 (matches margins: 595.28 - 100)
   const tableX = 50;

   // Draw table headers
   drawTableHeaders(doc, tableX, currentY, cols, primaryColor);
   currentY += 20;

   // Sort cuotas chronologically by due date (just in case)
   const sortedCuotas = [...cuotas].sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

   // Draw table rows with page overflow check
   const rowHeight = 22;
   const pageBottomLimit = 720; // Leave room for footer and signature on the last page

   sortedCuotas.forEach((cuota, index) => {
      // Check if we need a new page
      if (currentY + rowHeight > pageBottomLimit) {
         doc.addPage();
         // Draw header on new page
         drawPageHeader(doc, loan.id, primaryColor, secondaryColor, borderColor);
         currentY = 110;
         // Draw table headers on new page
         drawTableHeaders(doc, tableX, currentY, cols, primaryColor);
         currentY += 20;
      }

      // Draw row background for alternating rows
      if (index % 2 === 1) {
         doc.fillColor(lightBgColor)
            .rect(tableX, currentY, 495, rowHeight)
            .fill();
      }

      // Row border bottom
      doc.strokeColor(borderColor)
         .lineWidth(0.5)
         .moveTo(tableX, currentY + rowHeight)
         .lineTo(tableX + 495, currentY + rowHeight)
         .stroke();

      // Draw cell text
      let colX = tableX;
      doc.fillColor('#2d3748').fontSize(9).font('Helvetica');

      // Column 1: Index (N° Cuota)
      doc.text(String(index + 1), colX, currentY + 6, { width: cols[0].width, align: cols[0].align });
      colX += cols[0].width;

      // Column 2: Due Date
      doc.text(formatDate(cuota.fecha_vencimiento), colX, currentY + 6, { width: cols[1].width, align: cols[1].align });
      colX += cols[1].width;

      // Column 3: Principal (Pago Capital)
      doc.text(formatCurrency(cuota.pago_capital, loan.moneda), colX, currentY + 6, { width: cols[2].width, align: cols[2].align });
      colX += cols[2].width;

      // Column 4: Interest (Pago Interes)
      doc.text(formatCurrency(cuota.pago_interes, loan.moneda), colX, currentY + 6, { width: cols[3].width, align: cols[3].align });
      colX += cols[3].width;

      // Column 5: Installment Total (Monto)
      doc.font('Helvetica-Bold').text(formatCurrency(cuota.monto, loan.moneda), colX, currentY + 6, { width: cols[4].width, align: cols[4].align });
      colX += cols[4].width;
      doc.font('Helvetica'); // Reset

      // Column 6: Remaining Balance
      doc.text(formatCurrency(cuota.saldo_pendiente, loan.moneda), colX, currentY + 6, { width: cols[5].width, align: cols[5].align });

      currentY += rowHeight;
   });

   // Check if signature section fits, if not, add page
   if (currentY + 110 > pageBottomLimit) {
      doc.addPage();
      drawPageHeader(doc, loan.id, primaryColor, secondaryColor, borderColor);
      currentY = 120;
   } else {
      currentY += 30;
   }

   // Draw Disclaimer / Signature Section
   doc.strokeColor(borderColor)
      .lineWidth(1)
      .moveTo(50, currentY)
      .lineTo(545, currentY)
      .stroke();

   currentY += 15;

   doc.fillColor(secondaryColor)
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text('Nota: Este documento constituye un cronograma de pagos informativo sobre el préstamo otorgado. Los pagos deben realizarse de acuerdo con las fechas indicadas. Para cualquier consulta, por favor contacte a su asesor.', 50, currentY, { width: 495, align: 'justify' });

   currentY += 45;

   // Draw signatures
   const signatureY = currentY + 30;

   // Client Signature Line
   doc.strokeColor('#a0aec0')
      .lineWidth(1)
      .moveTo(70, signatureY)
      .lineTo(220, signatureY)
      .stroke();

   doc.fillColor(secondaryColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Firma del Cliente', 70, signatureY + 5, { width: 150, align: 'center' });

   if (client) {
      doc.fontSize(8)
         .font('Helvetica')
         .text(`DNI: ${client.dni || '-'}`, 70, signatureY + 18, { width: 150, align: 'center' });
   }

   // Representative/Advisor Signature Line
   doc.strokeColor('#a0aec0')
      .lineWidth(1)
      .moveTo(375, signatureY)
      .lineTo(525, signatureY)
      .stroke();

   doc.fillColor(secondaryColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Asesor / Representante', 375, signatureY + 5, { width: 150, align: 'center' });

   if (advisor) {
      doc.fontSize(8)
         .font('Helvetica')
         .text(advisor.nombre || 'CRÉDITO PUENTE S.A.', 375, signatureY + 18, { width: 150, align: 'center' });
   }

   // Add page numbers at the footer (for all pages)
   const range = doc.bufferedPageRange();
   for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      // Temporarily disable auto page break and bottom margin to prevent footer from triggering new pages
      const oldAutoPageBreak = doc.options.autoPageBreak;
      const oldBottomMargin = doc.page.margins.bottom;
      doc.options.autoPageBreak = false;
      doc.page.margins.bottom = 0;

      // Footer text
      doc.fillColor('#a0aec0')
         .fontSize(8)
         .font('Helvetica')
         .text(`Página ${i + 1} de ${range.count}`, 50, 805, { align: 'right', width: 495 });

      doc.text('CRÉDITO PUENTE S.A. - Todos los derechos reservados © 2026', 50, 805, { align: 'left', width: 300 });

      // Restore settings
      doc.options.autoPageBreak = oldAutoPageBreak;
      doc.page.margins.bottom = oldBottomMargin;
   }

   // End the document
   doc.end();
}

/**
 * Helper to draw page header
 */
function drawPageHeader(doc, loanId, primaryColor, secondaryColor, borderColor) {
   // Upper Accent line
   doc.rect(50, 30, 495, 4).fill(primaryColor);

   // Company logo/name
   doc.fillColor(primaryColor)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('CRÉDITO PUENTE', 50, 45);

   doc.fillColor(secondaryColor)
      .fontSize(8)
      .font('Helvetica')
      .text('SOLUCIONES FINANCIERAS EFICACES', 50, 62);

   // Title and metadata
   const isSimulation = !loanId || isNaN(Number(loanId));
   const titleText = isSimulation ? 'PROPUESTA DE PRÉSTAMO' : 'DETALLE Y CRONOGRAMA DE PRÉSTAMO';
   const codeText = isSimulation ? 'SIMULACIÓN' : `PR-${String(loanId).padStart(6, '0')}`;

   doc.fillColor(primaryColor)
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(titleText, 250, 45, { align: 'right', width: 295 });

   const formattedPrintDate = formatDate(new Date());
   doc.fillColor(secondaryColor)
      .fontSize(9)
      .font('Helvetica')
      .text(`Código: ${codeText}   |   Fecha Emisión: ${formattedPrintDate}`, 250, 62, { align: 'right', width: 295 });

   // Separator line
   doc.strokeColor(borderColor)
      .lineWidth(1)
      .moveTo(50, 85)
      .lineTo(545, 85)
      .stroke();
}

/**
 * Helper to draw the client and loan details in 2 columns
 */
function drawInfoGrid(doc, y, loan, client, advisor, investor, primary, secondary, lightBg, border) {
   const boxHeight = 135;
   const colWidth = 240;

   // LEFT BOX - CLIENT DETAILS
   doc.fillColor(lightBg)
      .rect(50, y, colWidth, boxHeight)
      .fill();
   doc.strokeColor(border)
      .lineWidth(1)
      .rect(50, y, colWidth, boxHeight)
      .stroke();

   // Left Box Header
   doc.fillColor(primary)
      .rect(50, y, colWidth, 20)
      .fill();
   doc.fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DATOS DEL CLIENTE', 60, y + 6);

   // Left Box Content
   if (client) {
      doc.fillColor('#2d3748').fontSize(8.5).font('Helvetica');
      let textY = y + 28;
      const lineSpacing = 14;

      doc.font('Helvetica-Bold').text('Nombre: ', 60, textY).font('Helvetica').text(client.nombre || '-', 105, textY);
      textY += lineSpacing;
      doc.font('Helvetica-Bold').text('DNI: ', 60, textY).font('Helvetica').text(client.dni || '-', 105, textY);
      textY += lineSpacing;
      doc.font('Helvetica-Bold').text('Celular: ', 60, textY).font('Helvetica').text(client.celular || '-', 105, textY);
      textY += lineSpacing;
      doc.font('Helvetica-Bold').text('Correo: ', 60, textY).font('Helvetica').text(client.correo || '-', 105, textY);
      textY += lineSpacing;
      doc.font('Helvetica-Bold').text('Dirección: ', 60, textY).font('Helvetica').text(client.direccion || '-', 105, textY, { width: 180, height: 24 });
      textY += lineSpacing + 8;
      doc.font('Helvetica-Bold').text('Ocupación: ', 60, textY).font('Helvetica').text(client.ocupacion || '-', 115, textY);
   } else {
      doc.fillColor(secondary).fontSize(9).font('Helvetica-Oblique').text('Datos de cliente no disponibles.', 60, y + 35);
   }

   // RIGHT BOX - LOAN DETAILS
   const rightX = 305;
   doc.fillColor(lightBg)
      .rect(rightX, y, colWidth, boxHeight)
      .fill();
   doc.strokeColor(border)
      .lineWidth(1)
      .rect(rightX, y, colWidth, boxHeight)
      .stroke();

   // Right Box Header
   doc.fillColor(primary)
      .rect(rightX, y, colWidth, 20)
      .fill();
   doc.fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DETALLES DEL CRÉDITO', rightX + 10, y + 6);

   // Right Box Content
   doc.fillColor('#2d3748').fontSize(8.5).font('Helvetica');
   let rTextY = y + 28;
   const rLineSpacing = 14;

   doc.font('Helvetica-Bold').text('Monto Préstamo: ', rightX + 10, rTextY).font('Helvetica-Bold').fillColor(primary).text(formatCurrency(loan.monto, loan.moneda), rightX + 100, rTextY);
   doc.fillColor('#2d3748'); // Reset color
   rTextY += rLineSpacing;

   // Format interest percentage
   const interestStr = loan.interes ? `${parseFloat(loan.interes)}%` : '-';
   doc.font('Helvetica-Bold').text('Tasa Interés: ', rightX + 10, rTextY).font('Helvetica').text(`${interestStr} mensual`, rightX + 100, rTextY);
   rTextY += rLineSpacing;

   doc.font('Helvetica-Bold').text('Plazo: ', rightX + 10, rTextY).font('Helvetica').text(`${loan.meses || '-'} meses`, rightX + 100, rTextY);
   rTextY += rLineSpacing;

   const pagoFreq = (loan.tipo_pago || 'mensual').toUpperCase();
   doc.font('Helvetica-Bold').text('Frecuencia Pago: ', rightX + 10, rTextY).font('Helvetica').text(pagoFreq, rightX + 100, rTextY);
   rTextY += rLineSpacing;

   doc.font('Helvetica-Bold').text('Pago Cuota: ', rightX + 10, rTextY).font('Helvetica').text(formatCurrency(loan.pago_mensual, loan.moneda), rightX + 100, rTextY);
   rTextY += rLineSpacing;

   doc.font('Helvetica-Bold').text('Total a Pagar: ', rightX + 10, rTextY).font('Helvetica-Bold').text(formatCurrency(loan.pago_total, loan.moneda), rightX + 100, rTextY);
   rTextY += rLineSpacing;

   const dateRangeStr = `${formatDate(loan.fecha_inicio)} al ${formatDate(loan.fecha_fin)}`;
   doc.font('Helvetica-Bold').text('Vigencia: ', rightX + 10, rTextY).font('Helvetica').text(dateRangeStr, rightX + 100, rTextY);
}

/**
 * Helper to draw table headers
 */
function drawTableHeaders(doc, x, y, cols, headerColor) {
   const headerHeight = 20;

   // Draw header background bar
   doc.fillColor(headerColor)
      .rect(x, y, 495, headerHeight)
      .fill();

   doc.fillColor('#ffffff')
      .fontSize(8.5)
      .font('Helvetica-Bold');

   let colX = x;
   cols.forEach(col => {
      // Adjust padding slightly to align vertically in the 20px header
      const textY = y + 5;
      doc.text(col.label, colX, textY, { width: col.width, align: col.align });
      colX += col.width;
   });
}

module.exports = {
   generateLoanPDF
};
